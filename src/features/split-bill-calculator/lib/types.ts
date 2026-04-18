export type RoundingMethod = "ceil" | "floor" | "round";
export type RoundingUnit = 1 | 10 | 100 | 500 | 1000;

export type BillItem = {
  id: string;
  name: string;
  amount: string;
};

export type Participant = {
  id: string;
  name: string;
  ratio: string;
};

export type BillOptions = {
  taxRate: string;
  serviceChargeRate: string;
  roundingMethod: RoundingMethod;
  roundingUnit: RoundingUnit;
};

export type PerPersonResult = {
  participantId: string;
  name: string;
  ratio: number;
  amount: number;
};

export type SplitResult = {
  subtotal: number;
  taxAmount: number;
  serviceChargeAmount: number;
  totalAmount: number;
  perPersonResults: PerPersonResult[];
  adjustedTotal: number;
  difference: number;
};
