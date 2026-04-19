import type { Timer } from "./types";

export function createTimer(
  id: string,
  title: string,
  durationMs: number,
): Timer {
  return {
    id,
    title,
    durationMs,
    remainingMs: durationMs,
    endsAt: null,
    status: "idle",
  };
}

export function startTimer(timer: Timer, now: number): Timer {
  if (timer.status === "running" || timer.remainingMs <= 0) {
    return timer;
  }
  return {
    ...timer,
    status: "running",
    endsAt: now + timer.remainingMs,
  };
}

export function pauseTimer(timer: Timer, now: number): Timer {
  if (timer.status !== "running" || timer.endsAt === null) {
    return timer;
  }
  return {
    ...timer,
    status: "paused",
    remainingMs: Math.max(0, timer.endsAt - now),
    endsAt: null,
  };
}

export function resetTimer(timer: Timer): Timer {
  return {
    ...timer,
    status: "idle",
    remainingMs: timer.durationMs,
    endsAt: null,
  };
}

export function tickTimer(
  timer: Timer,
  now: number,
): { timer: Timer; justCompleted: boolean } {
  if (timer.status !== "running" || timer.endsAt === null) {
    return { timer, justCompleted: false };
  }
  if (now >= timer.endsAt) {
    return {
      timer: {
        ...timer,
        status: "completed",
        remainingMs: 0,
        endsAt: null,
      },
      justCompleted: true,
    };
  }
  return { timer, justCompleted: false };
}

export function getDisplayRemaining(timer: Timer, now: number): number {
  if (timer.status === "running" && timer.endsAt !== null) {
    return Math.max(0, timer.endsAt - now);
  }
  return timer.remainingMs;
}
