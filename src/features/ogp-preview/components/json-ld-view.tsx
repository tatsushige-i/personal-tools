"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { JsonLdEntry } from "@/features/ogp-preview/lib/types";

type Props = {
  entries: JsonLdEntry[];
};

export function JsonLdView({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        構造化データ（JSON-LD）は見つかりませんでした。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div key={i} className="rounded-md border">
          {entry.parseError ? (
            <Alert variant="destructive" className="rounded-md border-0">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>JSON-LDの解析に失敗しました</AlertTitle>
              <AlertDescription>
                <p className="text-xs">{entry.parseError}</p>
                <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-2 text-xs">
                  {entry.raw}
                </pre>
              </AlertDescription>
            </Alert>
          ) : (
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(entry.parsed, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
