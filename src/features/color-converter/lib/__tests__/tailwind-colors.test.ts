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

describe("hexToTailwind normalization", () => {
  it("normalizes 3-digit hex", () => {
    // #f00 → #ff0000 won't match any Tailwind color exactly
    expect(hexToTailwind("#f00")).toBeNull();
  });

  it("normalizes hex without #", () => {
    expect(hexToTailwind("ef4444")).toBe("red-500");
  });

  it("returns null for invalid input", () => {
    expect(hexToTailwind("xyz")).toBeNull();
  });
});

describe("findClosestTailwind", () => {
  it("returns exact match when available", () => {
    const result = findClosestTailwind("#ef4444");
    expect(result).not.toBeNull();
    expect(result!.name).toBe("red-500");
  });

  it("returns nearest color for arbitrary hex", () => {
    const result = findClosestTailwind("#ff0000");
    expect(result).not.toBeNull();
    expect(result!.name).toContain("red");
  });

  it("returns null for invalid input", () => {
    expect(findClosestTailwind("invalid")).toBeNull();
  });
});
