"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SplitResult } from "../lib/types";
import { formatCurrency } from "../lib/calculator";

type Props = {
  result: SplitResult;
};

export function ResultsSection({ result }: Props) {
  const showBreakdown =
    result.taxAmount > 0 || result.serviceChargeAmount > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">計算結果</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showBreakdown && (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">小計</span>
              <span>{formatCurrency(result.subtotal)}円</span>
            </div>
            {result.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">税額</span>
                <span>{formatCurrency(result.taxAmount)}円</span>
              </div>
            )}
            {result.serviceChargeAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">サービス料</span>
                <span>{formatCurrency(result.serviceChargeAmount)}円</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>合計</span>
              <span>{formatCurrency(result.totalAmount)}円</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {result.perPersonResults.map((pr) => (
            <div
              key={pr.participantId}
              className="flex items-baseline justify-between"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-medium">{pr.name}</span>
                {pr.ratio !== 1 && (
                  <span className="text-xs text-muted-foreground">
                    ({pr.ratio}倍)
                  </span>
                )}
              </div>
              <span className="text-lg font-bold tabular-nums">
                {formatCurrency(pr.amount)}円
              </span>
            </div>
          ))}
        </div>

        {result.difference !== 0 && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>端数処理後の合計</span>
                <span>{formatCurrency(result.adjustedTotal)}円</span>
              </div>
              <div className="flex justify-between">
                <span>差額</span>
                <span>
                  {result.difference > 0 ? "+" : ""}
                  {formatCurrency(result.difference)}円
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
