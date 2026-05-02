"use client";

import { useEffect, useState } from "react";
import { GithubApiError, fetchUserRepos } from "./github-client";
import type { ApiErrorCode, RepoSummary, SortKey } from "./types";

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
      e instanceof Error ? e.message : "リポジトリの取得に失敗しました。",
  };
}

export function useGithubRepos(username: string, sort: SortKey) {
  const key = `${username}|${sort}`;
  const [result, setResult] = useState<
    { data: RepoSummary[]; key: string } | null
  >(null);
  const [errorState, setErrorState] = useState<
    { error: ErrorState; key: string } | null
  >(null);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    fetchUserRepos(username, sort)
      .then(({ repos }) => {
        if (cancelled) return;
        setResult({ data: repos, key });
        setErrorState(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setErrorState({ error: toErrorState(e), key });
      });
    return () => {
      cancelled = true;
    };
  }, [username, sort, key]);

  const repos = result && result.key === key ? result.data : null;
  const error =
    errorState && errorState.key === key ? errorState.error : null;
  const loading = username !== "" && repos === null && error === null;

  return { repos, error, loading };
}
