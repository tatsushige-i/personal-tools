import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue/i18n";
import type { CronFields, CronParseResult } from "./types";

const FIELD_ORDER = [
  "minute",
  "hour",
  "dayOfMonth",
  "month",
  "dayOfWeek",
] as const;

export function splitExpression(expression: string): CronFields {
  const parts = expression.trim().split(/\s+/);
  return {
    minute: parts[0] || "*",
    hour: parts[1] || "*",
    dayOfMonth: parts[2] || "*",
    month: parts[3] || "*",
    dayOfWeek: parts[4] || "*",
  };
}

export function buildExpression(fields: CronFields): string {
  return FIELD_ORDER.map((f) => fields[f]).join(" ");
}

export function describeCron(expression: string): string {
  return cronstrue.toString(expression, { locale: "en", use24HourTimeFormat: true });
}

export function getNextExecutions(
  expression: string,
  count: number,
  timezone: string,
): Date[] {
  const interval = CronExpressionParser.parse(expression, { tz: timezone });
  const dates: Date[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(interval.next().toDate());
  }
  return dates;
}

export function parseCronExpression(
  expression: string,
  timezone: string,
): CronParseResult {
  try {
    const description = describeCron(expression);
    const nextExecutions = getNextExecutions(expression, 10, timezone);
    return { valid: true, description, nextExecutions };
  } catch {
    return { valid: false, error: "無効なCron式です" };
  }
}
