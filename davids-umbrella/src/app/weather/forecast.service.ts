import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GeoLocation } from './location.service';

// Only the fields we actually read from met.no's Locationforecast 2.0 "compact" response.
interface LocationforecastResponse {
  properties: {
    timeseries: {
      time: string;
      data: {
        instant: { details: { air_temperature?: number } };
        next_1_hours?: {
          details: { precipitation_amount?: number };
        };
      };
    }[];
  };
}

interface CacheEntry {
  expires: number;
  fetchedAt: number;
  body: LocationforecastResponse;
}

export interface UmbrellaForecast {
  umbrellaNeeded: boolean;
  currentTemperature: number | null;
  fetchedAt: number;
}

// Umbrella Need: a hint of rain this small is treated as noise, not a reason to grab an umbrella.
const PRECIPITATION_THRESHOLD_MM = 0.1;

// Reduces API calls on reload/refocus; the forecast doesn't change meaningfully within this window anyway.
const CACHE_TTL_MS = 15 * 60 * 1000;

const API_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

@Injectable({ providedIn: 'root' })
export class ForecastService {
  private readonly http = inject(HttpClient);

  async getUmbrellaForecast(location: GeoLocation): Promise<UmbrellaForecast> {
    const { body, fetchedAt } = await this.getForecastBody(location);
    return { ...this.evaluate(body), fetchedAt };
  }

  private async getForecastBody(location: GeoLocation): Promise<{ body: LocationforecastResponse; fetchedAt: number }> {
    const cacheKey = this.cacheKey(location);
    const cached = this.readCache(cacheKey);
    if (cached) {
      return cached;
    }

    const body = await firstValueFrom(
      this.http.get<LocationforecastResponse>(API_URL, {
        params: { lat: location.lat.toFixed(4), lon: location.lon.toFixed(4) },
      }),
    );

    const fetchedAt = Date.now();
    this.writeCache(cacheKey, body, fetchedAt);
    return { body, fetchedAt };
  }

  private evaluate(body: LocationforecastResponse): Omit<UmbrellaForecast, 'fetchedAt'> {
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    let umbrellaNeeded = false;
    let currentTemperature: number | null = null;

    for (const entry of body.properties.timeseries) {
      const time = new Date(entry.time);
      if (time < now || time > endOfToday) {
        continue;
      }

      if (currentTemperature === null && entry.data.instant.details.air_temperature !== undefined) {
        currentTemperature = entry.data.instant.details.air_temperature;
      }

      const precipitation = entry.data.next_1_hours?.details.precipitation_amount;
      if (precipitation !== undefined && precipitation > PRECIPITATION_THRESHOLD_MM) {
        umbrellaNeeded = true;
      }
    }

    return { umbrellaNeeded, currentTemperature };
  }

  private cacheKey(location: GeoLocation): string {
    return `forecast-cache:${location.lat.toFixed(4)},${location.lon.toFixed(4)}`;
  }

  private readCache(key: string): { body: LocationforecastResponse; fetchedAt: number } | null {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const entry: CacheEntry = JSON.parse(raw);
    if (typeof entry.fetchedAt !== 'number' || Date.now() >= entry.expires) {
      localStorage.removeItem(key);
      return null;
    }

    return { body: entry.body, fetchedAt: entry.fetchedAt };
  }

  private writeCache(key: string, body: LocationforecastResponse, fetchedAt: number): void {
    const entry: CacheEntry = { expires: fetchedAt + CACHE_TTL_MS, fetchedAt, body };
    localStorage.setItem(key, JSON.stringify(entry));
  }
}
