import { NextResponse } from "next/server";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";
import type {
  GeocodingResponse,
  GeocodingResult,
  WeatherForecast,
} from "@/features/weather-dashboard/lib/types";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

const MAX_QUERY_LENGTH = 100;

const rateLimit = createRateLimit({ limit: 30, windowMs: 60_000 });

export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (ip !== "unknown") {
    const result = rateLimit.check(ip);
    if (!result.allowed) {
      return rateLimitResponse(result.retryAfterMs);
    }
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  if (mode === "forecast") {
    return handleForecast(searchParams);
  }
  if (mode === "geocode") {
    return handleGeocode(searchParams);
  }
  return NextResponse.json(
    { error: "mode は forecast または geocode を指定してください。", errorCode: "VALIDATION_ERROR" },
    { status: 400 }
  );
}

async function handleForecast(params: URLSearchParams): Promise<Response> {
  const latStr = params.get("lat");
  const lonStr = params.get("lon");
  const lat = latStr ? Number(latStr) : NaN;
  const lon = lonStr ? Number(lonStr) : NaN;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json(
      { error: "緯度・経度の指定が不正です。", errorCode: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code"
  );
  url.searchParams.set("hourly", "temperature_2m,precipitation_probability");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("forecast_hours", "24");

  let upstream: Response;
  try {
    upstream = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    return NextResponse.json(
      { error: "天気サービスに接続できませんでした。", errorCode: "UPSTREAM_ERROR" },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "天気データの取得に失敗しました。", errorCode: "UPSTREAM_ERROR" },
      { status: 502 }
    );
  }

  const raw = (await upstream.json()) as OpenMeteoForecastResponse;
  const forecast = mapForecast(raw);
  return NextResponse.json(forecast);
}

async function handleGeocode(params: URLSearchParams): Promise<Response> {
  const query = params.get("q")?.trim() ?? "";
  if (query.length === 0 || query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: "検索キーワードは1〜100文字で指定してください。", errorCode: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "ja");
  url.searchParams.set("format", "json");

  let upstream: Response;
  try {
    upstream = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    return NextResponse.json(
      { error: "都市検索サービスに接続できませんでした。", errorCode: "UPSTREAM_ERROR" },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "都市検索に失敗しました。", errorCode: "UPSTREAM_ERROR" },
      { status: 502 }
    );
  }

  const raw = (await upstream.json()) as OpenMeteoGeocodingResponse;
  const response: GeocodingResponse = {
    results: (raw.results ?? []).map(mapGeocodingResult),
  };
  return NextResponse.json(response);
}

type OpenMeteoForecastResponse = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation_probability: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
};

type OpenMeteoGeocodingResponse = {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }>;
};

function mapForecast(raw: OpenMeteoForecastResponse): WeatherForecast {
  const hourly: WeatherForecast["hourly"] = raw.hourly.time.map((time, idx) => ({
    time,
    temperature: raw.hourly.temperature_2m[idx],
    precipitationProbability: raw.hourly.precipitation_probability[idx] ?? 0,
  }));
  const daily: WeatherForecast["daily"] = raw.daily.time.map((date, idx) => ({
    date,
    weatherCode: raw.daily.weather_code[idx],
    temperatureMax: raw.daily.temperature_2m_max[idx],
    temperatureMin: raw.daily.temperature_2m_min[idx],
    precipitationProbabilityMax: raw.daily.precipitation_probability_max[idx] ?? 0,
  }));
  return {
    timezone: raw.timezone,
    current: {
      time: raw.current.time,
      temperature: raw.current.temperature_2m,
      humidity: raw.current.relative_humidity_2m,
      precipitationProbability: raw.current.precipitation_probability ?? 0,
      windSpeed: raw.current.wind_speed_10m,
      weatherCode: raw.current.weather_code,
    },
    hourly,
    daily,
  };
}

function mapGeocodingResult(raw: NonNullable<OpenMeteoGeocodingResponse["results"]>[number]): GeocodingResult {
  return {
    id: raw.id,
    name: raw.name,
    latitude: raw.latitude,
    longitude: raw.longitude,
    country: raw.country,
    admin1: raw.admin1,
  };
}
