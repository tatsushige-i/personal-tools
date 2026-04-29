"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DailyForecast, HourlyPoint } from "../lib/types";

type Props = {
  hourly: HourlyPoint[];
  daily: DailyForecast[];
};

const HOUR_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
});

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

function formatHour(isoTime: string): string {
  const d = new Date(isoTime);
  return Number.isNaN(d.getTime()) ? isoTime : HOUR_FORMATTER.format(d);
}

function formatDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(d.getTime()) ? isoDate : WEEKDAY_FORMATTER.format(d);
}

const hourlyConfig = {
  temperature: {
    label: "気温",
    color: "var(--chart-1)",
  },
  precipitation: {
    label: "降水確率",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const dailyConfig = {
  temperatureMax: {
    label: "最高気温",
    color: "var(--chart-1)",
  },
  precipitation: {
    label: "降水確率",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const CHART_CLASS = "h-[260px] w-full";

export function ForecastCharts({ hourly, daily }: Props) {
  const hourlyData = hourly.map((p) => ({
    label: formatHour(p.time),
    temperature: p.temperature,
    precipitation: p.precipitationProbability,
  }));
  const dailyData = daily.map((d) => ({
    label: formatDate(d.date),
    temperatureMax: d.temperatureMax,
    precipitation: d.precipitationProbabilityMax,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>予報グラフ</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly">
          <TabsList>
            <TabsTrigger value="hourly">時間別（気温・降水確率）</TabsTrigger>
            <TabsTrigger value="daily">週間（気温・降水確率）</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="mt-4">
            <ChartContainer config={hourlyConfig} className={CHART_CLASS}>
              <ComposedChart
                data={hourlyData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis
                  yAxisId="temperature"
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  unit="℃"
                />
                <YAxis
                  yAxisId="precipitation"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  unit="%"
                  domain={[0, 100]}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Bar
                  yAxisId="precipitation"
                  dataKey="precipitation"
                  fill="var(--color-precipitation)"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.5}
                />
                <Line
                  yAxisId="temperature"
                  type="monotone"
                  dataKey="temperature"
                  stroke="var(--color-temperature)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="daily" className="mt-4">
            <ChartContainer config={dailyConfig} className={CHART_CLASS}>
              <ComposedChart
                data={dailyData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="temperature"
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  unit="℃"
                />
                <YAxis
                  yAxisId="precipitation"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  unit="%"
                  domain={[0, 100]}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Bar
                  yAxisId="precipitation"
                  dataKey="precipitation"
                  fill="var(--color-precipitation)"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.5}
                />
                <Line
                  yAxisId="temperature"
                  type="monotone"
                  dataKey="temperatureMax"
                  stroke="var(--color-temperatureMax)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
