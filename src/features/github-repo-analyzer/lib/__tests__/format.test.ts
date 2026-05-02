import {
  computeLanguagePercentages,
  formatCount,
  formatRelativeDate,
} from "../format";

describe("formatCount", () => {
  it("returns the value as-is below 1000", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
  });

  it("formats thousands with one decimal place", () => {
    expect(formatCount(1234)).toBe("1.2k");
    expect(formatCount(9999)).toBe("10k");
  });

  it("formats large thousands without decimals", () => {
    expect(formatCount(15_000)).toBe("15k");
    expect(formatCount(123_456)).toBe("123k");
  });

  it("formats millions with one decimal place", () => {
    expect(formatCount(1_500_000)).toBe("1.5M");
    expect(formatCount(2_000_000)).toBe("2M");
  });

  it("returns 0 for negative or non-finite values", () => {
    expect(formatCount(-1)).toBe("0");
    expect(formatCount(Number.NaN)).toBe("0");
  });
});

describe("formatRelativeDate", () => {
  const now = new Date("2026-05-02T12:00:00Z");

  it("returns 数秒前 for under one minute", () => {
    expect(
      formatRelativeDate("2026-05-02T11:59:30Z", now)
    ).toBe("数秒前");
  });

  it("returns minutes for under one hour", () => {
    expect(formatRelativeDate("2026-05-02T11:30:00Z", now)).toBe("30分前");
  });

  it("returns hours for under one day", () => {
    expect(formatRelativeDate("2026-05-02T05:00:00Z", now)).toBe("7時間前");
  });

  it("returns 昨日 for one day ago", () => {
    expect(formatRelativeDate("2026-05-01T12:00:00Z", now)).toBe("昨日");
  });

  it("returns days for under 30 days", () => {
    expect(formatRelativeDate("2026-04-22T12:00:00Z", now)).toBe("10日前");
  });

  it("returns months for under one year", () => {
    expect(formatRelativeDate("2026-01-02T12:00:00Z", now)).toBe("4ヶ月前");
  });

  it("returns years for over one year", () => {
    expect(formatRelativeDate("2024-05-02T12:00:00Z", now)).toBe("2年前");
  });

  it("returns the original string when the date is invalid", () => {
    expect(formatRelativeDate("not-a-date", now)).toBe("not-a-date");
  });
});

describe("computeLanguagePercentages", () => {
  it("returns empty array for empty input", () => {
    expect(computeLanguagePercentages({})).toEqual([]);
  });

  it("calculates percentages and sorts by bytes descending", () => {
    const result = computeLanguagePercentages({
      TypeScript: 6000,
      JavaScript: 3000,
      CSS: 1000,
    });
    expect(result).toEqual([
      { language: "TypeScript", bytes: 6000, percentage: 60 },
      { language: "JavaScript", bytes: 3000, percentage: 30 },
      { language: "CSS", bytes: 1000, percentage: 10 },
    ]);
  });

  it("handles zero total gracefully", () => {
    expect(computeLanguagePercentages({ Foo: 0 })).toEqual([]);
  });
});
