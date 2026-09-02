import { Injectable } from '@angular/core';

export interface GeoLocation {
  lat: number;
  lon: number;
  source: 'device' | 'fallback';
}

// Fallback Location: used when the device's position can't be determined.
const FALLBACK_LOCATION: GeoLocation = { lat: 47.3769, lon: 8.5417, source: 'fallback' };

@Injectable({ providedIn: 'root' })
export class LocationService {
  getLocation(): Promise<GeoLocation> {
    if (!('geolocation' in navigator)) {
      return Promise.resolve(FALLBACK_LOCATION);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            source: 'device',
          }),
        () => resolve(FALLBACK_LOCATION),
        { timeout: 10000 },
      );
    });
  }
}
