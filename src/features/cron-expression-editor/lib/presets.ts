import type { CronPreset } from "./types";

export const CRON_PRESETS: CronPreset[] = [
  { label: "毎分", expression: "* * * * *" },
  { label: "5分毎", expression: "*/5 * * * *" },
  { label: "10分毎", expression: "*/10 * * * *" },
  { label: "15分毎", expression: "*/15 * * * *" },
  { label: "30分毎", expression: "*/30 * * * *" },
  { label: "毎時（0分）", expression: "0 * * * *" },
  { label: "毎日 0:00", expression: "0 0 * * *" },
  { label: "毎日 9:00", expression: "0 9 * * *" },
  { label: "毎週月曜 9:00", expression: "0 9 * * 1" },
  { label: "平日 9:00", expression: "0 9 * * 1-5" },
  { label: "毎月1日 0:00", expression: "0 0 1 * *" },
  { label: "毎年1月1日 0:00", expression: "0 0 1 1 *" },
];
