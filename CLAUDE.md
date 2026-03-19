# CLAUDE.md

このファイルはClaude Code（claude.ai/code）がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

個人ユーティリティツール集。Next.js Webアプリケーションとして構築。

## 技術スタック

- **フレームワーク**: Next.js 16（App Router）+ TypeScript
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: shadcn/ui（new-yorkスタイル、Lucideアイコン）
- **パッケージマネージャー**: npm

## コマンド

- `npm run dev` — 開発サーバー起動（Turbopack）
- `npm run build` — プロダクションビルド
- `npm run lint` — ESLint実行
- `npm run test` — テスト実行
- `npm run test:watch` — テストをwatchモードで実行
- `npx shadcn@latest add <component>` — shadcn/uiコンポーネント追加

## アーキテクチャ

### ディレクトリ構成

```
src/
├── app/                    # Next.js App Router（ルーティングのみ）
│   ├── tools/[tool-name]/  # 各ツールのルート
│   └── api/                # APIルート（将来のDB統合用）
├── features/[tool-name]/   # ツール固有のロジックとUI
│   ├── components/         # ツールのUIコンポーネント
│   └── lib/                # データ取得・ビジネスロジック
├── components/ui/          # shadcn/ui共有コンポーネント
└── lib/                    # 共有ユーティリティ（utils.tsなど）
```

詳細なルールは `.claude/rules/architecture.md` を参照。
