import {
  THRESHOLDS,
  calculateOverallScore,
  formatMetricValue,
  rateMetric,
  scoreMetric,
} from "@/features/page-performance-checker/lib/scoring";

describe("scoreMetric", () => {
  it("returns 100 when value is at or below the good threshold", () => {
    expect(scoreMetric(0, 2500, 4000)).toBe(100);
    expect(scoreMetric(2500, 2500, 4000)).toBe(100);
  });

  it("returns 0 when value is at or above the poor threshold", () => {
    expect(scoreMetric(4000, 2500, 4000)).toBe(0);
    expect(scoreMetric(10000, 2500, 4000)).toBe(0);
  });

  it("interpolates linearly between good and poor thresholds", () => {
    expect(scoreMetric(3250, 2500, 4000)).toBe(50);
    expect(scoreMetric(2875, 2500, 4000)).toBe(75);
    expect(scoreMetric(3625, 2500, 4000)).toBe(25);
  });
});

describe("rateMetric", () => {
  it("returns 'good' at or below the good threshold", () => {
    expect(rateMetric(0, 2500, 4000)).toBe("good");
    expect(rateMetric(2500, 2500, 4000)).toBe("good");
  });

  it("returns 'poor' at or above the poor threshold", () => {
    expect(rateMetric(4000, 2500, 4000)).toBe("poor");
    expect(rateMetric(99999, 2500, 4000)).toBe("poor");
  });

  it("returns 'needs-improvement' between thresholds", () => {
    expect(rateMetric(3000, 2500, 4000)).toBe("needs-improvement");
  });
});

describe("calculateOverallScore", () => {
  it("returns 100 when all metrics are at the good thresholds", () => {
    const score = calculateOverallScore({ lcp: 2500, cls: 0.1, fcp: 1800, tbt: 200 });
    expect(score).toBe(100);
  });

  it("returns 0 when all metrics are at the poor thresholds", () => {
    const score = calculateOverallScore({ lcp: 4000, cls: 0.25, fcp: 3000, tbt: 600 });
    expect(score).toBe(0);
  });

  it("renormalizes weights when a metric is null", () => {
    const score = calculateOverallScore({ lcp: 2500, cls: null, fcp: 1800, tbt: 200 });
    expect(score).toBe(100);
  });

  it("returns 0 when nullable metrics are all null and TBT is poor", () => {
    const score = calculateOverallScore({ lcp: null, cls: null, fcp: null, tbt: 600 });
    expect(score).toBe(0);
  });

  it("respects metric weights in the aggregate", () => {
    // Only TBT (weight 0.35) is poor; everything else is perfect.
    const score = calculateOverallScore({ lcp: 2500, cls: 0.1, fcp: 1800, tbt: 600 });
    // Expected: (100 * 0.65 + 0 * 0.35) / 1.0 = 65
    expect(score).toBe(65);
  });

  it("uses the configured thresholds", () => {
    expect(THRESHOLDS.lcp.good).toBe(2500);
    expect(THRESHOLDS.cls.poor).toBe(0.25);
  });
});

describe("formatMetricValue", () => {
  it("returns 未計測 for null", () => {
    expect(formatMetricValue("lcp", null)).toBe("未計測");
  });

  it("formats CLS with 3 decimals", () => {
    expect(formatMetricValue("cls", 0.0512)).toBe("0.051");
  });

  it("formats time metrics in milliseconds", () => {
    expect(formatMetricValue("lcp", 1234.7)).toBe("1235ms");
    expect(formatMetricValue("tbt", 0)).toBe("0ms");
  });
});
