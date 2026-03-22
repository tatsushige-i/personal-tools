"use client";

import { Plus, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/lib/use-clipboard";
import type { ColorValue, PaletteEntry } from "../lib/types";

type Props = {
  palette: PaletteEntry[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onSelect: (color: ColorValue) => void;
};

export function PalettePanel({
  palette,
  onAdd,
  onRemove,
  onSelect,
}: Props) {
  const { copy, isCopied } = useClipboard();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">パレット</h2>
        <div className="flex gap-2">
          {palette.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => copy(palette.map((e) => e.color.hex).join(", "))}>
              {isCopied ? (
                <Check className="mr-1 h-3.5 w-3.5" aria-hidden />
              ) : (
                <Copy className="mr-1 h-3.5 w-3.5" aria-hidden />
              )}
              すべてコピー
            </Button>
          )}
          <Button size="sm" onClick={onAdd}>
            <Plus className="mr-1 h-3.5 w-3.5" aria-hidden />
            追加
          </Button>
        </div>
      </div>

      {palette.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          色をパレットに追加して保存できます
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {palette.map((entry) => (
            <div key={entry.id} className="group relative">
              <button
                type="button"
                className="h-10 w-10 rounded-lg border-2 transition-shadow hover:ring-2 hover:ring-ring hover:ring-offset-2"
                style={{ backgroundColor: entry.color.hex }}
                onClick={() => onSelect(entry.color)}
                aria-label={`${entry.color.hex}${entry.color.tailwind ? ` (${entry.color.tailwind})` : ""} を選択`}
              />
              <button
                type="button"
                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex"
                aria-label="パレットから削除"
                onClick={() => onRemove(entry.id)}
              >
                <X className="h-2.5 w-2.5" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
