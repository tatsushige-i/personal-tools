"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CronTextInputProps = {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
};

export function CronTextInput({ value, onChange, hasError }: CronTextInputProps) {
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
      // Clipboard API unavailable
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <Label htmlFor="cron-expression">Cron式</Label>
      <div className="flex gap-2">
        <Input
          id="cron-expression"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="* * * * *"
          className={`font-mono text-lg ${hasError ? "border-destructive focus-visible:ring-destructive" : ""}`}
          aria-invalid={hasError}
        />
        <Button variant="outline" size="icon" onClick={handleCopy} aria-label="コピー">
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        分 時 日 月 曜日（5フィールド）
      </p>
    </div>
  );
}
