import { PRESETS } from "../presets";
import { buildRegex, findMatches } from "../regex-engine";

describe("PRESETS", () => {
  it("has at least one preset", () => {
    expect(PRESETS.length).toBeGreaterThan(0);
  });

  it.each(PRESETS.map((p) => [p.name, p]))(
    "%s has required fields",
    (_name, preset) => {
      expect(preset.name).toBeTruthy();
      expect(preset.pattern).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.testExample).toBeTruthy();
    },
  );

  it.each(PRESETS.map((p) => [p.name, p]))(
    "%s compiles to a valid RegExp",
    (_name, preset) => {
      expect(() => buildRegex(preset.pattern, preset.flags)).not.toThrow();
    },
  );

  it.each(PRESETS.map((p) => [p.name, p]))(
    "%s matches its own test example",
    (_name, preset) => {
      const result = findMatches(
        preset.pattern,
        preset.flags,
        preset.testExample,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.matches.length).toBeGreaterThan(0);
      }
    },
  );
});
