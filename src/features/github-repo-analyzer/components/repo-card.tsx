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
};

export function RepoCard({ repo, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(repo)}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary ring-2 ring-primary"
      )}
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
  );
}
