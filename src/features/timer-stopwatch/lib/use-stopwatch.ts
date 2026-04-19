"use client";

import { useCallback, useEffect, useState } from "react";
import type { Stopwatch } from "./types";
import {
  createStopwatch,
  pauseStopwatch,
  recordLap,
  resetStopwatch,
  startStopwatch,
} from "./stopwatch-engine";

const TICK_INTERVAL_MS = 100;

let nextLapId = 1;

function generateLapId(): string {
  return `lap-${nextLapId++}`;
}

export function useStopwatch() {
  const [stopwatch, setStopwatch] = useState<Stopwatch>(createStopwatch);
  const [, setNow] = useState(0);

  useEffect(() => {
    if (stopwatch.status !== "running") return;
    const handle = setInterval(() => {
      setNow(Date.now());
    }, TICK_INTERVAL_MS);
    return () => clearInterval(handle);
  }, [stopwatch.status]);

  const start = useCallback(() => {
    setStopwatch((prev) => startStopwatch(prev, Date.now()));
  }, []);

  const pause = useCallback(() => {
    setStopwatch((prev) => pauseStopwatch(prev, Date.now()));
  }, []);

  const reset = useCallback(() => {
    setStopwatch(resetStopwatch());
  }, []);

  const lap = useCallback(() => {
    setStopwatch((prev) => recordLap(prev, Date.now(), generateLapId()));
  }, []);

  return { stopwatch, start, pause, reset, lap };
}
