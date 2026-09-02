import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocationService } from './location.service';

const originalGeolocation = navigator.geolocation;

function stubGeolocation(value: unknown): void {
  if (value === undefined) {
    delete (navigator as { geolocation?: unknown }).geolocation;
    return;
  }
  Object.defineProperty(navigator, 'geolocation', { value, configurable: true });
}

describe('LocationService', () => {
  afterEach(() => {
    stubGeolocation(originalGeolocation);
    vi.restoreAllMocks();
  });

  it('liefert Zürich als Fallback, wenn der Browser Geolocation nicht unterstützt', async () => {
    stubGeolocation(undefined);
    const service = new LocationService();

    const location = await service.getLocation();

    expect(location).toEqual({ lat: 47.3769, lon: 8.5417, source: 'fallback' });
  });

  it('liefert die Geräteposition, wenn die Freigabe erteilt wurde', async () => {
    stubGeolocation({
      getCurrentPosition: (success: PositionCallback) =>
        success({ coords: { latitude: 46.948, longitude: 7.4474 } } as GeolocationPosition),
    });
    const service = new LocationService();

    const location = await service.getLocation();

    expect(location).toEqual({ lat: 46.948, lon: 7.4474, source: 'device' });
  });

  it('liefert Zürich als Fallback, wenn die Standortabfrage fehlschlägt', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    stubGeolocation({
      getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
        error({ code: 1, message: 'Nutzer hat abgelehnt' } as GeolocationPositionError),
    });
    const service = new LocationService();

    const location = await service.getLocation();

    expect(location).toEqual({ lat: 47.3769, lon: 8.5417, source: 'fallback' });
  });
});
