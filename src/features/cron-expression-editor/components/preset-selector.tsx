"use client";

import { Button } from "@/components/ui/button";
import { CRON_PRESETS } from "../lib/presets";

type PresetSelectorProps = {
  onSelect: (expression: string) => void;
};

export function PresetSelector({ onSelect }: PresetSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">プリセット</p>
      <div className="flex flex-wrap gap-2">
        {CRON_PRESETS.map((preset) => (
          <Button
            key={preset.expression}
            variant="outline"
            size="sm"
            onClick={() => onSelect(preset.expression)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
