"use client";

import { useState, useMemo, useCallback } from "react";
import { DiffControls } from "@/features/diff-viewer/components/diff-controls";
import { DiffInputPanel } from "@/features/diff-viewer/components/diff-input-panel";
import { DiffOutput } from "@/features/diff-viewer/components/diff-output";
import { computeDiff, exportUnifiedDiff } from "@/features/diff-viewer/lib/diff";
import type { DiffMode, InputMode } from "@/features/diff-viewer/lib/types";

export function DiffViewerPage() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffMode, setDiffMode] = useState<DiffMode>("line");
  const [inputMode, setInputMode] = useState<InputMode>("text");

  const diffResult = useMemo(() => {
    if (!leftText && !rightText) return null;
    return computeDiff(leftText, rightText, diffMode, inputMode);
  }, [leftText, rightText, diffMode, inputMode]);

  const canExport = leftText.trim().length > 0 || rightText.trim().length > 0;

  const handleExport = useCallback(async () => {
    const unified = exportUnifiedDiff(leftText, rightText, inputMode);
    try {
      await navigator.clipboard.writeText(unified);
    } catch {
      // Clipboard API unavailable
    }
  }, [leftText, rightText, inputMode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diff Viewer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            2つのテキストの差分を表示します
          </p>
        </div>
        <DiffControls
          diffMode={diffMode}
          onDiffModeChange={setDiffMode}
          inputMode={inputMode}
          onInputModeChange={setInputMode}
          onExport={handleExport}
          canExport={canExport}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DiffInputPanel
          label="Original"
          value={leftText}
          onChange={setLeftText}
          inputMode={inputMode}
        />
        <DiffInputPanel
          label="Modified"
          value={rightText}
          onChange={setRightText}
          inputMode={inputMode}
        />
      </div>

      <DiffOutput result={diffResult} diffMode={diffMode} />
    </div>
  );
}
