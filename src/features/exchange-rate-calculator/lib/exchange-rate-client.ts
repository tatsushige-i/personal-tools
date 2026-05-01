import type {
  ApiErrorCode,
  CurrencyCode,
  CurrencyMap,
  LatestRates,
  Timeseries,
} from "./types";

export class ExchangeRateError extends Error {
  readonly errorCode: ApiErrorCode | undefined;

  constructor(message: string, errorCode?: ApiErrorCode) {
    super(message);
    this.name = "ExchangeRateError";
    this.errorCode = errorCode;
  }
}

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error ?? `リクエストに失敗しました。（${res.status}）`;
    throw new ExchangeRateError(message, body?.errorCode);
  }
  return res.json() as Promise<T>;
}

export function fetchCurrencies(): Promise<CurrencyMap> {
  const params = new URLSearchParams({ mode: "currencies" });
  return request<CurrencyMap>(`/api/exchange-rate?${params.toString()}`);
}

export function fetchLatestRates(
  base: CurrencyCode,
  targets: CurrencyCode[]
): Promise<LatestRates> {
  const params = new URLSearchParams({
    mode: "latest",
    from: base,
    to: targets.join(","),
  });
  return request<LatestRates>(`/api/exchange-rate?${params.toString()}`);
}

export function fetchTimeseries(
  base: CurrencyCode,
  target: CurrencyCode,
  start: string,
  end: string
): Promise<Timeseries> {
  const params = new URLSearchParams({
    mode: "timeseries",
    from: base,
    to: target,
    start,
    end,
  });
  return request<Timeseries>(`/api/exchange-rate?${params.toString()}`);
}
