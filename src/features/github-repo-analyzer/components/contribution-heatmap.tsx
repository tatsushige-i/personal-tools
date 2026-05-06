"use client";

import { useState, type MouseEvent as ReactMouseEvent } from "react";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContributionCalendar } from "../lib/use-contribution-calendar";
import type {
  ContributionCalendar,
  ContributionDay,
  ContributionLevel,
} from "../lib/types";

const CELL_SIZE = 12;
const CELL_GAP = 3;
const STEP = CELL_SIZE + CELL_GAP;
const PLACEHOLDER_WEEKS = 53;
const DAYS_PER_WEEK = 7;
const AXIS_LEFT = 28;
const AXIS_TOP = 20;
const AXIS_RIGHT = 24;
const AXIS_FONT_SIZE = 10;
const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: "月",
  3: "水",
  5: "金",
};

const LEVEL_FILL: Record<ContributionLevel, string> = {
  0: "fill-muted",
  1: "fill-emerald-200 dark:fill-emerald-900",
  2: "fill-emerald-400 dark:fill-emerald-700",
  3: "fill-emerald-600 dark:fill-emerald-500",
  4: "fill-emerald-800 dark:fill-emerald-300",
};

type Props = {
  username: string;
};

export function ContributionHeatmap({ username }: Props) {
  const { calendar, error, loading } = useContributionCalendar(username);

  if (!username) return null;

  const isNoToken = error?.errorCode === "NO_AUTH_TOKEN";
  const isOtherError = error && !isNoToken;

  return (
    <Card>
      <CardHeader>
        <CardTitle>コントリビューション</CardTitle>
        <CardDescription>
          {calendar
            ? `直近1年で ${calendar.totalContributions.toLocaleString()} コントリビューション`
            : "GitHub プロフィールと同様の 52週 × 7日のヒートマップを表示します。"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <Skeleton
            className="w-full"
            style={{ height: DAYS_PER_WEEK * STEP - CELL_GAP }}
          />
        )}

        {isNoToken && (
          <div className="space-y-3">
            <div
              aria-hidden="true"
              className="overflow-x-auto opacity-30 grayscale"
            >
              <PlaceholderGrid />
            </div>
            <Alert role="status">
              <Info className="size-4" />
              <AlertTitle>GITHUB_TOKEN が未設定です</AlertTitle>
              <AlertDescription>
                ヒートマップを表示するには <code>.env.local</code> に{" "}
                <code>GITHUB_TOKEN</code> を設定してください。リポジトリ一覧などの既存機能はそのまま利用できます。
              </AlertDescription>
            </Alert>
          </div>
        )}

        {isOtherError && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="size-4" />
            <AlertTitle>コントリビューションの取得に失敗しました</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {calendar && <CalendarGrid calendar={calendar} />}
      </CardContent>
    </Card>
  );
}

function CalendarGrid({ calendar }: { calendar: ContributionCalendar }) {
  const weeks = calendar.weeks;
  const width = AXIS_LEFT + weeks.length * STEP - CELL_GAP + AXIS_RIGHT;
  const height = AXIS_TOP + DAYS_PER_WEEK * STEP - CELL_GAP;
  const monthLabels = computeMonthLabels(calendar);

  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const showTooltip = (
    e: ReactMouseEvent<SVGRectElement>,
    day: ContributionDay
  ) => {
    setTooltip({
      text: `${day.date}: ${day.count.toLocaleString()} contributions`,
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <svg
          role="img"
          aria-label={`${calendar.totalContributions} contributions in the last year`}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
        >
          {monthLabels.map((m) => (
            <text
              key={`month-${m.weekIndex}`}
              x={AXIS_LEFT + m.weekIndex * STEP}
              y={AXIS_TOP - 6}
              fontSize={AXIS_FONT_SIZE}
              className="fill-muted-foreground"
            >
              {m.label}
            </text>
          ))}

          {Object.entries(DAY_OF_WEEK_LABELS).map(([dayIndex, label]) => (
            <text
              key={`day-${dayIndex}`}
              x={AXIS_LEFT - 4}
              y={
                AXIS_TOP + Number(dayIndex) * STEP + CELL_SIZE - 2
              }
              fontSize={AXIS_FONT_SIZE}
              textAnchor="end"
              className="fill-muted-foreground"
            >
              {label}
            </text>
          ))}

          {weeks.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => (
              <rect
                key={`${weekIndex}-${dayIndex}`}
                x={AXIS_LEFT + weekIndex * STEP}
                y={AXIS_TOP + dayIndex * STEP}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                ry={2}
                className={LEVEL_FILL[day.level]}
                onMouseEnter={(e) => showTooltip(e, day)}
                onMouseMove={(e) => showTooltip(e, day)}
                onMouseLeave={() => setTooltip(null)}
              />
            ))
          )}
        </svg>
      </div>
      <Legend />
      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

function computeMonthLabels(
  calendar: ContributionCalendar
): { weekIndex: number; label: string }[] {
  const labels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  calendar.weeks.forEach((week, weekIndex) => {
    const firstDay = week.days[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date).getMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      labels.push({ weekIndex, label: `${month + 1}月` });
    }
  });
  // Drop the first label if it would overlap the y-axis (typically week 0)
  // and the second label is close — keeps the axis readable.
  if (labels.length >= 2 && labels[1].weekIndex - labels[0].weekIndex < 3) {
    labels.shift();
  }
  return labels;
}

function Legend() {
  const levels: ContributionLevel[] = [0, 1, 2, 3, 4];
  const legendCell = 10;
  const legendGap = 2;
  const legendWidth = levels.length * (legendCell + legendGap) - legendGap;

  return (
    <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
      <span>少ない</span>
      <svg
        aria-hidden="true"
        width={legendWidth}
        height={legendCell}
        viewBox={`0 0 ${legendWidth} ${legendCell}`}
        className="block"
      >
        {levels.map((level, i) => (
          <rect
            key={level}
            x={i * (legendCell + legendGap)}
            y={0}
            width={legendCell}
            height={legendCell}
            rx={2}
            ry={2}
            className={LEVEL_FILL[level]}
          />
        ))}
      </svg>
      <span>多い</span>
    </div>
  );
}

function PlaceholderGrid() {
  const width = PLACEHOLDER_WEEKS * STEP - CELL_GAP;
  const height = DAYS_PER_WEEK * STEP - CELL_GAP;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block"
    >
      {Array.from({ length: PLACEHOLDER_WEEKS }).map((_, weekIndex) =>
        Array.from({ length: DAYS_PER_WEEK }).map((_, dayIndex) => (
          <rect
            key={`${weekIndex}-${dayIndex}`}
            x={weekIndex * STEP}
            y={dayIndex * STEP}
            width={CELL_SIZE}
            height={CELL_SIZE}
            rx={2}
            ry={2}
            className="fill-muted"
          />
        ))
      )}
    </svg>
  );
}
