export type Category =
  | "length"
  | "weight"
  | "temperature"
  | "volume"
  | "speed"
  | "data-size";

export type UnitDef = {
  id: string;
  name: string;
  symbol: string;
  toBase: number | null; // null for temperature (special conversion)
};

export type CategoryConfig = {
  id: Category;
  label: string;
  icon: string;
  baseUnitId: string;
  units: UnitDef[];
};

export type ConversionResult = {
  value: number;
  formula: string;
};

export type PinnedConversion = {
  id: string;
  category: Category;
  fromUnitId: string;
  toUnitId: string;
};

export type ActiveInput = "from" | "to";
