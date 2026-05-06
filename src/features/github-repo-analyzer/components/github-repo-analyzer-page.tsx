"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGithubRepos } from "../lib/use-github-repos";
import type { RepoSummary, SortKey } from "../lib/types";
import { ContributionHeatmap } from "./contribution-heatmap";
import { RepoDetailPanel } from "./repo-detail-panel";
import { RepoList } from "./repo-list";
import { UsernameSearchForm } from "./username-search-form";

export function GithubRepoAnalyzerPage() {
  const [username, setUsername] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [selectedRepo, setSelectedRepo] = useState<RepoSummary | null>(null);

  const { repos, error, loading } = useGithubRepos(username, sort);

  const handleSubmit = (next: string) => {
    setUsername(next);
    setSelectedRepo(null);
  };

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

      <UsernameSearchForm onSubmit={handleSubmit} />

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
            selectedRepoId={selectedRepo?.id ?? null}
            onSelect={setSelectedRepo}
            sort={sort}
            onSortChange={setSort}
          />
          <div>
            {selectedRepo ? (
              <RepoDetailPanel repo={selectedRepo} />
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
