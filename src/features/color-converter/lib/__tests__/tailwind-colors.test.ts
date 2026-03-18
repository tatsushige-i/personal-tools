import {
  TAILWIND_COLORS,
  hexToTailwind,
  findClosestTailwind,
} from "../tailwind-colors";

describe("TAILWIND_COLORS", () => {
  it("has 242 entries", () => {
    expect(Object.keys(TAILWIND_COLORS)).toHaveLength(242);
  });

  it("contains known colors", () => {
    expect(TAILWIND_COLORS["red-500"]).toBe("#ef4444");
    expect(TAILWIND_COLORS["blue-500"]).toBe("#3b82f6");
    expect(TAILWIND_COLORS["green-500"]).toBe("#22c55e");
  });
});

describe("hexToTailwind", () => {
  it("finds exact match", () => {
    expect(hexToTailwind("#ef4444")).toBe("red-500");
    expect(hexToTailwind("#3b82f6")).toBe("blue-500");
  });

  it("returns null for non-Tailwind hex", () => {
    expect(hexToTailwind("#123456")).toBeNull();
  });

  it("is case-insensitive", () => {
    expect(hexToTailwind("#EF4444")).toBe("red-500");
  });
});

describe("findClosestTailwind", () => {
  it("returns exact match when available", () => {
    const result = findClosestTailwind("#ef4444");
    expect(result.name).toBe("red-500");
  });

  it("returns nearest color for arbitrary hex", () => {
    const result = findClosestTailwind("#ff0000");
    // Should find a red-ish Tailwind color
    expect(result.name).toContain("red");
  });
});
