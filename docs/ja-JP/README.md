**Language:** [English](../../README.md) | 日本語

# Personal Tools

個人ユーティリティツール集。Next.jsで構築。

> **注記:** このプロジェクトは[Claude Code](https://claude.ai/code)によって作成されました。コーディングはすべてClaude Codeが行い、人間はレビューとフィードバックのみを担当します。

## ツール

| ツール | 説明 | パス |
|--------|------|------|
| UUID Generator | UUID v4/v7とULIDを生成。一括生成とクリップボードコピーに対応 | `/tools/uuid-generator` |
| Text Rewriter | トーン変換・翻訳・要約・校正によるテキスト書き換え（Gemini搭載） | `/tools/text-rewriter` |
| JSON Formatter | JSONのフォーマット・圧縮・検証。ツリービューとパスフィルター付き | `/tools/json-formatter` |

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
