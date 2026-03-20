"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { normalizeJson } from "@/features/diff-viewer/lib/diff";
import type { InputMode } from "@/features/diff-viewer/lib/types";

type DiffInputPanelProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode: InputMode;
};

export function DiffInputPanel({ id, label, value, onChange, inputMode }: DiffInputPanelProps) {
  const jsonError = useMemo(() => {
    if (inputMode !== "json" || !value.trim()) return null;
    const result = normalizeJson(value);
    return result.success ? null : result.error;
  }, [inputMode, value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {jsonError && (
          <span className="text-xs text-destructive" role="alert">
            {jsonError}
          </span>
        )}
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={inputMode === "json" ? '{"key": "value"}' : "テキストを貼り付け..."}
        className="min-h-64 max-h-[32rem] resize-y font-mono text-sm"
        spellCheck={false}
      />
    </div>
  );
}
