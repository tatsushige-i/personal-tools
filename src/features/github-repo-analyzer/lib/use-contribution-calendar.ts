"use client";

import { useEffect, useState } from "react";
import { GithubApiError, fetchContributionCalendar } from "./github-client";
import type { ApiErrorCode, ContributionCalendar } from "./types";

type ErrorState = {
  message: string;
  errorCode?: ApiErrorCode;
};

function toErrorState(e: unknown): ErrorState {
  if (e instanceof GithubApiError) {
    return { message: e.message, errorCode: e.errorCode };
  }
  return {
    message:
      e instanceof Error
        ? e.message
        : "コントリビューション情報の取得に失敗しました。",
  };
}

export function useContributionCalendar(username: string) {
  const key = username;
  const [result, setResult] = useState<
    { data: ContributionCalendar; key: string } | null
  >(null);
  const [errorState, setErrorState] = useState<
    { error: ErrorState; key: string } | null
  >(null);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    fetchContributionCalendar(username)
      .then((calendar) => {
        if (cancelled) return;
        setResult({ data: calendar, key });
        setErrorState(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setErrorState({ error: toErrorState(e), key });
      });
    return () => {
      cancelled = true;
    };
  }, [username, key]);

  const calendar = result && result.key === key ? result.data : null;
  const error =
    errorState && errorState.key === key ? errorState.error : null;
  const loading = username !== "" && calendar === null && error === null;

  return { calendar, error, loading };
}
