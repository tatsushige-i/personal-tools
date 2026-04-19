"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Timer } from "../lib/types";
import { PresetButtons } from "./preset-buttons";
import { TimerCard } from "./timer-card";

type Props = {
  timers: Timer[];
  onAdd: (title: string, durationMs: number) => void;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
};

export function TimerSection({
  timers,
  onAdd,
  onStart,
  onPause,
  onReset,
  onRemove,
}: Props) {
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");

  const handleAddCustom = () => {
    const mins = Number.parseInt(minutes, 10);
    const secs = Number.parseInt(seconds, 10);
    const totalMs =
      (Number.isFinite(mins) ? Math.max(0, mins) : 0) * 60_000 +
      (Number.isFinite(secs) ? Math.max(0, secs) : 0) * 1_000;
    if (totalMs <= 0) return;
    onAdd(title, totalMs);
    setTitle("");
  };

  return (
    <section className="space-y-4">
      <Label className="text-base font-semibold">タイマー</Label>

      <div className="space-y-3 rounded-lg border p-4">
        <PresetButtons onSelect={(t, d) => onAdd(t, d)} />

        <div className="space-y-1.5">
          <Label htmlFor="timer-title" className="text-sm">
            タイトル（任意）
          </Label>
          <Input
            id="timer-title"
            placeholder="例: 洗濯 / パスタ茹で"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="timer-minutes" className="text-sm">
              分
            </Label>
            <Input
              id="timer-minutes"
              type="number"
              inputMode="numeric"
              min={0}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timer-seconds" className="text-sm">
              秒
            </Label>
            <Input
              id="timer-seconds"
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
            />
          </div>
        </div>

        <Button type="button" onClick={handleAddCustom} className="w-full">
          <Plus className="h-4 w-4" aria-hidden="true" />
          タイマーを追加
        </Button>
      </div>

      {timers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          タイマーを追加すると、ここに表示されます。
        </p>
      ) : (
        <div className="space-y-3">
          {timers.map((timer) => (
            <TimerCard
              key={timer.id}
              timer={timer}
              onStart={onStart}
              onPause={onPause}
              onReset={onReset}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  );
}
