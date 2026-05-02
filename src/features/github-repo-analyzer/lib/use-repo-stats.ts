"use client";

import { useEffect, useState } from "react";
import { GithubApiError, fetchRepoStats } from "./github-client";
import type { ApiErrorCode, RepoStats } from "./types";

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
      e instanceof Error ? e.message : "統計情報の取得に失敗しました。",
  };
}

export function useRepoStats(owner: string | null, repo: string | null) {
  const key = owner && repo ? `${owner}/${repo}` : "";
  const [result, setResult] = useState<{ data: RepoStats; key: string } | null>(
    null
  );
  const [errorState, setErrorState] = useState<
    { error: ErrorState; key: string } | null
  >(null);

  useEffect(() => {
    if (!owner || !repo) return;
    let cancelled = false;
    fetchRepoStats(owner, repo)
      .then((data) => {
        if (cancelled) return;
        setResult({ data, key });
        setErrorState(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setErrorState({ error: toErrorState(e), key });
      });
    return () => {
      cancelled = true;
    };
  }, [owner, repo, key]);

  const stats = result && result.key === key ? result.data : null;
  const error =
    errorState && errorState.key === key ? errorState.error : null;
  const loading = key !== "" && stats === null && error === null;

  return { stats, error, loading };
}
