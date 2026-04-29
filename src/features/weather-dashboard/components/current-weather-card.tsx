import { Droplets, Thermometer, Umbrella, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CurrentWeather } from "../lib/types";
import { describeWeatherCode } from "../lib/weather-summary";
import { WeatherIcon } from "./weather-icon";

type Props = {
  current: CurrentWeather;
  locationLabel: string;
};

export function CurrentWeatherCard({ current, locationLabel }: Props) {
  const stats: Array<{
    label: string;
    value: string;
    icon: typeof Thermometer;
  }> = [
    {
      label: "気温",
      value: `${current.temperature.toFixed(1)} ℃`,
      icon: Thermometer,
    },
    {
      label: "降水確率",
      value: `${current.precipitationProbability}%`,
      icon: Umbrella,
    },
    {
      label: "湿度",
      value: `${current.humidity}%`,
      icon: Droplets,
    },
    {
      label: "風速",
      value: `${current.windSpeed.toFixed(1)} m/s`,
      icon: Wind,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <WeatherIcon code={current.weatherCode} className="h-7 w-7" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-normal text-muted-foreground">
              {locationLabel}の現在の天気
            </span>
            <span className="text-xl">{describeWeatherCode(current.weatherCode)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-start gap-2 rounded-lg border bg-card p-3"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">{label}</span>
              </div>
              <span className="text-2xl font-semibold tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
