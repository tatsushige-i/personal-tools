"use client";

import { Pause, Play, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getDisplayRemaining } from "../lib/timer-engine";
import type { Timer } from "../lib/types";
import { formatTimer } from "../lib/format-time";
import { useNow } from "../lib/use-now";

type Props = {
  timer: Timer;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
};

export function TimerCard({ timer, onStart, onPause, onReset, onRemove }: Props) {
  const now = useNow(100, timer.status === "running");
  const remaining = getDisplayRemaining(timer, now);
  const isRunning = timer.status === "running";
  const isCompleted = timer.status === "completed";

  return (
    <Card
      className={cn(
        "transition-colors",
        isCompleted && "border-primary bg-primary/5",
      )}
    >
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{timer.title}</span>
            {isCompleted && <Badge variant="default">終了</Badge>}
          </div>
          <div
            className={cn(
              "font-mono text-3xl tabular-nums",
              isCompleted && "text-primary",
            )}
            aria-label={`残り ${formatTimer(remaining)}`}
          >
            {formatTimer(remaining)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isRunning ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPause(timer.id)}
              aria-label="一時停止"
            >
              <Pause className="h-4 w-4" aria-hidden="true" />
              一時停止
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => onStart(timer.id)}
              disabled={isCompleted}
              aria-label="開始"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              開始
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onReset(timer.id)}
            aria-label="リセット"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            リセット
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(timer.id)}
            aria-label="削除"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
