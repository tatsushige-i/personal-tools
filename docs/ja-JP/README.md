**Language:** [English](../../README.md) | 日本語

# Personal Tools

個人ユーティリティツール集。Next.jsで構築。

> **注記:** このプロジェクトは[Claude Code](https://claude.ai/code)によって作成されました。コーディングはすべてClaude Codeが行い、人間はレビューとフィードバックのみを担当します。

## ツール

`npm run dev` 後、トップページにすべてのツール一覧が表示されます。各ツールのソースは `src/app/tools/` 配下、登録は [`src/app/page.tsx`](../../src/app/page.tsx) の `tools` 配列で管理されています。

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS 4
- shadcn/ui

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.localを編集し、必要な変数を設定する
npm run dev
```

### 環境変数

- `GEMINI_API_KEY` — **Text Rewriter** で必須。https://aistudio.google.com/apikey で取得。
- `GITHUB_TOKEN` — 任意。**GitHub Repo Analyzer** のコントリビューションヒートマップを有効化します。https://github.com/settings/tokens で classic Personal Access Token を `read:user` スコープのみで発行してください。未設定時はヒートマップのみグレーアウトされ、その他の機能はそのまま動作します。

## Claude Code セットアップ

このプロジェクトは [shared-claude-code](https://github.com/tatsushige-i/shared-claude-code) から Claude Code の共有設定を同期して利用しています。

同期対象:
- **Rules** — 共有コーディング規約・ワークフロールール（`.claude/rules/shared/`）
- **Skills** — 共有スラッシュコマンド（`.claude/skills/`）
- **Hooks** — 共有自動化フック（`.claude/settings.json`）

rules・skills・hooks を shared-claude-code から最新の状態に同期するには、以下を実行してください:

```
/config-claude-sync
```

## ドキュメント

- [アーキテクチャ](../../.claude/rules/architecture.md) — ディレクトリ構成、レイヤー分離、ルーティング
- [コーディング規約](../../.claude/rules/conventions.md) — コーディングルール、ワークフロー、PRガイドライン
- [CLAUDE.md](../../CLAUDE.md) — コマンド、プロジェクト概要、開発ガイド
