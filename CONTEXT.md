# Davids Umbrella

A single-purpose PWA that tells the user whether they need an umbrella for the rest of the day, based on a weather forecast.

## Language

**Umbrella Need**:
The yes/no verdict shown to the user, derived from whether any hour in the Today Window is forecast to bring more than a small amount of precipitation.
_Avoid_: rain today, forecast result, weather status

**Today Window**:
The remaining hours of the current calendar day, from now until midnight local time. This is the span of the forecast that determines the Umbrella Need — forecast data beyond it (e.g. tomorrow's rain) is not considered.
_Avoid_: next 24 hours, forecast range

**Location**:
The geographic point a forecast is fetched for: the device's browser-reported position when available, otherwise the Fallback Location.
_Avoid_: coordinates, position

**Fallback Location**:
The fixed point (Zürich) used as the Location when the device's position can't be determined (permission denied or unavailable).
_Avoid_: default city, default location
