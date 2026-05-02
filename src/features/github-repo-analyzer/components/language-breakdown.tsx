"use client";

import { computeLanguagePercentages } from "../lib/format";
import type { LanguageBreakdown as LanguageBreakdownData } from "../lib/types";

type Props = {
  languages: LanguageBreakdownData;
};

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function LanguageBreakdown({ languages }: Props) {
  const entries = computeLanguagePercentages(languages);
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        言語情報はありません。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label="言語比率"
      >
        {entries.map((entry, index) => (
          <span
            key={entry.language}
            className="h-full"
            style={{
              width: `${entry.percentage}%`,
              backgroundColor: COLORS[index % COLORS.length],
            }}
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
        {entries.map((entry, index) => (
          <li key={entry.language} className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
              aria-hidden="true"
            />
            <span className="truncate">{entry.language}</span>
            <span className="text-muted-foreground">
              {entry.percentage.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
