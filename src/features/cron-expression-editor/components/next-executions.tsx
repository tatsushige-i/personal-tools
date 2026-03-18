"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { COMMON_TIMEZONES } from "../lib/timezones";

type NextExecutionsProps = {
  executions: Date[];
  timezone: string;
  onTimezoneChange: (tz: string) => void;
};

function formatDate(date: Date, timezone: string): string {
  return date.toLocaleString("ja-JP", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
  });
}

export function NextExecutions({ executions, timezone, onTimezoneChange }: NextExecutionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">次回実行予定</h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="timezone-select" className="text-sm whitespace-nowrap">
            タイムゾーン
          </Label>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger id="timezone-select" className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {executions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          有効なCron式を入力すると次回実行予定が表示されます
        </p>
      ) : (
        <ol className="space-y-1 font-mono text-sm">
          {executions.map((date, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-6 text-right text-muted-foreground">{i + 1}.</span>
              <span>{formatDate(date, timezone)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
