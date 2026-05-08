"use client";

import { AlertCircle, CircleDot, ExternalLink, GitPullRequest } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCloseDuration, formatCount } from "../lib/format";
import { useCloseTimeStats } from "../lib/use-close-time-stats";
import { useRepoStats } from "../lib/use-repo-stats";
import { LanguageBreakdown } from "./language-breakdown";
import type { CloseTimeMetric, RepoSummary } from "../lib/types";

type Props = {
  repo: RepoSummary;
};

export function RepoDetailPanel({ repo }: Props) {
  const [owner, name] = repo.fullName.split("/");
  const { stats, error, loading } = useRepoStats(owner, name);
  const {
    stats: closeStats,
    error: closeError,
    loading: closeLoading,
  } = useCloseTimeStats(owner, name);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate">{repo.fullName}</span>
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-sm font-normal text-primary hover:underline"
          >
            GitHub
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </CardTitle>
        {repo.description && (
          <CardDescription>{repo.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Stars" value={formatCount(repo.stargazersCount)} />
          <Stat label="Forks" value={formatCount(repo.forksCount)} />
          <Stat
            label="Open Issues"
            value={
              loading
                ? null
                : stats
                  ? formatCount(stats.openIssueCount)
                  : "—"
            }
            icon={<CircleDot className="size-3.5" aria-hidden="true" />}
          />
          <Stat
            label="Open PRs"
            value={
              loading
                ? null
                : stats
                  ? formatCount(stats.openPullRequestCount)
                  : "—"
            }
            icon={<GitPullRequest className="size-3.5" aria-hidden="true" />}
          />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">言語比率</h3>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : error ? (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="size-4" />
              <AlertTitle>統計情報の取得に失敗しました</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : stats ? (
            <LanguageBreakdown languages={stats.languages} />
          ) : null}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">クローズ時間統計</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            最近更新された 100 件のクローズ済み Issue / Pull Request を集計しています。
          </p>
          {closeLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : closeError ? (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="size-4" />
              <AlertTitle>クローズ時間統計の取得に失敗しました</AlertTitle>
              <AlertDescription>{closeError.message}</AlertDescription>
            </Alert>
          ) : closeStats ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CloseTimeCard
                label="Issues"
                icon={<CircleDot className="size-3.5" aria-hidden="true" />}
                metric={closeStats.issues}
              />
              <CloseTimeCard
                label="Pull Requests"
                icon={
                  <GitPullRequest className="size-3.5" aria-hidden="true" />
                }
                metric={closeStats.pullRequests}
              />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function CloseTimeCard({
  label,
  icon,
  metric,
}: {
  label: string;
  icon: React.ReactNode;
  metric: CloseTimeMetric;
}) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      {metric.count === 0 ? (
        <div className="mt-2 text-sm text-muted-foreground">データなし</div>
      ) : (
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">平均</dt>
            <dd className="font-medium">
              {formatCloseDuration(metric.averageMs)}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">中央値</dt>
            <dd className="font-medium">
              {formatCloseDuration(metric.medianMs)}
            </dd>
          </div>
          <div className="flex justify-between gap-2 text-xs text-muted-foreground">
            <dt>件数</dt>
            <dd>{metric.count}件</dd>
          </div>
        </dl>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      {value === null ? (
        <Skeleton className="mt-1 h-6 w-12" />
      ) : (
        <div className="mt-1 text-xl font-semibold">{value}</div>
      )}
    </div>
  );
}
