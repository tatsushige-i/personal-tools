"use client";

import { useMemo, useSyncExternalStore } from "react";

function serverSnapshot(): number {
  return 0;
}

export function useNow(intervalMs: number, active: boolean): number {
  const subscribe = useMemo(() => {
    return (onChange: () => void) => {
      if (!active) return () => {};
      const handle = setInterval(onChange, intervalMs);
      return () => clearInterval(handle);
    };
  }, [active, intervalMs]);

  return useSyncExternalStore(subscribe, Date.now, serverSnapshot);
}
