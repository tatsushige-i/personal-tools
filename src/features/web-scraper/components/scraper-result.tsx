"use client";

import { AlertCircle, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCsv } from "@/lib/csv-export";
import {
  buildExportFilename,
  downloadJson,
  toScraperCsv,
  toScraperJson,
} from "@/features/web-scraper/lib/export";
import {
  MAX_MATCHES_PER_SELECTOR,
  type ScraperResponse,
  type SelectorResult,
} from "@/features/web-scraper/lib/types";

type Props = {
  result: ScraperResponse | null;
  isLoading: boolean;
};

export function ScraperResult({ result, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">抽出中…</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const totalMatches = result.results.reduce((sum, r) => sum + r.matches.length, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">抽出結果</CardTitle>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="max-w-[420px] truncate font-mono" title={result.url}>
              {result.url}
            </span>
            <span>マッチ合計: {totalMatches} 件</span>
            <span>所要時間: {(result.durationMs / 1000).toFixed(1)} 秒</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadJson(toScraperJson(result), buildExportFilename("json"))}
            disabled={totalMatches === 0}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadCsv(toScraperCsv(result), buildExportFilename("csv"))}
            disabled={totalMatches === 0}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs key={`${result.url}-${result.durationMs}`} defaultValue="0">
          <TabsList>
            {result.results.map((r, index) => (
              <TabsTrigger key={index} value={String(index)}>
                {tabLabel(r)}
                <Badge variant="secondary" className="ml-1">
                  {r.matches.length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {result.results.map((r, index) => (
            <TabsContent key={index} value={String(index)} className="space-y-3">
              <SelectorPanel result={r} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function tabLabel(result: SelectorResult): string {
  const label = result.name.trim() || result.selector;
  return label.length > 24 ? `${label.slice(0, 24)}…` : label;
}

function SelectorPanel({ result }: { result: SelectorResult }) {
  if (result.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>セレクタエラー</AlertTitle>
        <AlertDescription>
          <span className="font-mono">{result.selector}</span>: {result.error}
        </AlertDescription>
      </Alert>
    );
  }

  if (result.matches.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        セレクタ <span className="font-mono">{result.selector}</span> にマッチする要素はありませんでした。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        セレクタ: <span className="font-mono">{result.selector}</span>
        {result.truncated && (
          <Badge
            variant="outline"
            className="ml-2 border-amber-300 text-amber-900 dark:border-amber-800 dark:text-amber-200"
          >
            上限 {MAX_MATCHES_PER_SELECTOR} 件で切り捨て
          </Badge>
        )}
      </p>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-xs">
          <thead className="bg-muted/30">
            <tr>
              <th className="w-10 px-3 py-2 text-right font-medium">#</th>
              <th className="px-3 py-2 text-left font-medium">テキスト</th>
              <th className="px-3 py-2 text-left font-medium">href</th>
              <th className="px-3 py-2 text-left font-medium">src</th>
            </tr>
          </thead>
          <tbody>
            {result.matches.map((match, index) => (
              <tr key={index} className="border-t align-top">
                <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                  {index}
                </td>
                <td className="max-w-[480px] px-3 py-1.5">
                  <span className="line-clamp-3 whitespace-pre-wrap">
                    {match.text || <span className="text-muted-foreground">（空）</span>}
                  </span>
                </td>
                <td className="max-w-[260px] truncate px-3 py-1.5 font-mono">
                  {match.href ? (
                    <a
                      href={match.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      title={match.href}
                      className="hover:underline"
                    >
                      {match.href}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="max-w-[260px] truncate px-3 py-1.5 font-mono" title={match.src}>
                  {match.src ?? <span className="text-muted-foreground">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
