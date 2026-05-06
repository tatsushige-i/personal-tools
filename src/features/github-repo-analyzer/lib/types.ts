export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "UPSTREAM_ERROR"
  | "SERVER_ERROR"
  | "NO_AUTH_TOKEN"
  | "INVALID_TOKEN";

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionDay = {
  date: string;
  count: number;
  level: ContributionLevel;
};

export type ContributionWeek = {
  days: ContributionDay[];
};

export type ContributionCalendar = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

export type RepoSummary = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  language: string | null;
  updatedAt: string;
  isFork: boolean;
  isArchived: boolean;
};

export type LanguageBreakdown = Record<string, number>;

export type RepoStats = {
  languages: LanguageBreakdown;
  openIssueCount: number;
  openPullRequestCount: number;
};

export type SortKey = "updated" | "stars";
