"use client";

import { useCallback, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { scrape } from "@/features/web-scraper/lib/web-scraper-client";
import type {
  ScraperError,
  ScraperResponse,
  ScraperSelectorInput,
} from "@/features/web-scraper/lib/types";
import { ScraperForm } from "./scraper-form";
import { ScraperResult } from "./scraper-result";

const INITIAL_SELECTORS: ScraperSelectorInput[] = [{ name: "", selector: "" }];

export function WebScraperPage() {
  const [url, setUrl] = useState("");
  const [selectors, setSelectors] = useState<ScraperSelectorInput[]>(INITIAL_SELECTORS);
  const [result, setResult] = useState<ScraperResponse | null>(null);
  const [error, setError] = useState<ScraperError | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;

    const cleaned = selectors
      .map((s) => ({ name: s.name.trim(), selector: s.selector.trim() }))
      .filter((s) => s.selector.length > 0);

    setIsLoading(true);
    setResult(null);
    setError(undefined);

    const res = await scrape({ url: url.trim(), selectors: cleaned });
    if (res.ok) {
      setResult(res.data);
    } else {
      setError(res.error);
    }
    setIsLoading(false);
  }, [isLoading, selectors, url]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webスクレイピングツール</h1>
        <p className="mt-2 text-muted-foreground">
          URL と CSS セレクタを指定すると、サーバー側 Playwright がページを開いて該当要素を抽出します。
          複数セレクタの同時抽出、テキスト・href・src の取得、JSON / CSV エクスポートに対応します。
        </p>
      </div>

      <ScraperForm
        url={url}
        selectors={selectors}
        isLoading={isLoading}
        onUrlChange={setUrl}
        onSelectorsChange={setSelectors}
        onSubmit={handleSubmit}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>抽出に失敗しました</AlertTitle>
          <AlertDescription>{error.error}</AlertDescription>
        </Alert>
      )}

      <ScraperResult result={result} isLoading={isLoading} />
    </div>
  );
}
