"use client";

import { useCallback, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchOgpPreview } from "@/features/ogp-preview/lib/ogp-preview-client";
import type {
  OgpPreviewData,
  OgpPreviewError,
} from "@/features/ogp-preview/lib/types";
import { OgpPreviewForm } from "./ogp-preview-form";
import { OgpPreviewResult } from "./ogp-preview-result";

export function OgpPreviewPage() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<OgpPreviewData | undefined>();
  const [error, setError] = useState<OgpPreviewError | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setData(undefined);
    setError(undefined);

    const result = await fetchOgpPreview({ url: url.trim() });
    if (result.ok) {
      setData(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [isLoading, url]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">OGP Meta Preview</h1>
        <p className="mt-2 text-muted-foreground">
          URLを入力すると、サーバー側のPlaywrightがページを描画してOGP・Twitter Card・一般メタタグを抽出します。
          SNS表示プレビューとtitle/descriptionの長さチェックを行えます。
        </p>
      </div>

      <OgpPreviewForm
        url={url}
        isLoading={isLoading}
        onUrlChange={setUrl}
        onSubmit={handleSubmit}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>解析に失敗しました</AlertTitle>
          <AlertDescription>{error.error}</AlertDescription>
        </Alert>
      )}

      {data && !isLoading && <OgpPreviewResult data={data} />}
    </div>
  );
}
