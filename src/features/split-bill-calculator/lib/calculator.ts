import type {
  BillItem,
  BillOptions,
  Participant,
  RoundingMethod,
  RoundingUnit,
  SplitResult,
} from "./types";

export function roundAmount(
  amount: number,
  method: RoundingMethod,
  unit: RoundingUnit,
): number {
  const fn =
    method === "ceil"
      ? Math.ceil
      : method === "floor"
        ? Math.floor
        : Math.round;
  return fn(amount / unit) * unit;
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("ja-JP");
}

export function calculateSplit(
  items: BillItem[],
  participants: Participant[],
  options: BillOptions,
): SplitResult | null {
  if (participants.length === 0) return null;

  const subtotal = items.reduce((sum, item) => {
    const val = parseFloat(item.amount);
    return sum + (Number.isFinite(val) ? val : 0);
  }, 0);

  if (subtotal <= 0) return null;

  const taxRate = parseFloat(options.taxRate) || 0;
  const serviceChargeRate = parseFloat(options.serviceChargeRate) || 0;

  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const serviceChargeAmount = Math.round(
    subtotal * (serviceChargeRate / 100),
  );
  const totalAmount = subtotal + taxAmount + serviceChargeAmount;

  const ratios = participants.map((p) => {
    const r = parseFloat(p.ratio);
    return Number.isFinite(r) && r > 0 ? r : 1;
  });
  const totalRatio = ratios.reduce((sum, r) => sum + r, 0);

  const perPersonResults = participants.map((p, i) => {
    const ratio = ratios[i];
    const share = (totalAmount * ratio) / totalRatio;
    const amount = roundAmount(
      share,
      options.roundingMethod,
      options.roundingUnit,
    );
    return {
      participantId: p.id,
      name: p.name || `参加者${i + 1}`,
      ratio,
      amount,
    };
  });

  const adjustedTotal = perPersonResults.reduce(
    (sum, r) => sum + r.amount,
    0,
  );
  const difference = adjustedTotal - totalAmount;

  return {
    subtotal,
    taxAmount,
    serviceChargeAmount,
    totalAmount,
    perPersonResults,
    adjustedTotal,
    difference,
  };
}
