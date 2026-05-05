"use client";

import { useCallback, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { checkLinks } from "@/features/broken-link-checker/lib/checker-client";
import type {
  CheckerError,
  CheckerResponse,
  Depth,
} from "@/features/broken-link-checker/lib/types";
import { CheckerForm } from "./checker-form";
import { CheckerResult } from "./checker-result";

export function BrokenLinkCheckerPage() {
  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState<Depth>(1);
  const [result, setResult] = useState<CheckerResponse | null>(null);
  const [error, setError] = useState<CheckerError | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setResult(null);
    setError(undefined);

    const res = await checkLinks({ url: url.trim(), depth });
    if (res.ok) {
      setResult(res.data);
    } else {
      setError(res.error);
    }
    setIsLoading(false);
  }, [depth, isLoading, url]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">リンク切れチェッカー</h1>
        <p className="mt-2 text-muted-foreground">
          URL を入力すると、サーバー側 Playwright がページ内の全リンクをクロールし、
          ステータスコード（200 / 404 / 500 / リダイレクト等）を一覧化します。
          内部 / 外部リンクの分類、エラーのみのフィルタ、CSV エクスポートに対応します。
        </p>
      </div>

      <CheckerForm
        url={url}
        depth={depth}
        isLoading={isLoading}
        onUrlChange={setUrl}
        onDepthChange={setDepth}
        onSubmit={handleSubmit}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>チェックに失敗しました</AlertTitle>
          <AlertDescription>{error.error}</AlertDescription>
        </Alert>
      )}

      <CheckerResult result={result} isLoading={isLoading} />
    </div>
  );
}
