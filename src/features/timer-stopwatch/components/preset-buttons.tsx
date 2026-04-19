"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  onSelect: (title: string, durationMs: number) => void;
};

const presets: { label: string; title: string; durationMs: number }[] = [
  { label: "5分", title: "5分タイマー", durationMs: 5 * 60_000 },
  { label: "10分", title: "10分タイマー", durationMs: 10 * 60_000 },
  { label: "25分 (ポモドーロ)", title: "ポモドーロ", durationMs: 25 * 60_000 },
];

export function PresetButtons({ onSelect }: Props) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">プリセット</Label>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Button
            key={p.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelect(p.title, p.durationMs)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
