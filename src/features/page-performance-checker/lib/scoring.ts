import type { CoreMetrics } from "@/features/page-performance-checker/lib/types";

export type Rating = "good" | "needs-improvement" | "poor";

export type MetricKey = keyof CoreMetrics;

export type Threshold = { good: number; poor: number; weight: number };

export const THRESHOLDS: Record<MetricKey, Threshold> = {
  lcp: { good: 2500, poor: 4000, weight: 0.25 },
  cls: { good: 0.1, poor: 0.25, weight: 0.25 },
  fcp: { good: 1800, poor: 3000, weight: 0.15 },
  tbt: { good: 200, poor: 600, weight: 0.35 },
};

export const METRIC_LABELS: Record<MetricKey, string> = {
  lcp: "LCP",
  cls: "CLS",
  fcp: "FCP",
  tbt: "TBT",
};

export const METRIC_DESCRIPTIONS: Record<MetricKey, string> = {
  lcp: "Largest Contentful Paint",
  cls: "Cumulative Layout Shift",
  fcp: "First Contentful Paint",
  tbt: "Total Blocking Time",
};

export function scoreMetric(value: number, good: number, poor: number): number {
  if (value <= good) return 100;
  if (value >= poor) return 0;
  const ratio = (poor - value) / (poor - good);
  return Math.round(ratio * 100);
}

export function rateMetric(value: number, good: number, poor: number): Rating {
  if (value <= good) return "good";
  if (value >= poor) return "poor";
  return "needs-improvement";
}

export function calculateOverallScore(metrics: CoreMetrics): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const key of Object.keys(THRESHOLDS) as MetricKey[]) {
    const value = metrics[key];
    if (value === null) continue;
    const { good, poor, weight } = THRESHOLDS[key];
    weightedSum += scoreMetric(value, good, poor) * weight;
    totalWeight += weight;
  }
  return Math.round(weightedSum / totalWeight);
}

export function formatMetricValue(key: MetricKey, value: number | null): string {
  if (value === null) return "未計測";
  if (key === "cls") return value.toFixed(3);
  return `${Math.round(value)}ms`;
}
