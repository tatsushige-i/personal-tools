"use client";

import { Separator } from "@/components/ui/separator";
import { useUnitConverter } from "../lib/use-unit-converter";
import { CategoryTabs } from "./category-tabs";
import { ConversionPanel } from "./conversion-panel";
import { PinnedConversions } from "./pinned-conversions";

export function UnitConverterPage() {
  const {
    category,
    fromUnitId,
    toUnitId,
    displayFromValue,
    displayToValue,
    activeInput,
    categoryConfig,
    conversionResult,
    pinnedConversions,
    isPinned,
    setFromUnitId,
    setToUnitId,
    onFromValueChange,
    onToValueChange,
    onSwap,
    onCategoryChange,
    onPin,
    onUnpin,
    onApplyPinned,
  } = useUnitConverter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Unit Converter</h1>
        <p className="mt-2 text-muted-foreground">
          長さ・重さ・温度など各種単位を変換するツール
        </p>
      </div>

      <CategoryTabs
        category={category}
        onCategoryChange={onCategoryChange}
      />

      <ConversionPanel
        units={categoryConfig.units}
        fromUnitId={fromUnitId}
        toUnitId={toUnitId}
        fromValue={displayFromValue}
        toValue={displayToValue}
        activeInput={activeInput}
        conversionResult={conversionResult}
        isPinned={isPinned}
        onFromUnitChange={setFromUnitId}
        onToUnitChange={setToUnitId}
        onFromValueChange={onFromValueChange}
        onToValueChange={onToValueChange}
        onSwap={onSwap}
        onPin={onPin}
      />

      {pinnedConversions.length > 0 && (
        <>
          <Separator />
          <PinnedConversions
            pinnedConversions={pinnedConversions}
            onApply={onApplyPinned}
            onUnpin={onUnpin}
          />
        </>
      )}
    </div>
  );
}
