"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClipboard } from "@/lib/use-clipboard";

type CronTextInputProps = {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
};

export function CronTextInput({ value, onChange, hasError }: CronTextInputProps) {
  const { copy, isCopied } = useClipboard();

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
        <Button variant="outline" size="icon" onClick={() => copy(value)} aria-label="コピー">
          {isCopied ? (
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
