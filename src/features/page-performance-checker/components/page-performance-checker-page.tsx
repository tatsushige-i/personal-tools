"use client";

import { useCallback, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { measurePerformance } from "@/features/page-performance-checker/lib/performance-client";
import {
  DEVICES,
  type Device,
  type DeviceResult,
  type PerformanceError,
} from "@/features/page-performance-checker/lib/types";
import { PerformanceForm } from "./performance-form";
import { PerformanceResult } from "./performance-result";

export function PagePerformanceCheckerPage() {
  const [url, setUrl] = useState("");
  const [devices, setDevices] = useState<Device[]>([...DEVICES]);
  const [results, setResults] = useState<DeviceResult[]>([]);
  const [error, setError] = useState<PerformanceError | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setResults([]);
    setError(undefined);

    const result = await measurePerformance({ url: url.trim(), devices });
    if (result.ok) {
      setResults(result.data.results);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [devices, isLoading, url]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ページパフォーマンスチェッカー</h1>
        <p className="mt-2 text-muted-foreground">
          URL を入力すると、サーバー側 Playwright がページを読み込み、Web Vitals
          相当の指標（LCP / CLS / FCP / TBT）、ナビゲーションタイミング、リソース読み込み一覧を計測します。
          デスクトップとモバイルで結果を比較できます。
        </p>
      </div>

      <PerformanceForm
        url={url}
        devices={devices}
        isLoading={isLoading}
        onUrlChange={setUrl}
        onDevicesChange={setDevices}
        onSubmit={handleSubmit}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>計測に失敗しました</AlertTitle>
          <AlertDescription>{error.error}</AlertDescription>
        </Alert>
      )}

      <PerformanceResult results={results} isLoading={isLoading} loadingDevices={devices} />
    </div>
  );
}
