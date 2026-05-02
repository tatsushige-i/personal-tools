"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IpInfoError, fetchLookup, fetchSelfInfo } from "./ip-info-client";
import type {
  ApiErrorCode,
  IpInfo,
  SelfInfoResponse,
} from "./types";

type ErrorState = {
  message: string;
  errorCode?: ApiErrorCode;
};

function toErrorState(e: unknown, fallback: string): ErrorState {
  if (e instanceof IpInfoError) {
    return { message: e.message, errorCode: e.errorCode };
  }
  return {
    message: e instanceof Error ? e.message : fallback,
  };
}

type LookupState =
  | { status: "idle" }
  | { status: "loading"; ip: string }
  | { status: "success"; ip: string; data: IpInfo }
  | { status: "error"; ip: string; error: ErrorState };

export function useIpInfo() {
  const [self, setSelf] = useState<SelfInfoResponse | null>(null);
  const [selfError, setSelfError] = useState<ErrorState | null>(null);
  const [selfLoading, setSelfLoading] = useState(true);
  const [lookupState, setLookupState] = useState<LookupState>({ status: "idle" });
  const lookupRequestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetchSelfInfo()
      .then((data) => {
        if (cancelled) return;
        setSelf(data);
        setSelfError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setSelfError(toErrorState(e, "自分のIP情報の取得に失敗しました。"));
      })
      .finally(() => {
        if (cancelled) return;
        setSelfLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lookup = useCallback((ip: string) => {
    const trimmed = ip.trim();
    if (!trimmed) return;
    const requestId = lookupRequestIdRef.current + 1;
    lookupRequestIdRef.current = requestId;
    setLookupState({ status: "loading", ip: trimmed });
    fetchLookup(trimmed)
      .then(({ geo }) => {
        if (lookupRequestIdRef.current !== requestId) return;
        setLookupState({ status: "success", ip: trimmed, data: geo });
      })
      .catch((e: unknown) => {
        if (lookupRequestIdRef.current !== requestId) return;
        setLookupState({
          status: "error",
          ip: trimmed,
          error: toErrorState(e, "IPアドレス情報の取得に失敗しました。"),
        });
      });
  }, []);

  return {
    self,
    selfError,
    selfLoading,
    lookupState,
    lookup,
  };
}
