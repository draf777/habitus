import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GeoLocation } from './location.service';

interface NominatimReverseResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
  };
}

interface CacheEntry {
  expires: number;
  placeName: string;
}

const API_URL = 'https://nominatim.openstreetmap.org/reverse';

// Place names rarely change; cache aggressively to stay within Nominatim's usage policy (max 1 req/s).
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);

  async resolvePlaceName(location: GeoLocation): Promise<string | null> {
    const cacheKey = this.cacheKey(location);
    const cached = this.readCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<NominatimReverseResponse>(API_URL, {
          params: { format: 'json', lat: location.lat.toFixed(4), lon: location.lon.toFixed(4), zoom: '10' },
        }),
      );

      const address = response.address;
      const placeName = address?.city ?? address?.town ?? address?.village ?? address?.municipality ?? address?.county ?? null;
      if (placeName) {
        this.writeCache(cacheKey, placeName);
      }
      return placeName;
    } catch {
      return null;
    }
  }

  private cacheKey(location: GeoLocation): string {
    return `geocode-cache:${location.lat.toFixed(4)},${location.lon.toFixed(4)}`;
  }

  private readCache(key: string): string | null {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() >= entry.expires) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.placeName;
  }

  private writeCache(key: string, placeName: string): void {
    const entry: CacheEntry = { expires: Date.now() + CACHE_TTL_MS, placeName };
    localStorage.setItem(key, JSON.stringify(entry));
  }
}
