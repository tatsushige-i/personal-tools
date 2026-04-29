import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyForecast } from "../lib/types";
import { describeWeatherCode } from "../lib/weather-summary";
import { WeatherIcon } from "./weather-icon";

type Props = {
  daily: DailyForecast[];
};

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
  timeZone: "UTC",
});

function formatDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return Number.isNaN(date.getTime()) ? isoDate : WEEKDAY_FORMATTER.format(date);
}

const ROW_GRID =
  "grid grid-cols-[6rem_auto_1fr_4rem_6rem] items-center gap-3";

export function DailyForecastList({ daily }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>週間予報</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`${ROW_GRID} border-b pb-2 text-xs font-medium text-muted-foreground`}
        >
          <span>日付</span>
          <span className="col-span-2">天気</span>
          <span className="text-right">降水</span>
          <span className="text-right">気温</span>
        </div>
        <ul className="divide-y">
          {daily.map((day) => (
            <li key={day.date} className={`${ROW_GRID} py-2 text-sm`}>
              <span className="font-medium">{formatDate(day.date)}</span>
              <WeatherIcon
                code={day.weatherCode}
                className="h-5 w-5 text-muted-foreground"
              />
              <span className="text-muted-foreground">
                {describeWeatherCode(day.weatherCode)}
              </span>
              <span className="tabular-nums text-right text-muted-foreground">
                {day.precipitationProbabilityMax}%
              </span>
              <span className="tabular-nums text-right">
                <span className="inline-block w-8 text-right text-blue-600 dark:text-blue-400">
                  {day.temperatureMin.toFixed(0)}°
                </span>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="inline-block w-8 text-left text-red-600 dark:text-red-400">
                  {day.temperatureMax.toFixed(0)}°
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
