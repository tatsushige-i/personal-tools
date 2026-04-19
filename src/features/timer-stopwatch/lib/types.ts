export type TimerStatus = "idle" | "running" | "paused" | "completed";

export type Timer = {
  id: string;
  title: string;
  durationMs: number;
  remainingMs: number;
  endsAt: number | null;
  status: TimerStatus;
};

export type Lap = {
  id: string;
  totalMs: number;
  splitMs: number;
};

export type StopwatchStatus = "idle" | "running" | "paused";

export type Stopwatch = {
  status: StopwatchStatus;
  accumulatedMs: number;
  startedAt: number | null;
  laps: Lap[];
};
