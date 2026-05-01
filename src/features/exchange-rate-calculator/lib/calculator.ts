import type { CurrencyCode } from "./types";

export function convert(amount: number, rate: number): number {
  return amount * rate;
}

export function formatAmount(value: number, currency: CurrencyCode): string {
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      maximumFractionDigits: 4,
    }).format(value);
  } catch {
    return `${value.toLocaleString("ja-JP", { maximumFractionDigits: 4 })} ${currency}`;
  }
}

export function formatRate(rate: number): string {
  if (!Number.isFinite(rate)) return "—";
  return rate.toLocaleString("ja-JP", { maximumFractionDigits: 6 });
}
