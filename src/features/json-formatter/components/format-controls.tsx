import { Button } from "@/components/ui/button";
import type { IndentSize, ViewMode } from "../lib/types";

type FormatControlsProps = {
  indentSize: IndentSize;
  viewMode: ViewMode;
  hasInput: boolean;
  onIndentSizeChange: (size: IndentSize) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onFormat: () => void;
  onMinify: () => void;
  onClear: () => void;
};

export function FormatControls({
  indentSize,
  viewMode,
  hasInput,
  onIndentSizeChange,
  onViewModeChange,
  onFormat,
  onMinify,
  onClear,
}: FormatControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border p-1">
        <Button
          variant={indentSize === 2 ? "default" : "ghost"}
          size="xs"
          onClick={() => onIndentSizeChange(2)}
        >
          2スペース
        </Button>
        <Button
          variant={indentSize === 4 ? "default" : "ghost"}
          size="xs"
          onClick={() => onIndentSizeChange(4)}
        >
          4スペース
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-md border p-1">
        <Button
          variant={viewMode === "formatted" ? "default" : "ghost"}
          size="xs"
          onClick={() => onViewModeChange("formatted")}
        >
          テキスト
        </Button>
        <Button
          variant={viewMode === "tree" ? "default" : "ghost"}
          size="xs"
          onClick={() => onViewModeChange("tree")}
        >
          ツリー
        </Button>
      </div>

      <Button size="sm" onClick={onFormat} disabled={!hasInput}>
        整形
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={onMinify}
        disabled={!hasInput}
      >
        圧縮
      </Button>
      <Button size="sm" variant="outline" onClick={onClear} disabled={!hasInput}>
        クリア
      </Button>
    </div>
  );
}
