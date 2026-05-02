"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { RepoCard } from "./repo-card";
import type { RepoSummary, SortKey } from "../lib/types";

type Props = {
  repos: RepoSummary[] | null;
  loading: boolean;
  selectedRepoId: number | null;
  onSelect: (repo: RepoSummary) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
};

export function RepoList({
  repos,
  loading,
  selectedRepoId,
  onSelect,
  sort,
  onSortChange,
}: Props) {
  const sortedRepos = repos
    ? [...repos].sort((a, b) => {
        if (sort === "stars") return b.stargazersCount - a.stargazersCount;
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      })
    : null;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          リポジトリ
          {sortedRepos && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {sortedRepos.length}件
            </span>
          )}
        </h2>
        <div
          className="inline-flex rounded-md border bg-background p-0.5"
          role="radiogroup"
          aria-label="並び替え"
        >
          <SortToggle
            label="更新日"
            active={sort === "updated"}
            onClick={() => onSortChange("updated")}
          />
          <SortToggle
            label="スター数"
            active={sort === "stars"}
            onClick={() => onSortChange("stars")}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : sortedRepos && sortedRepos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          公開リポジトリが見つかりませんでした。
        </p>
      ) : sortedRepos ? (
        <div className="space-y-3">
          {sortedRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              selected={repo.id === selectedRepoId}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SortToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={active}
      className={
        active
          ? "rounded-sm bg-primary px-3 py-1 text-sm text-primary-foreground"
          : "rounded-sm px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
      }
    >
      {label}
    </button>
  );
}
