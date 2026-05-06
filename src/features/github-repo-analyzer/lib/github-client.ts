import type {
  ApiErrorCode,
  ContributionCalendar,
  RepoStats,
  RepoSummary,
  SortKey,
} from "./types";

export class GithubApiError extends Error {
  readonly errorCode: ApiErrorCode | undefined;

  constructor(message: string, errorCode?: ApiErrorCode) {
    super(message);
    this.name = "GithubApiError";
    this.errorCode = errorCode;
  }
}

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error ?? `リクエストに失敗しました。（${res.status}）`;
    throw new GithubApiError(message, body?.errorCode);
  }
  return res.json() as Promise<T>;
}

export function fetchUserRepos(
  username: string,
  sort: SortKey
): Promise<{ repos: RepoSummary[] }> {
  const params = new URLSearchParams({
    mode: "repos",
    username,
    sort,
  });
  return request<{ repos: RepoSummary[] }>(
    `/api/github?${params.toString()}`
  );
}

export function fetchRepoStats(
  owner: string,
  repo: string
): Promise<RepoStats> {
  const params = new URLSearchParams({
    mode: "repo-stats",
    owner,
    repo,
  });
  return request<RepoStats>(`/api/github?${params.toString()}`);
}

export function fetchContributionCalendar(
  username: string
): Promise<ContributionCalendar> {
  const params = new URLSearchParams({
    mode: "contributions",
    username,
  });
  return request<ContributionCalendar>(`/api/github?${params.toString()}`);
}
