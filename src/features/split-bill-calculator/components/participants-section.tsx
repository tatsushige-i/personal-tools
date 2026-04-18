"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Participant } from "../lib/types";

type Props = {
  participants: Participant[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: "name" | "ratio", value: string) => void;
};

export function ParticipantsSection({
  participants,
  onAdd,
  onRemove,
  onUpdate,
}: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">参加者</Label>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </div>
      <div className="space-y-2">
        {participants.map((p, index) => (
          <div key={p.id} className="flex items-center gap-2">
            <Input
              placeholder={`参加者${index + 1}`}
              value={p.name}
              onChange={(e) => onUpdate(p.id, "name", e.target.value)}
              className="flex-1"
              aria-label={`参加者${index + 1}の名前`}
            />
            <div className="relative w-24">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="1"
                value={p.ratio}
                onChange={(e) => onUpdate(p.id, "ratio", e.target.value)}
                className="pr-8"
                aria-label={`参加者${index + 1}の比率`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                倍
              </span>
            </div>
            {participants.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(p.id)}
                aria-label={`${p.name || `参加者${index + 1}`}を削除`}
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
