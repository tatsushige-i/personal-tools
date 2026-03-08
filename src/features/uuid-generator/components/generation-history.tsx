"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { IdType, GenerationRecord } from "../lib/types";

type GenerationHistoryProps = {
  history: GenerationRecord[];
};

const TYPE_LABELS: Record<IdType, string> = {
  uuidv4: "UUID v4",
  uuidv7: "UUID v7",
  ulid: "ULID",
};

export function GenerationHistory({ history }: GenerationHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Separator />
      <h2 className="text-sm font-medium">履歴</h2>
      <div className="space-y-3">
        {history.map((record) => (
          <div key={record.id} className="rounded-md border p-3 text-sm">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary">{TYPE_LABELS[record.type]}</Badge>
              <span className="text-muted-foreground">
                {record.count}件 ·{" "}
                {record.timestamp.toLocaleTimeString("ja-JP")}
              </span>
            </div>
            <pre className="text-xs text-muted-foreground break-all whitespace-pre-wrap">
              {record.values.join("\n")}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
