"use client";

import { Flag, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatStopwatch } from "../lib/format-time";
import { getElapsed } from "../lib/stopwatch-engine";
import type { Stopwatch } from "../lib/types";
import { useNow } from "../lib/use-now";

type Props = {
  stopwatch: Stopwatch;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onLap: () => void;
};

export function StopwatchSection({
  stopwatch,
  onStart,
  onPause,
  onReset,
  onLap,
}: Props) {
  const now = useNow(50, stopwatch.status === "running");
  const elapsed = getElapsed(stopwatch, now);
  const isRunning = stopwatch.status === "running";

  return (
    <section className="space-y-4">
      <Label className="text-base font-semibold">ストップウォッチ</Label>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div
            className="text-center font-mono text-5xl tabular-nums"
            aria-label={`経過 ${formatStopwatch(elapsed)}`}
          >
            {formatStopwatch(elapsed)}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {isRunning ? (
              <Button type="button" variant="outline" onClick={onPause}>
                <Pause className="h-4 w-4" aria-hidden="true" />
                一時停止
              </Button>
            ) : (
              <Button type="button" onClick={onStart}>
                <Play className="h-4 w-4" aria-hidden="true" />
                {stopwatch.accumulatedMs > 0 ? "再開" : "開始"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onLap}
              disabled={!isRunning}
            >
              <Flag className="h-4 w-4" aria-hidden="true" />
              ラップ
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              disabled={stopwatch.status === "idle"}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              リセット
            </Button>
          </div>
        </CardContent>
      </Card>

      {stopwatch.laps.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">ラップ</Label>
          <ol className="space-y-1 rounded-lg border p-3 text-sm">
            {stopwatch.laps
              .map((lap, index) => ({ lap, index }))
              .reverse()
              .map(({ lap, index }) => (
                <li
                  key={lap.id}
                  className="grid grid-cols-[auto_1fr_1fr] gap-3 font-mono tabular-nums"
                >
                  <span className="text-muted-foreground">#{index + 1}</span>
                  <span className="text-right">
                    <span className="mr-2 text-xs text-muted-foreground">
                      split
                    </span>
                    {formatStopwatch(lap.splitMs)}
                  </span>
                  <span className="text-right">
                    <span className="mr-2 text-xs text-muted-foreground">
                      total
                    </span>
                    {formatStopwatch(lap.totalMs)}
                  </span>
                </li>
              ))}
          </ol>
        </div>
      )}
    </section>
  );
}
