"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  METRIC_DESCRIPTIONS,
  METRIC_LABELS,
  THRESHOLDS,
  formatMetricValue,
  rateMetric,
  type MetricKey,
  type Rating,
} from "@/features/page-performance-checker/lib/scoring";
import {
  DEVICE_LABELS,
  RESOURCE_TYPES,
  type Device,
  type DeviceResult,
  type ResourceType,
} from "@/features/page-performance-checker/lib/types";

type Props = {
  results: DeviceResult[];
  isLoading: boolean;
  loadingDevices: Device[];
};

const METRIC_KEYS: MetricKey[] = ["lcp", "cls", "fcp", "tbt"];

const RATING_LABELS: Record<Rating, string> = {
  good: "Good",
  "needs-improvement": "要改善",
  poor: "Poor",
};

const RATING_CLASSES: Record<Rating, string> = {
  good: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  "needs-improvement": "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  poor: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
};

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  script: "JS",
  css: "CSS",
  image: "画像",
  font: "フォント",
  other: "その他",
};

export function PerformanceResult({ results, isLoading, loadingDevices }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {loadingDevices.map((device) => (
          <Card key={device}>
            <CardHeader>
              <CardTitle className="text-base">{DEVICE_LABELS[device]}</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <DeviceResultCard key={result.device} result={result} />
      ))}
      <p className="text-xs text-muted-foreground">
        ※ サーバー環境からの計測のため、実機・実ネットワーク環境とは異なります。
      </p>
    </div>
  );
}

function DeviceResultCard({ result }: { result: DeviceResult }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-baseline gap-2 text-base">
            {DEVICE_LABELS[result.device]}
            <span className="text-xs font-normal text-muted-foreground">
              {result.viewport.width}×{result.viewport.height}
            </span>
          </CardTitle>
        </div>
        <ScoreBadge score={result.score} />
      </CardHeader>
      <CardContent className="space-y-6">
        <MetricsGrid result={result} />
        <TimingsRow result={result} />
        <ResourcesSection result={result} />
      </CardContent>
    </Card>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 90
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-rose-600 dark:text-rose-400";
  return (
    <div className="text-right">
      <div className={`text-4xl font-bold tabular-nums ${tone}`}>{score}</div>
      <div className="text-xs text-muted-foreground">スコア / 100</div>
    </div>
  );
}

function MetricsGrid({ result }: { result: DeviceResult }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">Web Vitals</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {METRIC_KEYS.map((key) => {
          const value = result.metrics[key];
          const { good, poor } = THRESHOLDS[key];
          const rating = value === null ? null : rateMetric(value, good, poor);
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
            >
              <div>
                <div className="text-sm font-medium">
                  {METRIC_LABELS[key]}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {METRIC_DESCRIPTIONS[key]}
                  </span>
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {formatMetricValue(key, value)}
                </div>
              </div>
              {rating && (
                <Badge variant="secondary" className={RATING_CLASSES[rating]}>
                  {RATING_LABELS[rating]}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimingsRow({ result }: { result: DeviceResult }) {
  const items: { label: string; description: string; value: number }[] = [
    { label: "TTFB", description: "Time To First Byte", value: result.timings.ttfb },
    { label: "DCL", description: "DOMContentLoaded", value: result.timings.dcl },
    { label: "Load", description: "load イベント", value: result.timings.load },
  ];
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">ナビゲーションタイミング</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-md border bg-muted/30 px-3 py-2">
            <div className="text-xs text-muted-foreground">
              {item.label} <span className="opacity-70">· {item.description}</span>
            </div>
            <div className="text-lg font-semibold tabular-nums">{item.value}ms</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourcesSection({ result }: { result: DeviceResult }) {
  const totalsByType = RESOURCE_TYPES.map((type) => {
    const items = result.resources.filter((r) => r.type === type);
    const transfer = items.reduce((sum, r) => sum + r.transferSize, 0);
    return { type, count: items.length, transfer };
  }).filter((t) => t.count > 0);

  const sortedResources = [...result.resources].sort((a, b) => b.transferSize - a.transferSize);

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">
        リソース
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          {result.resources.length} 件 · 合計 {formatBytes(result.totalTransferSize)}
        </span>
      </h3>

      <div className="mb-3 grid gap-2 sm:grid-cols-3 md:grid-cols-5">
        {totalsByType.map(({ type, count, transfer }) => (
          <div key={type} className="rounded-md border bg-muted/30 px-3 py-2">
            <div className="text-xs text-muted-foreground">
              {RESOURCE_TYPE_LABELS[type]} ({count})
            </div>
            <div className="text-sm font-semibold tabular-nums">{formatBytes(transfer)}</div>
          </div>
        ))}
      </div>

      {sortedResources.length > 0 && (
        <details className="rounded-md border">
          <summary className="cursor-pointer px-3 py-2 text-sm">リソース一覧を表示</summary>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">URL</th>
                  <th className="px-3 py-2 text-left font-medium">種類</th>
                  <th className="px-3 py-2 text-right font-medium">転送サイズ</th>
                  <th className="px-3 py-2 text-right font-medium">時間</th>
                </tr>
              </thead>
              <tbody>
                {sortedResources.map((r, i) => (
                  <tr key={`${r.name}-${i}`} className="border-t">
                    <td className="max-w-[420px] truncate px-3 py-1.5 font-mono" title={r.name}>
                      {r.name}
                    </td>
                    <td className="px-3 py-1.5">{RESOURCE_TYPE_LABELS[r.type]}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {formatBytes(r.transferSize)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{r.duration}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
