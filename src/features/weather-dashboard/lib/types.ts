export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "SERVER_ERROR";

export type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

export type GeocodingResponse = {
  results: GeocodingResult[];
};

export type CurrentWeather = {
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
  time: string;
};

export type HourlyPoint = {
  time: string;
  temperature: number;
  precipitationProbability: number;
};

export type DailyForecast = {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbabilityMax: number;
};

export type WeatherForecast = {
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyForecast[];
};
