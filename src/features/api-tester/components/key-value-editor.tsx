"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { KeyValue } from "../lib/types";
import { createEmptyRow } from "../lib/key-value-utils";

type Props = {
  rows: KeyValue[];
  onChange: (rows: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  emptyLabel?: string;
};

export function KeyValueEditor({
  rows,
  onChange,
  keyPlaceholder = "key",
  valuePlaceholder = "value",
  emptyLabel = "まだ項目がありません。",
}: Props) {
  const updateRow = (id: string, patch: Partial<KeyValue>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((row) => row.id !== id));
  };

  const addRow = () => {
    onChange([...rows, createEmptyRow()]);
  };

  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => {
            const rowNumber = index + 1;
            return (
              <div key={row.id} className="flex items-center gap-2">
                <Switch
                  size="sm"
                  checked={row.enabled}
                  onCheckedChange={(enabled) => updateRow(row.id, { enabled })}
                  aria-label={`${rowNumber}行目を有効にする`}
                />
                <Input
                  value={row.key}
                  onChange={(e) => updateRow(row.id, { key: e.target.value })}
                  placeholder={keyPlaceholder}
                  className="flex-1 font-mono"
                  aria-label={`${rowNumber}行目 ${keyPlaceholder}`}
                />
                <Input
                  value={row.value}
                  onChange={(e) => updateRow(row.id, { value: e.target.value })}
                  placeholder={valuePlaceholder}
                  className="flex-1 font-mono"
                  aria-label={`${rowNumber}行目 ${valuePlaceholder}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeRow(row.id)}
                  aria-label={`${rowNumber}行目を削除`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="size-4" />
        行を追加
      </Button>
    </div>
  );
}
