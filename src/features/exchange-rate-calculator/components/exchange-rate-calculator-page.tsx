"use client";

import { useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useExchangeRateCalculator } from "../lib/use-exchange-rate-calculator";
import { useFavoritePairs } from "../lib/use-favorite-pairs";
import { ConverterPanel } from "./converter-panel";
import { FavoritePairs } from "./favorite-pairs";
import { RateHistoryChart } from "./rate-history-chart";

export function ExchangeRateCalculatorPage() {
  const {
    amount,
    setAmount,
    base,
    targets,
    primaryTarget,
    currencies,
    currenciesError,
    rates,
    ratesError,
    ratesLoading,
    history,
    historyError,
    historyLoading,
    conversions,
    setBase,
    setPrimaryTarget,
    addTarget,
    removeTarget,
    moveTarget,
    swap,
    applyPair,
  } = useExchangeRateCalculator();

  const favorites = useFavoritePairs();
  const isFavorite = favorites.has(base, primaryTarget);

  const handleToggleFavorite = useCallback(() => {
    if (base === primaryTarget) return;
    if (isFavorite) {
      const target = favorites.pairs.find(
        (p) => p.from === base && p.to === primaryTarget
      );
      if (target) favorites.remove(target.id);
    } else {
      favorites.add(base, primaryTarget);
    }
  }, [base, primaryTarget, isFavorite, favorites]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exchange Rate Calculator</h1>
        <p className="mt-2 text-muted-foreground">
          ECBが公表する日次の為替レートで通貨を変換します。Frankfurter API を使用しています（平日1日1回更新、週末・祝日は直近営業日のレート）。
        </p>
      </div>

      {currenciesError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>通貨一覧の取得に失敗しました</AlertTitle>
          <AlertDescription>{currenciesError.message}</AlertDescription>
        </Alert>
      )}

      {ratesError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>為替レートの取得に失敗しました</AlertTitle>
          <AlertDescription>{ratesError.message}</AlertDescription>
        </Alert>
      )}

      <ConverterPanel
        amount={amount}
        onAmountChange={setAmount}
        base={base}
        onBaseChange={setBase}
        primaryTarget={primaryTarget}
        onPrimaryTargetChange={setPrimaryTarget}
        targets={targets}
        onAddTarget={addTarget}
        onRemoveTarget={removeTarget}
        onMoveTarget={moveTarget}
        onSwap={swap}
        conversions={conversions}
        ratesDate={rates?.date ?? null}
        ratesLoading={ratesLoading}
        currencies={currencies}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
      />

      <FavoritePairs
        pairs={favorites.pairs}
        onApply={applyPair}
        onRemove={favorites.remove}
      />

      {historyError ? (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>レート推移の取得に失敗しました</AlertTitle>
          <AlertDescription>{historyError.message}</AlertDescription>
        </Alert>
      ) : (
        <RateHistoryChart
          base={base}
          target={primaryTarget}
          history={history}
          loading={historyLoading}
        />
      )}
    </div>
  );
}
