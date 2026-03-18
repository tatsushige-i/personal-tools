"use client";

import { Badge } from "@/components/ui/badge";
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
          <Badge
            key={preset.expression}
            variant="outline"
            className="cursor-pointer hover:bg-accent"
            onClick={() => onSelect(preset.expression)}
          >
            {preset.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
