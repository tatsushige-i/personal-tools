"use client";

import { Button } from "@/components/ui/button";
import type { Mode } from "../lib/types";

type ModeControlsProps = {
  mode: Mode;
  urlSafe: boolean;
  hasInput: boolean;
  onModeChange: (mode: Mode) => void;
  onUrlSafeChange: (urlSafe: boolean) => void;
  onClear: () => void;
};

export function ModeControls({
  mode,
  urlSafe,
  hasInput,
  onModeChange,
  onUrlSafeChange,
  onClear,
}: ModeControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border p-1">
        <Button
          variant={mode === "encode" ? "default" : "ghost"}
          size="xs"
          onClick={() => onModeChange("encode")}
        >
          Encode
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "ghost"}
          size="xs"
          onClick={() => onModeChange("decode")}
        >
          Decode
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-md border p-1">
        <Button
          variant={!urlSafe ? "default" : "ghost"}
          size="xs"
          onClick={() => onUrlSafeChange(false)}
        >
          Standard
        </Button>
        <Button
          variant={urlSafe ? "default" : "ghost"}
          size="xs"
          onClick={() => onUrlSafeChange(true)}
        >
          URL-safe
        </Button>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onClear}
        disabled={!hasInput}
      >
        クリア
      </Button>
    </div>
  );
}
