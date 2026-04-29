"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchCities, WeatherError } from "../lib/weather-client";
import type { GeocodingResult } from "../lib/types";

type Props = {
  onSelect: (result: GeocodingResult) => void;
  onUseCurrentLocation: () => void;
  geolocationDisabled: boolean;
};

const DEBOUNCE_MS = 350;

export function LocationPicker({
  onSelect,
  onUseCurrentLocation,
  geolocationDisabled,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setErrorMessage(null);
      return;
    }
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const handle = setTimeout(async () => {
      setSearching(true);
      setErrorMessage(null);
      try {
        const response = await searchCities(trimmed);
        if (requestIdRef.current === requestId) {
          setResults(response.results);
        }
      } catch (e) {
        if (requestIdRef.current === requestId) {
          const message =
            e instanceof WeatherError
              ? e.message
              : "都市の検索に失敗しました。";
          setErrorMessage(message);
          setResults([]);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setSearching(false);
        }
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="city-search">都市名で検索</Label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="city-search"
              type="search"
              autoComplete="off"
              placeholder="例: 東京 / Tokyo"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={onUseCurrentLocation}
          disabled={geolocationDisabled}
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          現在地を使う
        </Button>
      </div>

      {searching && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          検索中...
        </p>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      {!searching && results.length > 0 && (
        <ul className="divide-y rounded-md border">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(result);
                  setQuery("");
                  setResults([]);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50"
              >
                <span className="font-medium">{result.name}</span>
                <span className="text-xs text-muted-foreground">
                  {[result.admin1, result.country].filter(Boolean).join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!searching && query.trim().length > 0 && results.length === 0 && !errorMessage && (
        <p className="text-sm text-muted-foreground">該当する都市が見つかりませんでした。</p>
      )}
    </div>
  );
}
