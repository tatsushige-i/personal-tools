---
name: git-issue-start
description: Start implementation workflow from a GitHub Issue - fetch, validate labels, create branch, and enter plan mode
argument-hint: "<Issue number>"
---

# Implement Issue Skill

GitHub Issueの情報取得・ラベル検証・ブランチ作成・Plan Mode移行までのワークフローを自動化する。

## 処理手順

### Step 1: Issue番号の特定

- `$ARGUMENTS` が数値として指定されていればそのIssue番号を使用する
- 未指定または数値でない場合、ユーザーにIssue番号を尋ねる:
  ```
  対応するIssueの番号を教えてください。
  ```
- ユーザーの回答からも明確な数値を判別できない場合はエラーとして終了する。推測や曖昧な解釈は行わない:
  ```
  エラー: Issue番号を特定できませんでした。数値で指定してください。
  ```

### Step 2: Issue情報取得

1. `gh issue view <Issue番号> --json number,title,body,labels,state` でIssue情報を取得
2. コマンドが失敗した場合（番号に対応するIssueが存在しない場合）:
   - `gh pr view <Issue番号>` でPRとして存在するか確認し、PRの場合は以下を表示して終了:
     ```
     エラー: #XX はPRです。Issueの番号を指定してください。
     ```
   - PRでもない場合は以下を表示して終了:
     ```
     エラー: Issue #XX は存在しません。
     ```
3. `state` が `OPEN` でない場合 → 「このIssueは既にクローズされています」と警告して終了
4. 取得した情報を以下の形式で表示する:
   ```
   ## Issue #XX: <タイトル>

   ラベル: <ラベル一覧>

   <本文>
   ```

### Step 3: ラベル検証

`.claude/rules/conventions.md` の「Issueラベルの必須化」セクションに基づき、以下を検証する:

1. **種類ラベル**: `bug`, `feature`, `enhancement`, `documentation`, `chore` のいずれか1つが付与されているか確認
2. **優先度ラベル**: `priority: high`, `priority: medium`, `priority: low` のいずれか1つが付与されているか確認
3. いずれかが不足している場合:
   - 不足しているラベルの種類をユーザーに伝え、どのラベルを付与するか確認する
   - ユーザーの回答に基づき `gh issue edit <Issue番号> --add-label "<ラベル>"` で付与する
4. 両方揃っている場合はそのまま次のステップに進む

### Step 4: ブランチ作成・チェックアウト

1. `.claude/rules/conventions.md` の「ブランチ命名規則」に基づき、種類ラベルからプレフィックスを決定する:

   | ラベル          | プレフィックス |
   |-----------------|----------------|
   | `bug`           | `bugfix/`      |
   | `feature`       | `feature/`     |
   | `enhancement`   | `enhance/`     |
   | `documentation` | `docs/`        |
   | `chore`         | `chore/`       |

2. Issueタイトルからブランチ名を生成する:
   - 日本語タイトルの場合は英語に変換する
   - kebab-case（ハイフン区切りの小文字英語）にする
   - `<プレフィックス><簡潔な説明>` の形式にする
3. 生成したブランチ名をユーザーに提示し、確認を得る:
   ```
   ブランチ名: <生成したブランチ名>
   このブランチ名で作成してよいですか？
   ```
4. ユーザーの承認後:
   - `main` ブランチに切り替え: `git checkout main`
   - 最新を取得: `git pull`
   - ブランチ作成・チェックアウト: `git checkout -b <ブランチ名>`

### Step 5: スキャフォールド（featureラベル時のみ）

**条件**: Step 3で確認した種類ラベルが `feature` の場合のみ実行する。それ以外の種類ラベルの場合はこのステップをスキップしてStep 6へ進む。

**処理**:

1. Issueタイトルからツール名（kebab-case）を生成する
   - 日本語タイトルの場合は英語に変換する
   - 例: 「JSON Formatter ツールの追加」→ `json-formatter`
2. ユーザーにツール名を提示し確認を得る:
   ```
   ツール名: <生成したツール名>
   このツール名でスキャフォールドを生成してよいですか？
   ```
3. ユーザーの承認後、以下のファイル・ディレクトリを生成する:

   **`src/app/tools/<tool>/page.tsx`**（ルートファイル）:
   ```tsx
   import { <ToolName>Page } from "@/features/<tool>/components/<tool>-page";

   export default function Page() {
     return <<ToolName>Page />;
   }
   ```

   **`src/features/<tool>/components/<tool>-page.tsx`**（メインコンポーネント）:
   ```tsx
   "use client";

   export function <ToolName>Page() {
     return (
       <div>
         <h1 className="text-2xl font-bold tracking-tight"><Tool Display Name></h1>
         <p className="mt-2 text-muted-foreground">
           TODO: ツールの説明
         </p>
       </div>
     );
   }
   ```

   **`src/features/<tool>/lib/types.ts`**（型定義ファイル）:
   ```ts
   // TODO: ツール固有の型定義
   ```

   **`src/app/page.tsx`**（`tools` 配列にエントリ追加）:
   ```ts
   {
     name: "<Tool Display Name>",
     description: "TODO: ツールの説明",
     href: "/tools/<tool>",
     icon: Package,
   },
   ```
   ※ `Package` アイコンは `lucide-react` からのインポートが必要。既にインポートされていない場合は追加する。

4. 生成結果を一覧表示する:
   ```
   スキャフォールドを生成しました:
   - src/app/tools/<tool>/page.tsx
   - src/features/<tool>/components/<tool>-page.tsx
   - src/features/<tool>/lib/types.ts
   - src/app/page.tsx（toolsエントリ追加）
   ```

### Step 6: Plan Mode移行

1. `EnterPlanMode` ツールを呼び出してPlan Modeに移行する
2. 以下のメッセージを表示して実装計画の策定を促す:
   ```
   Plan Modeに移行しました。Issue #XX の実装計画を策定します。

   ## Issue情報
   - タイトル: <タイトル>
   - ラベル: <ラベル一覧>

   <Issue本文>

   上記のIssue内容に基づいて実装計画を策定します。
   ```
