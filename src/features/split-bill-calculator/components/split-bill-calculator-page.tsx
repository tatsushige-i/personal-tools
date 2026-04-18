"use client";

import { Separator } from "@/components/ui/separator";
import { useSplitBillCalculator } from "../lib/use-split-bill-calculator";
import { BillItemsSection } from "./bill-items-section";
import { OptionsSection } from "./options-section";
import { ParticipantsSection } from "./participants-section";
import { ResultsSection } from "./results-section";

export function SplitBillCalculatorPage() {
  const {
    items,
    participants,
    options,
    result,
    addItem,
    removeItem,
    updateItem,
    addParticipant,
    removeParticipant,
    updateParticipant,
    updateOptions,
  } = useSplitBillCalculator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Split Bill Calculator
        </h1>
        <p className="mt-2 text-muted-foreground">
          飲み会や食事の割り勘を計算。端数処理や傾斜配分にも対応。
        </p>
      </div>

      <BillItemsSection
        items={items}
        onAdd={addItem}
        onRemove={removeItem}
        onUpdate={updateItem}
      />

      <Separator />

      <OptionsSection options={options} onUpdate={updateOptions} />

      <Separator />

      <ParticipantsSection
        participants={participants}
        onAdd={addParticipant}
        onRemove={removeParticipant}
        onUpdate={updateParticipant}
      />

      <Separator />

      {result && <ResultsSection result={result} />}
    </div>
  );
}
