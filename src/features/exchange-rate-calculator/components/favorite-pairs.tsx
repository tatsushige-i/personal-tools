"use client";

import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CurrencyCode, FavoritePair } from "../lib/types";

type Props = {
  pairs: FavoritePair[];
  onApply: (from: CurrencyCode, to: CurrencyCode) => void;
  onRemove: (id: string) => void;
};

export function FavoritePairs({ pairs, onApply, onRemove }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>お気に入り通貨ペア</CardTitle>
      </CardHeader>
      <CardContent>
        {pairs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            よく使う通貨ペアを「お気に入り」ボタンで登録できます。
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pairs.map((pair) => (
              <Badge
                key={pair.id}
                variant="outline"
                className="gap-1 px-2 py-1 font-mono text-sm"
              >
                <button
                  type="button"
                  onClick={() => onApply(pair.from, pair.to)}
                  className="hover:underline"
                >
                  {pair.from} → {pair.to}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(pair.id)}
                  aria-label={`お気に入り ${pair.from} → ${pair.to} を削除`}
                  className="ml-1 inline-flex items-center justify-center rounded-sm hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
