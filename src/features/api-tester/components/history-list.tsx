"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RequestRecord } from "../lib/types";

type Props = {
  history: RequestRecord[];
  onSelect: (record: RequestRecord) => void;
  onClear: () => void;
};

export function HistoryList({ history, onSelect, onClear }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        まだリクエストを送信していません。送信した内容がここに表示されます。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          最新 {history.length} 件 (最大 50 件)
        </p>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <Trash2 className="size-4" />
          クリア
        </Button>
      </div>
      <ul className="divide-y rounded-md border">
        {history.map((record) => {
          const status = record.response?.status;
          return (
            <li key={record.id}>
              <button
                type="button"
                onClick={() => onSelect(record)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/50"
              >
                <Badge variant="outline" className="font-mono">
                  {record.method}
                </Badge>
                <span className="flex-1 truncate font-mono text-sm">{record.url}</span>
                {status !== undefined ? (
                  <Badge variant={statusVariant(status)}>{status}</Badge>
                ) : (
                  <Badge variant="destructive">ERR</Badge>
                )}
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {formatTime(record.timestamp)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function statusVariant(status: number): "default" | "secondary" | "destructive" | "outline" {
  if (status >= 200 && status < 300) return "default";
  if (status >= 300 && status < 400) return "secondary";
  return "destructive";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", { hour12: false });
}
