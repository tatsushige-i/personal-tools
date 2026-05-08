"use client";

import { GitFork, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCount, formatRelativeDate } from "../lib/format";
import type { RepoSummary } from "../lib/types";

type Props = {
  repo: RepoSummary;
  selected: boolean;
  onSelect: (repo: RepoSummary) => void;
  isFavorite: boolean;
  onToggleFavorite: (repo: RepoSummary) => void;
};

export function RepoCard({
  repo,
  selected,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: Props) {
  return (
    <div
      className={cn(
        "relative rounded-lg border bg-card transition-colors",
        selected && "border-primary ring-2 ring-primary"
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(repo)}
        aria-pressed={selected}
        className="w-full rounded-lg p-4 pr-12 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{repo.name}</h3>
            {repo.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {repo.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {repo.isArchived && <Badge variant="secondary">Archived</Badge>}
            {repo.isFork && <Badge variant="outline">Fork</Badge>}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {repo.language && <span>{repo.language}</span>}
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5" aria-hidden="true" />
            {formatCount(repo.stargazersCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="size-3.5" aria-hidden="true" />
            {formatCount(repo.forksCount)}
          </span>
          <span>更新 {formatRelativeDate(repo.updatedAt)}</span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onToggleFavorite(repo)}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `${repo.fullName} をお気に入りから削除`
            : `${repo.fullName} をお気に入りに追加`
        }
        className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Star
          className={cn("size-4", isFavorite && "fill-current text-yellow-500")}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
