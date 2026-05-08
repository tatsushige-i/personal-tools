"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGithubFavorites } from "../lib/use-github-favorites";
import { useGithubRepos } from "../lib/use-github-repos";
import type { RepoSummary, SortKey } from "../lib/types";
import { ContributionHeatmap } from "./contribution-heatmap";
import { GithubFavoritesList } from "./github-favorites-list";
import { RepoDetailPanel } from "./repo-detail-panel";
import { RepoList } from "./repo-list";
import { UserFavoriteToggle } from "./user-favorite-toggle";
import { UsernameSearchForm } from "./username-search-form";

export function GithubRepoAnalyzerPage() {
  const [username, setUsername] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [selectedRepo, setSelectedRepo] = useState<RepoSummary | null>(null);
  const [pendingRepoSelection, setPendingRepoSelection] = useState<
    string | null
  >(null);

  const { repos, error, loading } = useGithubRepos(username, sort);
  const favorites = useGithubFavorites();

  const displayedRepo =
    selectedRepo ??
    (pendingRepoSelection && repos
      ? repos.find((r) => r.fullName === pendingRepoSelection) ?? null
      : null);

  const handleSubmit = (next: string) => {
    setUsername(next);
    setSelectedRepo(null);
    setPendingRepoSelection(null);
  };

  const handleToggleUserFavorite = () => {
    if (!username) return;
    const existing = favorites.favorites.find(
      (f) => f.type === "user" && f.value === username
    );
    if (existing) {
      favorites.remove(existing.id);
    } else {
      favorites.add("user", username);
    }
  };

  const handleToggleRepoFavorite = (repo: RepoSummary) => {
    const existing = favorites.favorites.find(
      (f) => f.type === "repo" && f.value === repo.fullName
    );
    if (existing) {
      favorites.remove(existing.id);
    } else {
      favorites.add("repo", repo.fullName);
    }
  };

  const handleSelectFavoriteUser = (value: string) => {
    setUsername(value);
    setSelectedRepo(null);
    setPendingRepoSelection(null);
  };

  const handleSelectFavoriteRepo = (fullName: string) => {
    const [owner] = fullName.split("/");
    if (!owner) return;
    setUsername(owner);
    setSelectedRepo(null);
    setPendingRepoSelection(fullName);
  };

  const isUserFavorite = favorites.has("user", username);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          GitHub Repo Analyzer
        </h1>
        <p className="mt-2 text-muted-foreground">
          GitHub の公開リポジトリ情報を取得して可視化します。ユーザー名を入力するとそのユーザーの公開リポジトリ一覧と統計が表示されます（未認証API使用、レート制限60req/h）。
        </p>
      </div>

      <UsernameSearchForm
        key={username}
        onSubmit={handleSubmit}
        initialValue={username}
      />

      {username && (
        <UserFavoriteToggle
          username={username}
          isFavorite={isUserFavorite}
          onToggle={handleToggleUserFavorite}
        />
      )}

      <GithubFavoritesList
        favorites={favorites.favorites}
        onSelectUser={handleSelectFavoriteUser}
        onSelectRepo={handleSelectFavoriteRepo}
        onRemove={favorites.remove}
      />

      {username && <ContributionHeatmap username={username} />}

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />
          <AlertTitle>リポジトリの取得に失敗しました</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {username && !error && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <RepoList
            repos={repos}
            loading={loading}
            selectedRepoId={displayedRepo?.id ?? null}
            onSelect={(repo) => {
              setSelectedRepo(repo);
              setPendingRepoSelection(null);
            }}
            sort={sort}
            onSortChange={setSort}
            getIsFavorite={(repo) => favorites.has("repo", repo.fullName)}
            onToggleFavorite={handleToggleRepoFavorite}
          />
          <div>
            {displayedRepo ? (
              <RepoDetailPanel repo={displayedRepo} />
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                リポジトリを選択すると詳細が表示されます。
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
