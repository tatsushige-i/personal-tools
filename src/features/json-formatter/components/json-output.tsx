"use client";

import { Button } from "@/components/ui/button";
import { useClipboard } from "@/lib/use-clipboard";
import { Check, Copy } from "lucide-react";

type JsonOutputProps = {
  value: string;
};

export function JsonOutput({ value }: JsonOutputProps) {
  const { copy, isCopied } = useClipboard();

  if (!value) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-2 right-2"
        onClick={() => copy(value)}
        aria-label="コピー"
      >
        {isCopied ? (
          <Check className="size-3" />
        ) : (
          <Copy className="size-3" />
        )}
      </Button>
      <pre className="overflow-auto rounded-md border bg-muted/50 p-4 text-sm font-mono">
        {value}
      </pre>
    </div>
  );
}
