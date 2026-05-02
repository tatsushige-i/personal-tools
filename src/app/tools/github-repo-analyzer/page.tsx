import type { Metadata } from "next";
import { GithubRepoAnalyzerPage } from "@/features/github-repo-analyzer/components/github-repo-analyzer-page";

export const metadata: Metadata = {
  title: "GitHub Repo Analyzer - Personal Tools",
  description: "GitHubユーザーの公開リポジトリ一覧と統計を可視化",
};

export default function Page() {
  return <GithubRepoAnalyzerPage />;
}
