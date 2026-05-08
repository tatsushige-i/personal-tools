"use client";

import { useCallback, useEffect, useState } from "react";
import type { FavoriteType, GithubFavorite } from "./types";

const STORAGE_KEY = "github-repo-analyzer:favorites";

function isGithubFavorite(value: unknown): value is GithubFavorite {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    (v.type === "user" || v.type === "repo") &&
    typeof v.value === "string"
  );
}

function loadFromStorage(): GithubFavorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGithubFavorite);
  } catch {
    return [];
  }
}

export function useGithubFavorites() {
  const [favorites, setFavorites] = useState<GithubFavorite[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage はクライアント側のみで参照できる外部システムのため、
    // マウント後の同期は副作用として扱う必要がある。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore quota / serialization errors
    }
  }, [favorites, hydrated]);

  const has = useCallback(
    (type: FavoriteType, value: string) =>
      favorites.some((f) => f.type === type && f.value === value),
    [favorites]
  );

  const add = useCallback((type: FavoriteType, value: string) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.type === type && f.value === value)) return prev;
      return [...prev, { id: crypto.randomUUID(), type, value }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { favorites, hydrated, has, add, remove };
}
