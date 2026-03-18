"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, Copy } from "lucide-react";
import type { Mode } from "../lib/types";
import type { Base64Result } from "../lib/types";
import { buildDataUri, detectImageMimeType } from "../lib/base64";

type TextOutputProps = {
  result: Base64Result | null;
  mode: Mode;
};

export function TextOutput({ result, mode }: TextOutputProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result?.success) return;
    try {
      await navigator.clipboard.writeText(result.data);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }, [result]);

  if (!result) return null;

  const label = mode === "encode" ? "Base64出力" : "デコード結果";

  if (!result.success) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {result.error}
        </div>
      </div>
    );
  }

  // デコードモードで画像が検出された場合、プレビューを表示
  const imageMimeType =
    mode === "encode" ? null : detectImageMimeType(result.data);
  const imageDataUri =
    imageMimeType ? buildDataUri(result.data, imageMimeType) : null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute top-2 right-2"
          onClick={handleCopy}
          aria-label="コピー"
        >
          {copied ? (
            <Check className="size-3" />
          ) : (
            <Copy className="size-3" />
          )}
        </Button>
        <pre className="overflow-auto rounded-md border bg-muted/50 p-4 pr-10 text-sm font-mono whitespace-pre-wrap break-all">
          {result.data}
        </pre>
      </div>
      {imageDataUri && (
        <div className="rounded-md border p-4">
          <p className="mb-2 text-sm text-muted-foreground">
            画像プレビュー ({imageMimeType})
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUri}
            alt="デコードされた画像"
            className="max-h-64 rounded"
          />
        </div>
      )}
    </div>
  );
}
