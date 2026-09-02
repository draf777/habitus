import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ForecastService } from './forecast.service';
import { GeoLocation } from './location.service';
import { LocationforecastResponse } from './forecast-evaluation';

const API_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const LOCATION: GeoLocation = { lat: 47.3769, lon: 8.5417, source: 'fallback' };
const EMPTY_RESPONSE: LocationforecastResponse = { properties: { timeseries: [] } };

function cacheKey(location: GeoLocation): string {
  return `forecast-cache:${location.lat.toFixed(4)},${location.lon.toFixed(4)}`;
}

describe('ForecastService', () => {
  let service: ForecastService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ForecastService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('ruft die API auf, wenn noch nichts gecacht ist', async () => {
    const resultPromise = service.getUmbrellaForecast(LOCATION);

    httpMock.expectOne(request => request.url === API_URL).flush(EMPTY_RESPONSE);
    const result = await resultPromise;

    expect(result.umbrellaNeeded).toBe(false);
  });

  it('ruft die API kein zweites Mal auf, solange der Cache gültig ist', async () => {
    const firstCall = service.getUmbrellaForecast(LOCATION);
    httpMock.expectOne(request => request.url === API_URL).flush(EMPTY_RESPONSE);
    await firstCall;

    await service.getUmbrellaForecast(LOCATION);

    httpMock.expectNone(request => request.url === API_URL);
  });

  it('ruft die API erneut auf, wenn der Cache abgelaufen ist', async () => {
    const expiredEntry = { expires: Date.now() - 1000, fetchedAt: Date.now() - 20 * 60 * 1000, body: EMPTY_RESPONSE };
    localStorage.setItem(cacheKey(LOCATION), JSON.stringify(expiredEntry));

    const resultPromise = service.getUmbrellaForecast(LOCATION);

    httpMock.expectOne(request => request.url === API_URL).flush(EMPTY_RESPONSE);
    await resultPromise;
  });

  it('ignoriert Cache-Einträge im alten Format ohne fetchedAt und holt neu', async () => {
    const legacyEntry = { expires: Date.now() + 20 * 60 * 1000, body: EMPTY_RESPONSE };
    localStorage.setItem(cacheKey(LOCATION), JSON.stringify(legacyEntry));

    const resultPromise = service.getUmbrellaForecast(LOCATION);

    httpMock.expectOne(request => request.url === API_URL).flush(EMPTY_RESPONSE);
    await resultPromise;
  });
});
