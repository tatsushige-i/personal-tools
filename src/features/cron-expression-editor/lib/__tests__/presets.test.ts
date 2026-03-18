import { CRON_PRESETS } from "../presets";
import { parseCronExpression } from "../cron";

describe("CRON_PRESETS", () => {
  it.each(CRON_PRESETS)(
    "preset '$label' ($expression) is a valid cron expression",
    ({ expression }) => {
      const result = parseCronExpression(expression, "UTC");
      expect(result.valid).toBe(true);
    },
  );

  it("has unique labels", () => {
    const labels = CRON_PRESETS.map((p) => p.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("has unique expressions", () => {
    const expressions = CRON_PRESETS.map((p) => p.expression);
    expect(new Set(expressions).size).toBe(expressions.length);
  });
});
