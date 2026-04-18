"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BillItem } from "../lib/types";

type Props = {
  items: BillItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: "name" | "amount", value: string) => void;
};

export function BillItemsSection({ items, onAdd, onRemove, onUpdate }: Props) {
  const showName = items.length > 1;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">金額</Label>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" />
          項目追加
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            {showName && (
              <Input
                placeholder={`項目${index + 1}`}
                value={item.name}
                onChange={(e) => onUpdate(item.id, "name", e.target.value)}
                className="flex-1"
              />
            )}
            <div className="relative flex-1">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={item.amount}
                onChange={(e) => onUpdate(item.id, "amount", e.target.value)}
                className="pr-8"
                aria-label={showName ? `${item.name || `項目${index + 1}`}の金額` : "合計金額"}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                円
              </span>
            </div>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                aria-label={`${item.name || `項目${index + 1}`}を削除`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
