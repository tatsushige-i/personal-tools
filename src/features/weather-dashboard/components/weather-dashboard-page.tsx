"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchForecast, WeatherError } from "../lib/weather-client";
import { useGeolocation } from "../lib/use-geolocation";
import type {
  ApiErrorCode,
  GeocodingResult,
  WeatherForecast,
} from "../lib/types";
import { CurrentWeatherCard } from "./current-weather-card";
import { DailyForecastList } from "./daily-forecast-list";
import { ForecastCharts } from "./forecast-charts";
import { LocationPicker } from "./location-picker";
import { UmbrellaSummary } from "./umbrella-summary";

type Location = {
  latitude: number;
  longitude: number;
  label: string;
};

type ErrorState = {
  message: string;
  errorCode?: ApiErrorCode;
} | null;

type ForecastResult = {
  forecast: WeatherForecast;
  locationKey: string;
};

type ErrorResult = {
  error: NonNullable<ErrorState>;
  locationKey: string;
};

function locationKeyOf(location: Location): string {
  return `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
}

export function WeatherDashboardPage() {
  const geo = useGeolocation();
  const [manualLocation, setManualLocation] = useState<Location | null>(null);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [errorResult, setErrorResult] = useState<ErrorResult | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const location: Location | null = useMemo(() => {
    if (manualLocation) return manualLocation;
    if (geo.status === "granted" && geo.coords) {
      return {
        latitude: geo.coords.latitude,
        longitude: geo.coords.longitude,
        label: "現在地",
      };
    }
    return null;
  }, [manualLocation, geo.status, geo.coords]);

  const currentKey = location
    ? `${locationKeyOf(location)}#${refetchToken}`
    : null;
  const forecast =
    forecastResult && currentKey === forecastResult.locationKey
      ? forecastResult.forecast
      : null;
  const error =
    errorResult && currentKey === errorResult.locationKey
      ? errorResult.error
      : null;
  const loading = location !== null && forecast === null && error === null;

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    const key = `${locationKeyOf(location)}#${refetchToken}`;
    fetchForecast(location.latitude, location.longitude)
      .then((data) => {
        if (cancelled) return;
        setForecastResult({ forecast: data, locationKey: key });
        setErrorResult(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const err: NonNullable<ErrorState> =
          e instanceof WeatherError
            ? { message: e.message, errorCode: e.errorCode }
            : {
                message:
                  e instanceof Error
                    ? e.message
                    : "天気情報の取得に失敗しました。",
              };
        setErrorResult({ error: err, locationKey: key });
      });
    return () => {
      cancelled = true;
    };
  }, [location, refetchToken]);

  const handleSelectCity = useCallback((result: GeocodingResult) => {
    const subtitle = [result.admin1, result.country].filter(Boolean).join(", ");
    setManualLocation({
      latitude: result.latitude,
      longitude: result.longitude,
      label: subtitle ? `${result.name}（${subtitle}）` : result.name,
    });
    setRefetchToken((token) => token + 1);
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    setManualLocation(null);
    setRefetchToken((token) => token + 1);
    geo.request();
  }, [geo]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weather Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          現在の天気と週間予報を表示します。Open-Meteo APIを使用しています。
        </p>
      </div>

      <LocationPicker
        onSelect={handleSelectCity}
        onUseCurrentLocation={handleUseCurrentLocation}
        geolocationDisabled={
          geo.status === "loading" || geo.status === "unsupported"
        }
      />

      {geo.status === "loading" && !location && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          現在地を取得中...
        </p>
      )}

      {geo.status === "denied" && !location && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>位置情報の取得が許可されていません</AlertTitle>
          <AlertDescription>
            都市名で検索するか、ブラウザの設定で位置情報を許可してください。
          </AlertDescription>
        </Alert>
      )}

      {geo.status === "unsupported" && !location && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>このブラウザでは位置情報を利用できません</AlertTitle>
          <AlertDescription>都市名で検索してご利用ください。</AlertDescription>
        </Alert>
      )}

      {geo.status === "error" && !location && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>位置情報の取得に失敗しました</AlertTitle>
          <AlertDescription>
            {geo.errorMessage ?? "都市名で検索してください。"}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      )}

      {forecast && location && (
        <div className="space-y-6">
          <UmbrellaSummary today={forecast.daily[0]} />
          <CurrentWeatherCard
            current={forecast.current}
            locationLabel={location.label}
          />
          <ForecastCharts hourly={forecast.hourly} daily={forecast.daily} />
          <DailyForecastList daily={forecast.daily} />
        </div>
      )}
    </div>
  );
}
