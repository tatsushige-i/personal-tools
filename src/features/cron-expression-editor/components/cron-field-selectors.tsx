"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CronField, CronFields } from "../lib/types";

type FieldConfig = {
  field: CronField;
  label: string;
  options: { value: string; label: string }[];
};

function generateRange(start: number, end: number): { value: string; label: string }[] {
  const items: { value: string; label: string }[] = [];
  for (let i = start; i <= end; i++) {
    items.push({ value: String(i), label: String(i) });
  }
  return items;
}

const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const FIELD_CONFIGS: FieldConfig[] = [
  {
    field: "minute",
    label: "分",
    options: [
      { value: "*", label: "毎分 (*)" },
      { value: "*/5", label: "5分毎 (*/5)" },
      { value: "*/10", label: "10分毎 (*/10)" },
      { value: "*/15", label: "15分毎 (*/15)" },
      { value: "*/30", label: "30分毎 (*/30)" },
      ...generateRange(0, 59),
    ],
  },
  {
    field: "hour",
    label: "時",
    options: [
      { value: "*", label: "毎時 (*)" },
      ...generateRange(0, 23),
    ],
  },
  {
    field: "dayOfMonth",
    label: "日",
    options: [
      { value: "*", label: "毎日 (*)" },
      ...generateRange(1, 31),
    ],
  },
  {
    field: "month",
    label: "月",
    options: [
      { value: "*", label: "毎月 (*)" },
      ...Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: MONTH_NAMES[i],
      })),
    ],
  },
  {
    field: "dayOfWeek",
    label: "曜日",
    options: [
      { value: "*", label: "毎日 (*)" },
      { value: "1-5", label: "平日 (1-5)" },
      ...Array.from({ length: 7 }, (_, i) => ({
        value: String(i),
        label: `${DAY_NAMES[i]} (${i})`,
      })),
    ],
  },
];

type CronFieldSelectorsProps = {
  fields: CronFields;
  onFieldChange: (field: CronField, value: string) => void;
};

export function CronFieldSelectors({ fields, onFieldChange }: CronFieldSelectorsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {FIELD_CONFIGS.map(({ field, label, options }) => {
        const currentValue = fields[field];
        const hasExactOption = options.some((o) => o.value === currentValue);

        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={`cron-field-${field}`}>{label}</Label>
            <Select
              value={hasExactOption ? currentValue : "__custom__"}
              onValueChange={(v) => {
                if (v !== "__custom__") {
                  onFieldChange(field, v);
                }
              }}
            >
              <SelectTrigger id={`cron-field-${field}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {!hasExactOption && (
                  <SelectItem value="__custom__" disabled>
                    {currentValue}
                  </SelectItem>
                )}
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
