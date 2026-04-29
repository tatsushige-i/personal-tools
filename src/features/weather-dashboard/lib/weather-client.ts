import type {
  ApiErrorCode,
  GeocodingResponse,
  WeatherForecast,
} from "./types";

export class WeatherError extends Error {
  readonly errorCode: ApiErrorCode | undefined;

  constructor(message: string, errorCode?: ApiErrorCode) {
    super(message);
    this.name = "WeatherError";
    this.errorCode = errorCode;
  }
}

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error ?? `リクエストに失敗しました。（${res.status}）`;
    throw new WeatherError(message, body?.errorCode);
  }
  return res.json() as Promise<T>;
}

export function fetchForecast(
  latitude: number,
  longitude: number
): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    mode: "forecast",
    lat: String(latitude),
    lon: String(longitude),
  });
  return request<WeatherForecast>(`/api/weather?${params.toString()}`);
}

export function searchCities(query: string): Promise<GeocodingResponse> {
  const params = new URLSearchParams({ mode: "geocode", q: query });
  return request<GeocodingResponse>(`/api/weather?${params.toString()}`);
}
