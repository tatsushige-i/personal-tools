"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_TIMEOUT = 2000;

export function useClipboard(timeout = DEFAULT_TIMEOUT) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        if (timerRef.current) clearTimeout(timerRef.current);
        setCopiedValue(text);
        timerRef.current = setTimeout(() => setCopiedValue(null), timeout);
      } catch {
        // Clipboard API unavailable
      }
    },
    [timeout],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const markCopied = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCopiedValue("__marked__");
    timerRef.current = setTimeout(() => setCopiedValue(null), timeout);
  }, [timeout]);

  const isCopied = copiedValue !== null;

  return { copy, isCopied, copiedValue, markCopied };
}
