export type CronField = "minute" | "hour" | "dayOfMonth" | "month" | "dayOfWeek";

export type CronFields = {
  [K in CronField]: string;
};

export type CronParseResult =
  | { valid: true; description: string; nextExecutions: Date[] }
  | { valid: false; error: string };

export type CronPreset = {
  label: string;
  expression: string;
};
