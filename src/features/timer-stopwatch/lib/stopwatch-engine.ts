import type { Stopwatch } from "./types";

export function createStopwatch(): Stopwatch {
  return {
    status: "idle",
    accumulatedMs: 0,
    startedAt: null,
    laps: [],
  };
}

export function startStopwatch(sw: Stopwatch, now: number): Stopwatch {
  if (sw.status === "running") {
    return sw;
  }
  return {
    ...sw,
    status: "running",
    startedAt: now,
  };
}

export function pauseStopwatch(sw: Stopwatch, now: number): Stopwatch {
  if (sw.status !== "running" || sw.startedAt === null) {
    return sw;
  }
  return {
    ...sw,
    status: "paused",
    accumulatedMs: sw.accumulatedMs + (now - sw.startedAt),
    startedAt: null,
  };
}

export function resetStopwatch(): Stopwatch {
  return createStopwatch();
}

export function getElapsed(sw: Stopwatch, now: number): number {
  if (sw.status === "running" && sw.startedAt !== null) {
    return sw.accumulatedMs + (now - sw.startedAt);
  }
  return sw.accumulatedMs;
}

export function recordLap(sw: Stopwatch, now: number, lapId: string): Stopwatch {
  if (sw.status !== "running") {
    return sw;
  }
  const totalMs = getElapsed(sw, now);
  const prevTotal = sw.laps.length > 0 ? sw.laps[sw.laps.length - 1].totalMs : 0;
  const splitMs = totalMs - prevTotal;
  return {
    ...sw,
    laps: [...sw.laps, { id: lapId, totalMs, splitMs }],
  };
}
