"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

type JsonOutputProps = {
  value: string;
};

export function JsonOutput({ value }: JsonOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  if (!value) return null;

  return (
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
      <pre className="overflow-auto rounded-md border bg-muted/50 p-4 text-sm font-mono">
        {value}
      </pre>
    </div>
  );
}
