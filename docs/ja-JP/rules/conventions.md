# プロジェクト固有規約

## テスト規約

### テストファイル配置

テスト対象ファイルに隣接する `__tests__/` ディレクトリに配置する。

```
src/components/__tests__/theme-toggle.test.tsx   ← src/components/theme-toggle.tsx のテスト
src/features/xxx/lib/__tests__/utils.test.ts     ← src/features/xxx/lib/utils.ts のテスト
```

### 命名規則

- テストファイル: `<対象ファイル名>.test.ts(x)`
- TSXコンポーネントのテストは `.test.tsx`、純粋なロジックのテストは `.test.ts`

### テスト方針

- **ユーザー視点（振る舞い）のテスト**を書く。内部実装の詳細をテストしない。
- 要素のクエリには **role** や **accessible name** を使用する（`getByRole`, `getByLabelText` 等）。
- テストIDやクラス名でのクエリは最終手段とする。

### テスト必須対象

- **ロジック層** (`features/xxx/lib/`): ビジネスロジック・データ変換
- **インタラクティブUIコンポーネント**: ユーザー操作を伴うコンポーネント
- **共有コンポーネント** (`src/components/`): 複数箇所で使われるコンポーネント

### テスト任意対象

- **純粋表示コンポーネント**: propsを受け取って表示するだけのコンポーネント

### カバレッジ目標

- カバレッジ目標: **80%**（ロジック層・共有コンポーネント）
- 純粋表示コンポーネントはカバレッジ対象外としてもよい

### テスト実行の必須化

- `npm run test` は `build` / `lint` と並ぶ必須チェックステップとする
- PR提出前にローカルでテストが通ることを確認する
