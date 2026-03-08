"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { formatForClipboard } from "../lib/uuid";

type GeneratedOutputProps = {
  values: string[];
};

export function GeneratedOutput({ values }: GeneratedOutputProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatForClipboard(values));
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. non-secure context)
    }
  }, [values]);

  if (values.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">生成結果</h2>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              コピー済み
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              コピー
            </>
          )}
        </Button>
      </div>
      <div className="rounded-md border bg-muted/50 p-4">
        <pre className="text-sm break-all whitespace-pre-wrap">
          {formatForClipboard(values)}
        </pre>
      </div>
    </div>
  );
}
