export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "SERVER_ERROR";

export type CurrencyCode = string;

export type CurrencyMap = Record<CurrencyCode, string>;

export type LatestRates = {
  base: CurrencyCode;
  date: string;
  rates: Record<CurrencyCode, number>;
};

export type TimeseriesPoint = {
  date: string;
  rate: number;
};

export type Timeseries = {
  base: CurrencyCode;
  target: CurrencyCode;
  start: string;
  end: string;
  points: TimeseriesPoint[];
};

export type FavoritePair = {
  id: string;
  from: CurrencyCode;
  to: CurrencyCode;
};
