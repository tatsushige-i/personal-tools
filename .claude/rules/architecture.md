# アーキテクチャルール

## レイヤー分離

ルーティング・UI・ロジックを3層に厳密に分離する：

- `app/tools/xxx/page.tsx` — **ルート層**。薄く保つ。`features/` からインポートしてコンポーネントを組み合わせるだけ。ビジネスロジックは置かない。
- `features/xxx/components/` — **UI層**。プレゼンテーション専用のReactコンポーネント。propsでデータを受け取る。直接のデータ取得やAPI呼び出しは行わない。
- `features/xxx/lib/` — **ロジック層**。データ取得・変換・ビジネスロジックはすべてここに置く。データソースを変更する際（DB追加など）に変更されるのはこの層のみ。

## ディレクトリの責務

- `src/components/ui/` — shadcn/ui管理の共有UIコンポーネント。生成ファイルは手動編集しない。`npx shadcn@latest add <component>` で追加する。
- `src/components/`（ui以外） — プロジェクト全体の共有コンポーネント（ナビゲーション、レイアウト部品など）。
- `src/components/__tests__/` — 共有コンポーネントのテスト。
- `src/features/<tool>/` — 各ツール固有のコード。feature間のインポートは禁止。共有する場合は `src/lib/` または `src/components/` に抽出する。
- `src/features/<tool>/lib/__tests__/` — ロジック層のテスト。
- `src/lib/` — 複数featureで使う共有ユーティリティ・ヘルパー。

## ルール

1. **feature間インポート禁止。** `features/a/` から `features/b/` をインポートしない。共有コードは `src/lib/` または `src/components/` に置く。
2. **ルートファイルは薄く。** `app/**/page.tsx` は最小限のコード — インポート、必要に応じたServer Componentsでのデータ取得、コンポーネント合成のみ。
3. **Client Componentsは明示的に。** `"use client"` はブラウザAPIやインタラクティビティが必要な場合のみ。デフォルトはServer Components。
4. **ツールコードの集約。** ツールのコードはすべて `features/<tool-name>/` 配下に置く。関係ないディレクトリに散在させない。
5. **バックエンドロジックはAPIルートで。** サーバーサイドロジック（DB、外部API）が必要な場合は `app/api/` のRoute Handlersを使用する。
6. **shadcn/uiコンポーネントを使う。** 標準的なUI要素（ボタン、カード、ダイアログなど）はshadcn/uiを使用または追加する。自作しない。
7. **`@/` インポートエイリアスを使う。** インポートには常に `@/` プレフィックスを使用する（例: `@/components/ui/button`）。現在のfeatureより上の相対インポートは禁止。

## 新しいツールの追加手順

1. `src/features/<tool-name>/components/` と `src/features/<tool-name>/lib/` を作成
2. `src/app/tools/<tool-name>/page.tsx` を作成し、featureからインポート
3. `src/app/page.tsx` の `tools` 配列にツールのエントリを追加
