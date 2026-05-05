"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCsv, toCsv } from "@/lib/csv-export";
import {
  LINK_STATUS_LABELS,
  isErrorStatus,
  type CheckerResponse,
  type LinkStatus,
} from "@/features/broken-link-checker/lib/types";

type Props = {
  result: CheckerResponse | null;
  isLoading: boolean;
};

type FilterMode = "all" | "errors";

const STATUS_BADGE_VARIANT: Record<LinkStatus, "secondary" | "outline" | "destructive"> = {
  ok: "secondary",
  redirect: "outline",
  "client-error": "destructive",
  "server-error": "destructive",
  "network-error": "destructive",
  timeout: "destructive",
  blocked: "destructive",
};

const STATUS_BADGE_CLASS: Partial<Record<LinkStatus, string>> = {
  ok: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  redirect: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
};

export function CheckerResult({ result, isLoading }: Props) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const errorCount = useMemo(
    () => (result ? result.links.filter((l) => isErrorStatus(l.status)).length : 0),
    [result],
  );

  const visibleLinks = useMemo(() => {
    if (!result) return [];
    return filter === "errors" ? result.links.filter((l) => isErrorStatus(l.status)) : result.links;
  }, [result, filter]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">チェック中…</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">チェック結果</CardTitle>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>発見: {result.totalFound} 件</span>
            <span>チェック: {result.totalChecked} 件</span>
            <span>エラー: <span className={errorCount > 0 ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>{errorCount} 件</span></span>
            <span>所要時間: {(result.durationMs / 1000).toFixed(1)} 秒</span>
            {result.truncated && (
              <Badge variant="outline" className="border-amber-300 text-amber-900 dark:border-amber-800 dark:text-amber-200">
                上限により切り捨て
              </Badge>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => exportCsv(result)}
          disabled={result.links.length === 0}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          CSV
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
          <TabsList>
            <TabsTrigger value="all">全て ({result.links.length})</TabsTrigger>
            <TabsTrigger value="errors">エラーのみ ({errorCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        {visibleLinks.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {filter === "errors" ? "エラーのリンクはありません。" : "リンクが見つかりませんでした。"}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">ステータス</th>
                  <th className="px-3 py-2 text-left font-medium">URL</th>
                  <th className="px-3 py-2 text-left font-medium">種別</th>
                  {result.depth === 2 && (
                    <th className="px-3 py-2 text-left font-medium">検出元ページ</th>
                  )}
                  <th className="px-3 py-2 text-right font-medium">応答時間</th>
                </tr>
              </thead>
              <tbody>
                {visibleLinks.map((link) => (
                  <tr key={link.url} className="border-t">
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <Badge
                        variant={STATUS_BADGE_VARIANT[link.status]}
                        className={STATUS_BADGE_CLASS[link.status]}
                      >
                        {link.statusCode ?? "-"} · {LINK_STATUS_LABELS[link.status]}
                      </Badge>
                    </td>
                    <td className="max-w-[420px] truncate px-3 py-1.5 font-mono">
                      <a href={link.url} target="_blank" rel="noreferrer noopener" title={link.url} className="hover:underline">
                        {link.url}
                      </a>
                    </td>
                    <td className="px-3 py-1.5">{link.isInternal ? "内部" : "外部"}</td>
                    {result.depth === 2 && (
                      <td className="max-w-[260px] truncate px-3 py-1.5 font-mono text-muted-foreground" title={link.sourcePage}>
                        {link.sourcePage}
                      </td>
                    )}
                    <td className="px-3 py-1.5 text-right tabular-nums">{link.durationMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function exportCsv(result: CheckerResponse) {
  const headers = ["status_code", "status", "url", "type", "source_page", "duration_ms"];
  const rows = result.links.map((l) => [
    l.statusCode ?? "",
    LINK_STATUS_LABELS[l.status],
    l.url,
    l.isInternal ? "internal" : "external",
    l.sourcePage,
    l.durationMs,
  ]);
  const csv = toCsv(headers, rows);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadCsv(csv, `broken-link-check-${stamp}.csv`);
}
