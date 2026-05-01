"use client";

import { ArrowLeftRight, ChevronDown, ChevronUp, Plus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatRate } from "../lib/calculator";
import type { CurrencyCode, CurrencyMap } from "../lib/types";

type ConversionRow = {
  currency: CurrencyCode;
  rate: number | undefined;
  converted: number | null;
};

type Props = {
  amount: string;
  onAmountChange: (value: string) => void;
  base: CurrencyCode;
  onBaseChange: (currency: CurrencyCode) => void;
  primaryTarget: CurrencyCode;
  onPrimaryTargetChange: (currency: CurrencyCode) => void;
  targets: CurrencyCode[];
  onAddTarget: (currency: CurrencyCode) => void;
  onRemoveTarget: (currency: CurrencyCode) => void;
  onMoveTarget: (currency: CurrencyCode, direction: "up" | "down") => void;
  onSwap: () => void;
  conversions: ConversionRow[];
  ratesDate: string | null;
  ratesLoading: boolean;
  currencies: CurrencyMap | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export function ConverterPanel({
  amount,
  onAmountChange,
  base,
  onBaseChange,
  primaryTarget,
  onPrimaryTargetChange,
  targets,
  onAddTarget,
  onRemoveTarget,
  onMoveTarget,
  onSwap,
  conversions,
  ratesDate,
  ratesLoading,
  currencies,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const currencyEntries = currencies
    ? Object.entries(currencies).sort(([a], [b]) => a.localeCompare(b))
    : [];
  const addCandidates = currencyEntries.filter(
    ([code]) => code !== base && !targets.includes(code)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>金額を換算</CardTitle>
          <Button
            type="button"
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            onClick={onToggleFavorite}
            disabled={base === primaryTarget}
            aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
            aria-pressed={isFavorite}
          >
            <Star
              className="h-4 w-4"
              fill={isFavorite ? "currentColor" : "none"}
              aria-hidden="true"
            />
            <span className="ml-1 hidden sm:inline">
              {isFavorite ? "お気に入り済み" : "お気に入り"}
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="exchange-amount">金額</Label>
            <Input
              id="exchange-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              min={0}
              step="any"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exchange-base">基準通貨</Label>
            <CurrencySelect
              id="exchange-base"
              value={base}
              onValueChange={onBaseChange}
              currencies={currencyEntries}
              excluded={[]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exchange-primary">主要な変換先</Label>
            <div className="flex gap-2">
              <CurrencySelect
                id="exchange-primary"
                value={primaryTarget}
                onValueChange={onPrimaryTargetChange}
                currencies={currencyEntries}
                excluded={[base]}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onSwap}
                disabled={base === primaryTarget}
                aria-label="基準通貨と主要な変換先を入れ替え"
              >
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>変換結果</Label>
            {ratesDate && (
              <span className="text-xs text-muted-foreground">基準日: {ratesDate}</span>
            )}
          </div>
          {ratesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : conversions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              変換先を追加してください。
            </p>
          ) : (
            <ul className="divide-y rounded-md border">
              {conversions.map((row, index) => (
                <li
                  key={row.currency}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <span className="font-mono text-sm font-semibold">{row.currency}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {currencies?.[row.currency] ?? ""}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold tabular-nums">
                      {row.converted !== null
                        ? formatAmount(row.converted, row.currency)
                        : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      1 {base} = {row.rate !== undefined ? formatRate(row.rate) : "—"} {row.currency}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveTarget(row.currency, "up")}
                      disabled={index === 0}
                      aria-label={`${row.currency} を上へ移動`}
                    >
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveTarget(row.currency, "down")}
                      disabled={index === conversions.length - 1}
                      aria-label={`${row.currency} を下へ移動`}
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveTarget(row.currency)}
                      aria-label={`${row.currency} を削除`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <Label>変換先を追加</Label>
          <AddCurrencyControl
            candidates={addCandidates}
            onAdd={onAddTarget}
            disabled={!currencies}
          />
          <CurrentTargets targets={targets} onRemove={onRemoveTarget} />
        </div>
      </CardContent>
    </Card>
  );
}

type CurrencySelectProps = {
  id?: string;
  value: CurrencyCode;
  onValueChange: (value: CurrencyCode) => void;
  currencies: Array<[string, string]>;
  excluded: CurrencyCode[];
};

function CurrencySelect({ id, value, onValueChange, currencies, excluded }: CurrencySelectProps) {
  const filtered = currencies.filter(([code]) => !excluded.includes(code));
  const items = filtered.length > 0 ? filtered : currencies;
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map(([code, name]) => (
          <SelectItem key={code} value={code}>
            <span className="font-mono">{code}</span>
            <span className="ml-2 text-muted-foreground">{name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type AddCurrencyControlProps = {
  candidates: Array<[string, string]>;
  onAdd: (code: CurrencyCode) => void;
  disabled: boolean;
};

function AddCurrencyControl({ candidates, onAdd, disabled }: AddCurrencyControlProps) {
  return (
    <Select
      value=""
      onValueChange={(value) => {
        if (value) onAdd(value);
      }}
      disabled={disabled || candidates.length === 0}
    >
      <SelectTrigger className="w-full sm:w-72">
        <Plus className="h-4 w-4" aria-hidden="true" />
        <SelectValue placeholder="通貨を選択して追加" />
      </SelectTrigger>
      <SelectContent position="popper">
        {candidates.map(([code, name]) => (
          <SelectItem key={code} value={code}>
            <span className="font-mono">{code}</span>
            <span className="ml-2 text-muted-foreground">{name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CurrentTargets({
  targets,
  onRemove,
}: {
  targets: CurrencyCode[];
  onRemove: (code: CurrencyCode) => void;
}) {
  if (targets.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {targets.map((code) => (
        <Badge key={code} variant="secondary" className="gap-1 font-mono">
          {code}
          <button
            type="button"
            onClick={() => onRemove(code)}
            aria-label={`${code} を削除`}
            className="ml-0.5 inline-flex items-center justify-center rounded-sm hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
