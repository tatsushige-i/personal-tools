"use client";

import { useCallback, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { captureScreenshots } from "@/features/screenshot-tool/lib/screenshot-client";
import {
  DEVICES,
  type Device,
  type ImageFormat,
  type Scale,
  type ScreenshotError,
  type ScreenshotShot,
} from "@/features/screenshot-tool/lib/types";
import { ScreenshotForm } from "./screenshot-form";
import { ScreenshotResult } from "./screenshot-result";

export function ScreenshotPage() {
  const [url, setUrl] = useState("");
  const [devices, setDevices] = useState<Device[]>([...DEVICES]);
  const [fullPage, setFullPage] = useState(false);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [scale, setScale] = useState<Scale>(1);
  const [shots, setShots] = useState<ScreenshotShot[]>([]);
  const [error, setError] = useState<ScreenshotError | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [lastHostname, setLastHostname] = useState<string | undefined>();

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setShots([]);
    setError(undefined);

    try {
      const u = new URL(url.trim());
      setLastHostname(u.hostname);
    } catch {
      // ignore — server will return validation error
    }

    const result = await captureScreenshots({ url: url.trim(), devices, fullPage, format, scale });
    if (result.ok) {
      setShots(result.data.shots);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [devices, format, fullPage, isLoading, scale, url]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Screenshot Tool</h1>
        <p className="mt-2 text-muted-foreground">
          URL を入力すると、サーバー側 Playwright がデスクトップ・タブレット・モバイルの 3 サイズで
          スクリーンショットを撮影します。OGP 画像の確認やレスポンシブ表示の確認に利用できます。
        </p>
      </div>

      <ScreenshotForm
        url={url}
        devices={devices}
        fullPage={fullPage}
        format={format}
        scale={scale}
        isLoading={isLoading}
        onUrlChange={setUrl}
        onDevicesChange={setDevices}
        onFullPageChange={setFullPage}
        onFormatChange={setFormat}
        onScaleChange={setScale}
        onSubmit={handleSubmit}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>撮影に失敗しました</AlertTitle>
          <AlertDescription>{error.error}</AlertDescription>
        </Alert>
      )}

      <ScreenshotResult
        shots={shots}
        isLoading={isLoading}
        loadingDevices={devices}
        hostname={lastHostname}
      />
    </div>
  );
}
