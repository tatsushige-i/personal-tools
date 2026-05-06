import { NextResponse } from "next/server";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";
import type {
  ContributionCalendar,
  ContributionLevel,
  LanguageBreakdown,
  RepoStats,
  RepoSummary,
  SortKey,
} from "@/features/github-repo-analyzer/lib/types";

const GITHUB_API_BASE = "https://api.github.com";
const USER_AGENT = "personal-tools";
const USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO_NAME_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;
const REPOS_PER_PAGE = 100;
const MAX_REPOS = 100;

const rateLimit = createRateLimit({ limit: 30, windowMs: 60_000 });

export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (ip !== "unknown") {
    const result = rateLimit.check(ip);
    if (!result.allowed) {
      return rateLimitResponse(result.retryAfterMs);
    }
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  if (mode === "repos") {
    return handleRepos(searchParams);
  }
  if (mode === "repo-stats") {
    return handleRepoStats(searchParams);
  }
  if (mode === "contributions") {
    return handleContributions(searchParams);
  }
  return validationError(
    "mode は repos / repo-stats / contributions のいずれかを指定してください。"
  );
}

async function handleRepos(params: URLSearchParams): Promise<Response> {
  const username = params.get("username") ?? "";
  const sortRaw = params.get("sort") ?? "updated";

  if (!USERNAME_PATTERN.test(username)) {
    return validationError(
      "username は1〜39文字の英数字とハイフンで指定してください。"
    );
  }
  const sort: SortKey = sortRaw === "stars" ? "stars" : "updated";

  const url = new URL(`${GITHUB_API_BASE}/users/${username}/repos`);
  url.searchParams.set("per_page", String(REPOS_PER_PAGE));
  url.searchParams.set("type", "owner");
  url.searchParams.set("sort", "updated");

  const upstream = await fetchUpstream(
    url,
    "リポジトリ一覧の取得に失敗しました。"
  );
  if (!upstream.ok) return upstream.errorResponse;

  const raw = (await upstream.response.json()) as GithubRepoResponse[];
  let summaries: RepoSummary[] = raw.map(toRepoSummary);
  if (sort === "stars") {
    summaries = [...summaries].sort(
      (a, b) => b.stargazersCount - a.stargazersCount
    );
  }
  if (summaries.length > MAX_REPOS) {
    summaries = summaries.slice(0, MAX_REPOS);
  }
  return NextResponse.json({ repos: summaries });
}

async function handleRepoStats(params: URLSearchParams): Promise<Response> {
  const owner = params.get("owner") ?? "";
  const repo = params.get("repo") ?? "";

  if (!USERNAME_PATTERN.test(owner)) {
    return validationError(
      "owner は1〜39文字の英数字とハイフンで指定してください。"
    );
  }
  if (!REPO_NAME_PATTERN.test(repo)) {
    return validationError(
      "repo は1〜100文字の英数字・ドット・アンダースコア・ハイフンで指定してください。"
    );
  }

  const languagesUrl = new URL(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`
  );
  const issueSearchUrl = new URL(`${GITHUB_API_BASE}/search/issues`);
  issueSearchUrl.searchParams.set(
    "q",
    `repo:${owner}/${repo} state:open is:issue`
  );
  issueSearchUrl.searchParams.set("per_page", "1");
  const prSearchUrl = new URL(`${GITHUB_API_BASE}/search/issues`);
  prSearchUrl.searchParams.set("q", `repo:${owner}/${repo} state:open is:pr`);
  prSearchUrl.searchParams.set("per_page", "1");

  const [languagesResult, issuesResult, prsResult] = await Promise.all([
    fetchUpstream(languagesUrl, "言語比率の取得に失敗しました。"),
    fetchUpstream(issueSearchUrl, "Issue 数の取得に失敗しました。"),
    fetchUpstream(prSearchUrl, "Pull Request 数の取得に失敗しました。"),
  ]);

  if (!languagesResult.ok) return languagesResult.errorResponse;
  if (!issuesResult.ok) return issuesResult.errorResponse;
  if (!prsResult.ok) return prsResult.errorResponse;

  const languages = (await languagesResult.response.json()) as LanguageBreakdown;
  const issuesPayload =
    (await issuesResult.response.json()) as GithubSearchResponse;
  const prsPayload = (await prsResult.response.json()) as GithubSearchResponse;

  const stats: RepoStats = {
    languages,
    openIssueCount: issuesPayload.total_count ?? 0,
    openPullRequestCount: prsPayload.total_count ?? 0,
  };
  return NextResponse.json(stats);
}

type UpstreamResult =
  | { ok: true; response: Response }
  | { ok: false; errorResponse: Response };

async function fetchUpstream(
  url: URL,
  failureMessage: string
): Promise<UpstreamResult> {
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": USER_AGENT,
      },
    });
  } catch {
    return {
      ok: false,
      errorResponse: NextResponse.json(
        {
          error: "GitHub に接続できませんでした。",
          errorCode: "UPSTREAM_ERROR",
        },
        { status: 502 }
      ),
    };
  }

  if (!upstream.ok) {
    if (upstream.status === 404) {
      return {
        ok: false,
        errorResponse: NextResponse.json(
          {
            error: "指定されたリソースが見つかりませんでした。",
            errorCode: "NOT_FOUND",
          },
          { status: 404 }
        ),
      };
    }
    if (
      upstream.status === 403 &&
      upstream.headers.get("X-RateLimit-Remaining") === "0"
    ) {
      return {
        ok: false,
        errorResponse: NextResponse.json(
          {
            error:
              "GitHub API のレート制限に達しました。しばらく経ってから再度お試しください。",
            errorCode: "RATE_LIMITED",
          },
          { status: 429 }
        ),
      };
    }
    if (upstream.status === 422) {
      return {
        ok: false,
        errorResponse: NextResponse.json(
          { error: failureMessage, errorCode: "VALIDATION_ERROR" },
          { status: 400 }
        ),
      };
    }
    return {
      ok: false,
      errorResponse: NextResponse.json(
        { error: failureMessage, errorCode: "UPSTREAM_ERROR" },
        { status: 502 }
      ),
    };
  }

  return { ok: true, response: upstream };
}

function validationError(message: string): Response {
  return NextResponse.json(
    { error: message, errorCode: "VALIDATION_ERROR" },
    { status: 400 }
  );
}

function toRepoSummary(raw: GithubRepoResponse): RepoSummary {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    description: raw.description,
    htmlUrl: raw.html_url,
    stargazersCount: raw.stargazers_count ?? 0,
    forksCount: raw.forks_count ?? 0,
    openIssuesCount: raw.open_issues_count ?? 0,
    language: raw.language,
    updatedAt: raw.updated_at,
    isFork: raw.fork ?? false,
    isArchived: raw.archived ?? false,
  };
}

type GithubRepoResponse = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  language: string | null;
  updated_at: string;
  fork?: boolean;
  archived?: boolean;
};

type GithubSearchResponse = {
  total_count?: number;
};

const CONTRIBUTIONS_QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

async function handleContributions(params: URLSearchParams): Promise<Response> {
  const username = params.get("username") ?? "";
  if (!USERNAME_PATTERN.test(username)) {
    return validationError(
      "username は1〜39文字の英数字とハイフンで指定してください。"
    );
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "GITHUB_TOKEN が設定されていません。.env.local に設定してください。",
        errorCode: "NO_AUTH_TOKEN",
      },
      { status: 503 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${GITHUB_API_BASE}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login: username },
      }),
    });
  } catch {
    return NextResponse.json(
      {
        error: "GitHub に接続できませんでした。",
        errorCode: "UPSTREAM_ERROR",
      },
      { status: 502 }
    );
  }

  if (upstream.status === 401) {
    return NextResponse.json(
      {
        error:
          "GITHUB_TOKEN が無効です。.env.local に有効なトークンを設定してください。",
        errorCode: "INVALID_TOKEN",
      },
      { status: 401 }
    );
  }
  if (
    upstream.status === 403 &&
    upstream.headers.get("X-RateLimit-Remaining") === "0"
  ) {
    return NextResponse.json(
      {
        error:
          "GitHub API のレート制限に達しました。しばらく経ってから再度お試しください。",
        errorCode: "RATE_LIMITED",
      },
      { status: 429 }
    );
  }
  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: "コントリビューション情報の取得に失敗しました。",
        errorCode: "UPSTREAM_ERROR",
      },
      { status: 502 }
    );
  }

  const payload = (await upstream.json()) as GraphQLContributionsResponse;

  const notFound = payload.errors?.some((e) => e.type === "NOT_FOUND");
  if (notFound || !payload.data?.user) {
    return NextResponse.json(
      {
        error: "指定されたユーザーが見つかりませんでした。",
        errorCode: "NOT_FOUND",
      },
      { status: 404 }
    );
  }

  if (payload.errors && payload.errors.length > 0) {
    return NextResponse.json(
      {
        error: "コントリビューション情報の取得に失敗しました。",
        errorCode: "UPSTREAM_ERROR",
      },
      { status: 502 }
    );
  }

  const calendar =
    payload.data.user.contributionsCollection.contributionCalendar;
  const result: ContributionCalendar = {
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks.map((w) => ({
      days: w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: toContributionLevel(d.contributionLevel),
      })),
    })),
  };
  return NextResponse.json(result);
}

function toContributionLevel(level: string): ContributionLevel {
  switch (level) {
    case "FIRST_QUARTILE":
      return 1;
    case "SECOND_QUARTILE":
      return 2;
    case "THIRD_QUARTILE":
      return 3;
    case "FOURTH_QUARTILE":
      return 4;
    default:
      return 0;
  }
}

type GraphQLContributionsResponse = {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }[];
        };
      };
    } | null;
  };
  errors?: { type?: string; message?: string }[];
};
