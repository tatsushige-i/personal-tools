"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { CurrencyCode, Timeseries } from "../lib/types";

type Props = {
  base: CurrencyCode;
  target: CurrencyCode;
  history: Timeseries | null;
  loading: boolean;
};

function formatLabel(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  return `${match[2]}/${match[3]}`;
}

const CHART_CLASS = "h-[260px] w-full";

export function RateHistoryChart({ base, target, history, loading }: Props) {
  const config = {
    rate: {
      label: `${base} → ${target}`,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const data = history
    ? history.points.map((p) => ({
        label: formatLabel(p.date),
        rate: p.rate,
      }))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>過去30日のレート推移（{base} → {target}）</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            推移データがありません。
          </p>
        ) : (
          <ChartContainer config={config} className={CHART_CLASS}>
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                domain={["auto", "auto"]}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--color-rate)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
