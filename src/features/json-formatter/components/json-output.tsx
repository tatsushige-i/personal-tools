"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

type JsonOutputProps = {
  value: string;
};

export function JsonOutput({ value }: JsonOutputProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore
    }
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
