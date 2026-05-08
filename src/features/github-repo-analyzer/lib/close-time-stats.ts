import type { CloseTimeMetric } from "./types";

export function computeCloseTimeMetric(durationsMs: number[]): CloseTimeMetric {
  const valid = durationsMs.filter((ms) => Number.isFinite(ms) && ms >= 0);
  if (valid.length === 0) {
    return { count: 0, averageMs: 0, medianMs: 0 };
  }
  const sum = valid.reduce((acc, ms) => acc + ms, 0);
  const averageMs = Math.round(sum / valid.length);
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianMs =
    sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : sorted[mid];
  return { count: valid.length, averageMs, medianMs };
}
