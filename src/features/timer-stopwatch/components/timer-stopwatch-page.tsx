"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStopwatch } from "../lib/use-stopwatch";
import { useTimers } from "../lib/use-timers";
import { StopwatchSection } from "./stopwatch-section";
import { TimerSection } from "./timer-section";

export function TimerStopwatchPage() {
  const timers = useTimers();
  const stopwatch = useStopwatch();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timer / Stopwatch</h1>
        <p className="mt-2 text-muted-foreground">
          カウントダウンタイマーとストップウォッチ。プリセット・複数同時実行・ブラウザ通知対応。
        </p>
      </div>

      <Tabs defaultValue="timer">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="timer">タイマー</TabsTrigger>
          <TabsTrigger value="stopwatch">ストップウォッチ</TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="mt-4">
          <TimerSection
            timers={timers.timers}
            onAdd={timers.addTimer}
            onStart={timers.start}
            onPause={timers.pause}
            onReset={timers.reset}
            onRemove={timers.remove}
          />
        </TabsContent>

        <TabsContent value="stopwatch" className="mt-4">
          <StopwatchSection
            stopwatch={stopwatch.stopwatch}
            onStart={stopwatch.start}
            onPause={stopwatch.pause}
            onReset={stopwatch.reset}
            onLap={stopwatch.lap}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
