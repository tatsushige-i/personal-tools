function pad(value: number, length: number): string {
  return value.toString().padStart(length, "0");
}

export function formatTimer(ms: number): string {
  const clamped = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  if (hours > 0) {
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
  }
  return `${pad(minutes, 2)}:${pad(seconds, 2)}`;
}

export function formatStopwatch(ms: number): string {
  const clamped = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((clamped % 1000) / 10);

  const base = `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(centis, 2)}`;
  if (hours > 0) {
    return `${pad(hours, 2)}:${base}`;
  }
  return base;
}
