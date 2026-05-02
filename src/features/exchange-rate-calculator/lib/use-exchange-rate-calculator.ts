"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExchangeRateError,
  fetchCurrencies,
  fetchLatestRates,
  fetchTimeseries,
} from "./exchange-rate-client";
import type {
  ApiErrorCode,
  CurrencyCode,
  CurrencyMap,
  LatestRates,
  Timeseries,
} from "./types";

const DEFAULT_BASE: CurrencyCode = "USD";
const DEFAULT_TARGETS: CurrencyCode[] = ["JPY", "EUR", "GBP"];
const DEFAULT_PRIMARY: CurrencyCode = "JPY";
const DEFAULT_AMOUNT = "100";
const HISTORY_DAYS = 30;

type ErrorState = {
  message: string;
  errorCode?: ApiErrorCode;
};

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rangeKey(base: CurrencyCode, targets: CurrencyCode[]): string {
  return `${base}|${[...targets].sort().join(",")}`;
}

function timeseriesKey(base: CurrencyCode, target: CurrencyCode): string {
  return `${base}->${target}`;
}

function toErrorState(e: unknown): ErrorState {
  if (e instanceof ExchangeRateError) {
    return { message: e.message, errorCode: e.errorCode };
  }
  return {
    message: e instanceof Error ? e.message : "為替レートの取得に失敗しました。",
  };
}

export function useExchangeRateCalculator() {
  const [amount, setAmount] = useState<string>(DEFAULT_AMOUNT);
  const [base, setBase] = useState<CurrencyCode>(DEFAULT_BASE);
  const [targets, setTargets] = useState<CurrencyCode[]>(DEFAULT_TARGETS);
  const [primaryTarget, setPrimaryTarget] = useState<CurrencyCode>(DEFAULT_PRIMARY);

  const [currencies, setCurrencies] = useState<CurrencyMap | null>(null);
  const [currenciesError, setCurrenciesError] = useState<ErrorState | null>(null);

  const [ratesResult, setRatesResult] = useState<{ data: LatestRates; key: string } | null>(null);
  const [ratesError, setRatesError] = useState<{ error: ErrorState; key: string } | null>(null);

  const [historyResult, setHistoryResult] = useState<{ data: Timeseries; key: string } | null>(null);
  const [historyError, setHistoryError] = useState<{ error: ErrorState; key: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCurrencies()
      .then((data) => {
        if (cancelled) return;
        setCurrencies(data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setCurrenciesError(toErrorState(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ratesKey = rangeKey(base, targets);
  useEffect(() => {
    if (targets.length === 0) return;
    let cancelled = false;
    fetchLatestRates(base, targets)
      .then((data) => {
        if (cancelled) return;
        setRatesResult({ data, key: ratesKey });
        setRatesError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setRatesError({ error: toErrorState(e), key: ratesKey });
      });
    return () => {
      cancelled = true;
    };
  }, [base, targets, ratesKey]);

  const historyKey = timeseriesKey(base, primaryTarget);
  useEffect(() => {
    if (base === primaryTarget) return;
    let cancelled = false;
    const today = new Date();
    const startDate = new Date(today.getTime() - HISTORY_DAYS * 86_400_000);
    const start = toIsoDate(startDate);
    const end = toIsoDate(today);
    fetchTimeseries(base, primaryTarget, start, end)
      .then((data) => {
        if (cancelled) return;
        setHistoryResult({ data, key: historyKey });
        setHistoryError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setHistoryError({ error: toErrorState(e), key: historyKey });
      });
    return () => {
      cancelled = true;
    };
  }, [base, primaryTarget, historyKey]);

  const rates =
    targets.length > 0 && ratesResult && ratesResult.key === ratesKey
      ? ratesResult.data
      : null;
  const ratesActiveError =
    ratesError && ratesError.key === ratesKey ? ratesError.error : null;
  const ratesLoading = targets.length > 0 && rates === null && ratesActiveError === null;

  const history =
    base !== primaryTarget && historyResult && historyResult.key === historyKey
      ? historyResult.data
      : null;
  const historyActiveError =
    historyError && historyError.key === historyKey ? historyError.error : null;
  const historyLoading =
    base !== primaryTarget && history === null && historyActiveError === null;

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) ? n : null;
  }, [amount]);

  const conversions = useMemo(() => {
    if (!rates) return [];
    return targets.map((currency) => {
      const rate = rates.rates[currency];
      const converted =
        parsedAmount !== null && Number.isFinite(rate)
          ? parsedAmount * rate
          : null;
      return { currency, rate, converted };
    });
  }, [rates, targets, parsedAmount]);

  const addTarget = useCallback(
    (currency: CurrencyCode) => {
      setTargets((prev) => {
        if (prev.includes(currency)) return prev;
        if (currency === base) return prev;
        return [...prev, currency];
      });
    },
    [base]
  );

  const removeTarget = useCallback(
    (currency: CurrencyCode) => {
      setTargets((prev) => prev.filter((c) => c !== currency));
      setPrimaryTarget((prev) => {
        if (prev !== currency) return prev;
        const next = targets.find((c) => c !== currency);
        return next ?? prev;
      });
    },
    [targets]
  );

  const moveTarget = useCallback(
    (currency: CurrencyCode, direction: "up" | "down") => {
      setTargets((prev) => {
        const index = prev.indexOf(currency);
        if (index < 0) return prev;
        const swapWith = direction === "up" ? index - 1 : index + 1;
        if (swapWith < 0 || swapWith >= prev.length) return prev;
        const next = [...prev];
        [next[index], next[swapWith]] = [next[swapWith], next[index]];
        return next;
      });
    },
    []
  );

  const handleSetBase = useCallback(
    (currency: CurrencyCode) => {
      if (currency === base) return;
      setBase(currency);
      setTargets((prev) => prev.filter((c) => c !== currency));
      setPrimaryTarget((prev) => {
        if (prev === currency) {
          const next = targets.find((c) => c !== currency && c !== base) ?? base;
          return next;
        }
        return prev;
      });
    },
    [base, targets]
  );

  const handleSetPrimaryTarget = useCallback(
    (currency: CurrencyCode) => {
      if (currency === base) return;
      setPrimaryTarget(currency);
      setTargets((prev) => (prev.includes(currency) ? prev : [...prev, currency]));
    },
    [base]
  );

  const swap = useCallback(() => {
    if (base === primaryTarget) return;
    const nextBase = primaryTarget;
    const nextPrimary = base;
    setBase(nextBase);
    setPrimaryTarget(nextPrimary);
    setTargets((prev) => {
      const filtered = prev.filter((c) => c !== nextBase);
      return filtered.includes(nextPrimary) ? filtered : [...filtered, nextPrimary];
    });
  }, [base, primaryTarget]);

  const applyPair = useCallback(
    (from: CurrencyCode, to: CurrencyCode) => {
      if (from === to) return;
      setBase(from);
      setPrimaryTarget(to);
      setTargets((prev) => {
        const filtered = prev.filter((c) => c !== from);
        return filtered.includes(to) ? filtered : [...filtered, to];
      });
    },
    []
  );

  return {
    amount,
    setAmount,
    base,
    targets,
    primaryTarget,
    currencies,
    currenciesError,
    rates,
    ratesError: ratesActiveError,
    ratesLoading,
    history,
    historyError: historyActiveError,
    historyLoading,
    conversions,
    setBase: handleSetBase,
    setPrimaryTarget: handleSetPrimaryTarget,
    addTarget,
    removeTarget,
    moveTarget,
    swap,
    applyPair,
  };
}
