"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { BillOptions, RoundingMethod, RoundingUnit } from "../lib/types";

type Props = {
  options: BillOptions;
  onUpdate: <K extends keyof BillOptions>(key: K, value: BillOptions[K]) => void;
};

const roundingMethods: { value: RoundingMethod; label: string }[] = [
  { value: "ceil", label: "切り上げ" },
  { value: "round", label: "四捨五入" },
  { value: "floor", label: "切り捨て" },
];

const roundingUnits: { value: RoundingUnit; label: string }[] = [
  { value: 1, label: "1円" },
  { value: 10, label: "10円" },
  { value: 100, label: "100円" },
  { value: 500, label: "500円" },
  { value: 1000, label: "1000円" },
];

export function OptionsSection({ options, onUpdate }: Props) {
  return (
    <section className="space-y-4">
      <Label className="text-base font-semibold">オプション</Label>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tax-rate" className="text-sm">税率</Label>
          <div className="relative">
            <Input
              id="tax-rate"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={options.taxRate}
              onChange={(e) => onUpdate("taxRate", e.target.value)}
              className="pr-8"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="service-charge" className="text-sm">サービス料</Label>
          <div className="relative">
            <Input
              id="service-charge"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={options.serviceChargeRate}
              onChange={(e) => onUpdate("serviceChargeRate", e.target.value)}
              className="pr-8"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">端数処理</Label>
        <div className="flex gap-2" role="radiogroup" aria-label="端数処理の方法">
          {roundingMethods.map((m) => (
            <Button
              key={m.value}
              role="radio"
              aria-checked={options.roundingMethod === m.value}
              variant={options.roundingMethod === m.value ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdate("roundingMethod", m.value)}
              className="flex-1"
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">丸め単位</Label>
        <div className="flex gap-2" role="radiogroup" aria-label="丸めの単位">
          {roundingUnits.map((u) => (
            <Button
              key={u.value}
              role="radio"
              aria-checked={options.roundingUnit === u.value}
              variant={options.roundingUnit === u.value ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdate("roundingUnit", u.value)}
              className={cn("flex-1")}
            >
              {u.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
