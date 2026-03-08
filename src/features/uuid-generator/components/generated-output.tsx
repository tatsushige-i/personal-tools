"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { formatForClipboard } from "../lib/uuid";

type GeneratedOutputProps = {
  values: string[];
};

export function GeneratedOutput({ values }: GeneratedOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(formatForClipboard(values));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
