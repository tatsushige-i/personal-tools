"use client";

import { ArrowLeftRight, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ActiveInput, ConversionResult, UnitDef } from "../lib/types";

type UnitSelectorProps = {
  units: UnitDef[];
  selectedId: string;
  onChange: (unitId: string) => void;
  label: string;
};

function UnitSelector({ units, selectedId, onChange, label }: UnitSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-1.5"
    >
      {units.map((unit) => (
        <button
          type="button"
          key={unit.id}
          role="radio"
          aria-checked={selectedId === unit.id}
          onClick={() => onChange(unit.id)}
          className={cn(
            "inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selectedId === unit.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background text-foreground",
          )}
        >
          {unit.symbol}
          <span className="ml-1 text-xs opacity-70">{unit.name}</span>
        </button>
      ))}
    </div>
  );
}

type ConversionPanelProps = {
  units: UnitDef[];
  fromUnitId: string;
  toUnitId: string;
  fromValue: string;
  toValue: string;
  activeInput: ActiveInput;
  conversionResult: ConversionResult | null;
  isPinned: boolean;
  onFromUnitChange: (unitId: string) => void;
  onToUnitChange: (unitId: string) => void;
  onFromValueChange: (value: string) => void;
  onToValueChange: (value: string) => void;
  onSwap: () => void;
  onPin: () => void;
};

export function ConversionPanel({
  units,
  fromUnitId,
  toUnitId,
  fromValue,
  toValue,
  activeInput,
  conversionResult,
  isPinned,
  onFromUnitChange,
  onToUnitChange,
  onFromValueChange,
  onToValueChange,
  onSwap,
  onPin,
}: ConversionPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-start">
        {/* From */}
        <div className="space-y-3">
          <Label htmlFor="from-value">変換元</Label>
          <UnitSelector
            units={units}
            selectedId={fromUnitId}
            onChange={onFromUnitChange}
            label="変換元の単位"
          />
          <Input
            id="from-value"
            type="number"
            value={fromValue}
            onChange={(e) => onFromValueChange(e.target.value)}
            placeholder="0"
            className={activeInput === "from" ? "ring-2 ring-primary" : ""}
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={onSwap}
            aria-label="単位を入れ替え"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        {/* To */}
        <div className="space-y-3">
          <Label htmlFor="to-value">変換先</Label>
          <UnitSelector
            units={units}
            selectedId={toUnitId}
            onChange={onToUnitChange}
            label="変換先の単位"
          />
          <Input
            id="to-value"
            type="number"
            value={toValue}
            onChange={(e) => onToValueChange(e.target.value)}
            placeholder="0"
            className={activeInput === "to" ? "ring-2 ring-primary" : ""}
          />
        </div>
      </div>

      {/* Formula & Pin */}
      <div className="flex items-center justify-between">
        {conversionResult?.formula ? (
          <p className="text-sm text-muted-foreground font-mono">
            {conversionResult.formula}
          </p>
        ) : (
          <span />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPin}
          aria-label={isPinned ? "ピン留め済み" : "ピン留め"}
          disabled={isPinned}
        >
          {isPinned ? (
            <PinOff className="mr-1 h-4 w-4" />
          ) : (
            <Pin className="mr-1 h-4 w-4" />
          )}
          {isPinned ? "ピン留め済み" : "ピン留め"}
        </Button>
      </div>
    </div>
  );
}
