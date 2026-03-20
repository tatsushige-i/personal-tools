"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DiffMode, InputMode } from "@/features/diff-viewer/lib/types";

type DiffControlsProps = {
  diffMode: DiffMode;
  onDiffModeChange: (mode: DiffMode) => void;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  onExport: () => Promise<boolean>;
  canExport: boolean;
};

export function DiffControls({
  diffMode,
  onDiffModeChange,
  inputMode,
  onInputModeChange,
  onExport,
  canExport,
}: DiffControlsProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExport = useCallback(async () => {
    const success = await onExport();
    if (!success) return;
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [onExport]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={diffMode} onValueChange={(v) => onDiffModeChange(v as DiffMode)}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="line">行単位</SelectItem>
          <SelectItem value="word">単語単位</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex rounded-md border">
        <Button
          variant={inputMode === "text" ? "default" : "ghost"}
          size="sm"
          className="rounded-r-none border-0"
          onClick={() => onInputModeChange("text")}
        >
          テキスト
        </Button>
        <Button
          variant={inputMode === "json" ? "default" : "ghost"}
          size="sm"
          className="rounded-l-none border-0"
          onClick={() => onInputModeChange("json")}
        >
          JSON
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={!canExport}
        onClick={handleExport}
        aria-label="Unified diffをクリップボードにコピー"
      >
        {copied ? (
          <>
            <Check className="mr-1.5 size-4" />
            コピー済み
          </>
        ) : (
          <>
            <ClipboardCopy className="mr-1.5 size-4" />
            Unified diffをコピー
          </>
        )}
      </Button>
    </div>
  );
}
