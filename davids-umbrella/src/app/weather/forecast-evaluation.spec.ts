import { describe, expect, it } from 'vitest';
import { evaluateForecast, LocationforecastResponse } from './forecast-evaluation';

function forecastWith(entries: { time: string; precipitation?: number; temperature?: number }[]): LocationforecastResponse {
  return {
    properties: {
      timeseries: entries.map(({ time, precipitation, temperature }) => ({
        time,
        data: {
          instant: { details: { air_temperature: temperature } },
          next_1_hours: precipitation === undefined ? undefined : { details: { precipitation_amount: precipitation } },
        },
      })),
    },
  };
}

describe('evaluateForecast', () => {
  // No "Z" suffix on purpose: "now" and the fixture times must share the same (local) frame of
  // reference as evaluateForecast's own end-of-day boundary, or the midnight test becomes timezone-dependent.
  const now = new Date('2026-09-02T10:00:00');

  it('zeigt an, dass ein Schirm nötig ist, wenn es heute noch regnet', () => {
    const forecast = forecastWith([{ time: '2026-09-02T12:00:00', precipitation: 1.5, temperature: 18 }]);

    const result = evaluateForecast(forecast, now);

    expect(result.umbrellaNeeded).toBe(true);
  });

  it('zeigt an, dass kein Schirm nötig ist, wenn es heute nicht mehr regnet', () => {
    const forecast = forecastWith([
      { time: '2026-09-02T12:00:00', precipitation: 0, temperature: 18 },
      { time: '2026-09-02T18:00:00', temperature: 16 },
    ]);

    const result = evaluateForecast(forecast, now);

    expect(result.umbrellaNeeded).toBe(false);
  });

  it('ignoriert Regen nach Mitternacht, der schon zum nächsten Tag gehört', () => {
    const forecast = forecastWith([
      { time: '2026-09-02T12:00:00', precipitation: 0, temperature: 18 },
      { time: '2026-09-03T01:00:00', precipitation: 5, temperature: 12 },
    ]);

    const result = evaluateForecast(forecast, now);

    expect(result.umbrellaNeeded).toBe(false);
  });

  it('ignoriert Einträge, die bereits in der Vergangenheit liegen', () => {
    const forecast = forecastWith([
      { time: '2026-09-02T08:00:00', precipitation: 5, temperature: 20 },
      { time: '2026-09-02T12:00:00', precipitation: 0, temperature: 18 },
    ]);

    const result = evaluateForecast(forecast, now);

    expect(result.umbrellaNeeded).toBe(false);
  });

  it('löst noch keinen Schirm aus, wenn der Niederschlag genau der Rausch-Schwelle entspricht', () => {
    const forecast = forecastWith([{ time: '2026-09-02T12:00:00', precipitation: 0.1, temperature: 18 }]);

    const result = evaluateForecast(forecast, now);

    expect(result.umbrellaNeeded).toBe(false);
  });

  it('übernimmt die Temperatur des ersten Eintrags im Zeitfenster', () => {
    const forecast = forecastWith([
      { time: '2026-09-02T11:00:00', temperature: 19 },
      { time: '2026-09-02T12:00:00', temperature: 25 },
    ]);

    const result = evaluateForecast(forecast, now);

    expect(result.currentTemperature).toBe(19);
  });

  it('liefert null als Temperatur, wenn keine Messung im Zeitfenster vorhanden ist', () => {
    const forecast = forecastWith([{ time: '2026-09-02T12:00:00', precipitation: 0 }]);

    const result = evaluateForecast(forecast, now);

    expect(result.currentTemperature).toBeNull();
  });
});
