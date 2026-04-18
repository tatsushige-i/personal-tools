"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PinnedConversion } from "../lib/types";
import { getUnit, getCategoryConfig } from "../lib/units";

type PinnedConversionsProps = {
  pinnedConversions: PinnedConversion[];
  onApply: (pinned: PinnedConversion) => void;
  onUnpin: (id: string) => void;
};

export function PinnedConversions({
  pinnedConversions,
  onApply,
  onUnpin,
}: PinnedConversionsProps) {
  if (pinnedConversions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">ピン留め</h2>
      <div className="flex flex-wrap gap-2">
        {pinnedConversions.map((pinned) => {
          const config = getCategoryConfig(pinned.category);
          const fromUnit = getUnit(pinned.category, pinned.fromUnitId);
          const toUnit = getUnit(pinned.category, pinned.toUnitId);
          if (!config || !fromUnit || !toUnit) return null;

          return (
            <div key={pinned.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onApply(pinned)}
                className="inline-flex items-center rounded-full border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1 text-xs font-semibold transition-colors"
              >
                {config.label}: {fromUnit.symbol} → {toUnit.symbol}
              </button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onUnpin(pinned.id)}
                aria-label={`${fromUnit.symbol}→${toUnit.symbol} のピン留めを解除`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
