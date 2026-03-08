"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IdType } from "../lib/types";

type GeneratorControlsProps = {
  idType: IdType;
  count: number;
  onIdTypeChange: (type: IdType) => void;
  onCountChange: (count: number) => void;
  onGenerate: () => void;
};

const ID_TYPE_OPTIONS: { value: IdType; label: string }[] = [
  { value: "uuidv4", label: "UUID v4" },
  { value: "uuidv7", label: "UUID v7" },
  { value: "ulid", label: "ULID" },
];

export function GeneratorControls({
  idType,
  count,
  onIdTypeChange,
  onCountChange,
  onGenerate,
}: GeneratorControlsProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label htmlFor="id-type">種類</Label>
        <Select value={idType} onValueChange={(v) => onIdTypeChange(v as IdType)}>
          <SelectTrigger id="id-type" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ID_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="count">件数</Label>
        <Input
          id="count"
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 1 && val <= 100) {
              onCountChange(val);
            }
          }}
          className="w-[100px]"
        />
      </div>

      <Button onClick={onGenerate}>生成</Button>
    </div>
  );
}
