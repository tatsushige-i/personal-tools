"use client";

import { useCallback, useEffect, useState } from "react";
import type { CurrencyCode, FavoritePair } from "./types";

const STORAGE_KEY = "exchange-rate-calculator:favorite-pairs";

function isFavoritePair(value: unknown): value is FavoritePair {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.from === "string" &&
    typeof v.to === "string"
  );
}

function loadFromStorage(): FavoritePair[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFavoritePair);
  } catch {
    return [];
  }
}

export function useFavoritePairs() {
  const [pairs, setPairs] = useState<FavoritePair[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage はクライアント側のみで参照できる外部システムのため、
    // マウント後の同期は副作用として扱う必要がある。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPairs(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));
    } catch {
      // ignore quota / serialization errors
    }
  }, [pairs, hydrated]);

  const has = useCallback(
    (from: CurrencyCode, to: CurrencyCode) =>
      pairs.some((p) => p.from === from && p.to === to),
    [pairs]
  );

  const add = useCallback((from: CurrencyCode, to: CurrencyCode) => {
    setPairs((prev) => {
      if (prev.some((p) => p.from === from && p.to === to)) return prev;
      return [...prev, { id: crypto.randomUUID(), from, to }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setPairs((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { pairs, hydrated, has, add, remove };
}
