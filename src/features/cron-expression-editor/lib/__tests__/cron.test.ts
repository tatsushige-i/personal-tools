import {
  splitExpression,
  buildExpression,
  describeCron,
  getNextExecutions,
  parseCronExpression,
} from "../cron";
import type { CronFields } from "../types";

describe("splitExpression", () => {
  it("splits a standard 5-field cron expression", () => {
    expect(splitExpression("0 9 * * 1-5")).toEqual({
      minute: "0",
      hour: "9",
      dayOfMonth: "*",
      month: "*",
      dayOfWeek: "1-5",
    });
  });

  it("fills missing fields with *", () => {
    expect(splitExpression("0 9")).toEqual({
      minute: "0",
      hour: "9",
      dayOfMonth: "*",
      month: "*",
      dayOfWeek: "*",
    });
  });

  it("handles extra whitespace", () => {
    expect(splitExpression("  */5  *  *  *  * ")).toEqual({
      minute: "*/5",
      hour: "*",
      dayOfMonth: "*",
      month: "*",
      dayOfWeek: "*",
    });
  });
});

describe("buildExpression", () => {
  it("joins fields into a cron expression string", () => {
    const fields: CronFields = {
      minute: "30",
      hour: "9",
      dayOfMonth: "1",
      month: "*",
      dayOfWeek: "*",
    };
    expect(buildExpression(fields)).toBe("30 9 1 * *");
  });
});

describe("describeCron", () => {
  it("returns a human-readable description in Japanese", () => {
    const desc = describeCron("0 9 * * 1-5");
    expect(desc).toBeTruthy();
    expect(typeof desc).toBe("string");
  });
});

describe("getNextExecutions", () => {
  it("returns the requested number of dates", () => {
    const dates = getNextExecutions("* * * * *", 5, "UTC");
    expect(dates).toHaveLength(5);
    dates.forEach((d) => expect(d).toBeInstanceOf(Date));
  });

  it("returns dates in ascending order", () => {
    const dates = getNextExecutions("0 * * * *", 3, "UTC");
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i].getTime()).toBeGreaterThan(dates[i - 1].getTime());
    }
  });
});

describe("parseCronExpression", () => {
  it("returns valid result for a valid expression", () => {
    const result = parseCronExpression("0 9 * * 1-5", "UTC");
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.description).toBeTruthy();
      expect(result.nextExecutions).toHaveLength(10);
    }
  });

  it("returns error for an invalid expression", () => {
    const result = parseCronExpression("invalid", "UTC");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeTruthy();
    }
  });
});
