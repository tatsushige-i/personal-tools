import { computeCloseTimeMetric } from "../close-time-stats";

describe("computeCloseTimeMetric", () => {
  it("returns zero metrics for an empty array", () => {
    expect(computeCloseTimeMetric([])).toEqual({
      count: 0,
      averageMs: 0,
      medianMs: 0,
    });
  });

  it("returns the value as both average and median for a single entry", () => {
    expect(computeCloseTimeMetric([1000])).toEqual({
      count: 1,
      averageMs: 1000,
      medianMs: 1000,
    });
  });

  it("computes median as the middle value for an odd count", () => {
    expect(computeCloseTimeMetric([100, 200, 300])).toEqual({
      count: 3,
      averageMs: 200,
      medianMs: 200,
    });
  });

  it("computes median as the average of two middle values for an even count", () => {
    expect(computeCloseTimeMetric([100, 200, 300, 400])).toEqual({
      count: 4,
      averageMs: 250,
      medianMs: 250,
    });
  });

  it("is robust to outliers via the median", () => {
    const result = computeCloseTimeMetric([100, 200, 300, 1_000_000]);
    expect(result.count).toBe(4);
    expect(result.medianMs).toBe(250);
    expect(result.averageMs).toBeGreaterThan(result.medianMs);
  });

  it("filters out negative and non-finite values", () => {
    const result = computeCloseTimeMetric([100, -50, Number.NaN, 300]);
    expect(result.count).toBe(2);
    expect(result.averageMs).toBe(200);
    expect(result.medianMs).toBe(200);
  });

  it("treats zero as a valid value", () => {
    expect(computeCloseTimeMetric([0, 0, 100])).toEqual({
      count: 3,
      averageMs: 33,
      medianMs: 0,
    });
  });
});
