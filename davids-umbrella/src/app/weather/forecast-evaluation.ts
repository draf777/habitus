// Only the fields we actually read from met.no's Locationforecast 2.0 "compact" response.
export interface LocationforecastResponse {
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

export interface ForecastEvaluation {
  umbrellaNeeded: boolean;
  currentTemperature: number | null;
}

// Umbrella Need: a hint of rain this small is treated as noise, not a reason to grab an umbrella.
const PRECIPITATION_THRESHOLD_MM = 0.1;

// `now` is a parameter (not read internally) so tests can pin the reference time instead of depending on the wall clock.
export function evaluateForecast(body: LocationforecastResponse, now: Date = new Date()): ForecastEvaluation {
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
