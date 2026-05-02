import { convert, formatAmount, formatRate } from "../calculator";

describe("convert", () => {
  it("multiplies amount by rate", () => {
    expect(convert(100, 150)).toBe(15000);
  });

  it("returns 0 when amount is 0", () => {
    expect(convert(0, 150)).toBe(0);
  });

  it("handles fractional rate", () => {
    expect(convert(10, 0.85)).toBeCloseTo(8.5, 6);
  });
});

describe("formatAmount", () => {
  it("formats JPY without fractional part", () => {
    expect(formatAmount(15000, "JPY")).toMatch(/15,000/);
  });

  it("formats USD with currency symbol", () => {
    const result = formatAmount(123.45, "USD");
    expect(result).toMatch(/\$/);
    expect(result).toMatch(/123/);
  });

  it("returns dash for non-finite values", () => {
    expect(formatAmount(Number.NaN, "USD")).toBe("—");
    expect(formatAmount(Number.POSITIVE_INFINITY, "USD")).toBe("—");
  });

  it("falls back gracefully for unknown currency code", () => {
    const result = formatAmount(100, "XYZ");
    expect(result).toContain("100");
  });
});

describe("formatRate", () => {
  it("formats a finite rate with grouping separators", () => {
    expect(formatRate(1234.5678)).toMatch(/1,234/);
  });

  it("returns dash for non-finite", () => {
    expect(formatRate(Number.NaN)).toBe("—");
  });
});
