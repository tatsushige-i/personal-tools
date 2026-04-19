"use client";

import { useCallback, useEffect, useState } from "react";
import type { Timer } from "./types";
import {
  createTimer,
  pauseTimer,
  resetTimer,
  startTimer,
  tickTimer,
} from "./timer-engine";
import { ensureNotificationPermission, notifyTimerDone } from "./notifications";

const TICK_INTERVAL_MS = 100;

let nextId = 1;

function generateId(): string {
  return `timer-${nextId++}`;
}

export function useTimers() {
  const [timers, setTimers] = useState<Timer[]>([]);

  const hasRunning = timers.some((t) => t.status === "running");

  useEffect(() => {
    if (!hasRunning) return;

    const handle = setInterval(() => {
      const now = Date.now();
      const completedTitles: string[] = [];
      setTimers((prev) => {
        let changed = false;
        const next = prev.map((t) => {
          const { timer, justCompleted } = tickTimer(t, now);
          if (justCompleted) {
            completedTitles.push(timer.title);
          }
          if (timer !== t) changed = true;
          return timer;
        });
        return changed ? next : prev;
      });
      completedTitles.forEach((title) => notifyTimerDone(title));
    }, TICK_INTERVAL_MS);

    return () => clearInterval(handle);
  }, [hasRunning]);

  const addTimer = useCallback((title: string, durationMs: number) => {
    if (durationMs <= 0) return;
    const trimmed = title.trim() || "タイマー";
    setTimers((prev) => [...prev, createTimer(generateId(), trimmed, durationMs)]);
    void ensureNotificationPermission();
  }, []);

  const start = useCallback((id: string) => {
    const now = Date.now();
    setTimers((prev) => prev.map((t) => (t.id === id ? startTimer(t, now) : t)));
    void ensureNotificationPermission();
  }, []);

  const pause = useCallback((id: string) => {
    const now = Date.now();
    setTimers((prev) => prev.map((t) => (t.id === id ? pauseTimer(t, now) : t)));
  }, []);

  const reset = useCallback((id: string) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? resetTimer(t) : t)));
  }, []);

  const remove = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { timers, addTimer, start, pause, reset, remove };
}
