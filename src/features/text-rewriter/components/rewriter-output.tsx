"use client";

import { Button } from "@/components/ui/button";
import { useClipboard } from "@/lib/use-clipboard";
import { Check, Copy } from "lucide-react";

type RewriterOutputProps = {
  result: string;
};

export function RewriterOutput({ result }: RewriterOutputProps) {
  const { copy, isCopied } = useClipboard();

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">変換結果</h2>
        <Button variant="outline" size="sm" onClick={() => copy(result)}>
          {isCopied ? (
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
        <pre className="text-sm break-all whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  );
}
