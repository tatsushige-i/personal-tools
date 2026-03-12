---
name: create-pr
description: Create a GitHub PR from the current branch - analyze changes, check size limits, and generate PR with proper formatting
---

# Create PR Skill

現在のブランチからGitHub PRを作成するワークフローを自動化する。対応Issue特定・PR規模チェック・差分分析・PR作成を一連の流れで行う。

## 処理手順

### Step 1: 前提条件の確認

1. `git branch --show-current` で現在のブランチを取得する
   - `main` の場合 → 「エラー: mainブランチ上ではPRを作成できません。作業ブランチに切り替えてください。」と表示して終了
2. `git status --porcelain` で未コミット変更を確認する
   - 変更がある場合 → 未コミット変更の一覧を表示し、続行するかユーザーに確認する。中断を選択した場合は終了
3. `gh pr list --head <ブランチ名> --json number,url,state` で既存PRを確認する
   - `OPEN` 状態のPRが存在する場合 → 「エラー: このブランチには既にオープンなPRがあります: <URL>」と表示して終了
4. `git log main..HEAD --oneline` でコミットの存在を確認する
   - コミットがない場合 → 「エラー: mainブランチからのコミットがありません。」と表示して終了
5. リモートにブランチをプッシュする:
   - `git push -u origin <ブランチ名>` を実行
   - 失敗した場合はエラーを表示して終了

### Step 2: 対応Issue特定

1. `git log main..HEAD --format=%s%n%b` からコミットメッセージを取得し、`#(\d+)` パターンでIssue番号を探す
2. 結果に応じて分岐:
   - **1つ見つかった場合**: `gh issue view <番号> --json number,title,state` で検証。存在しない場合やクローズ済みの場合はユーザーに通知
   - **複数見つかった場合**: 候補を一覧表示し、ユーザーに選択を求める
   - **見つからなかった場合**: ユーザーにIssue番号の入力を求める（スキップも可能）
3. Issue特定時は `gh issue view` で取得したタイトルを表示する

### Step 3: PR規模チェック

1. `git diff --numstat main...HEAD` で変更ファイル数・追加行数・削除行数を計測する
2. `src/components/ui/` 配下のファイル（shadcn/ui自動生成）は行数カウントから除外する
3. `.claude/rules/conventions.md` の上限（10ファイル/300行）と比較する:
   - 超過している場合 → 警告を表示する
   - 新規ファイル・ディレクトリの作成が中心の場合はその旨を注記する（conventions.mdの例外規定）
4. 超過時はユーザーに続行するか確認する。中断を選択した場合は終了

### Step 4: 差分分析

1. `git log main..HEAD --oneline` と `git diff main...HEAD --stat` で変更内容を把握する
2. 必要に応じて `git diff main...HEAD` で詳細な差分を確認する
3. ブランチプレフィックスからPRタイプを推定する:

   | プレフィックス | PRタイトルのプレフィックス |
   |----------------|---------------------------|
   | `bugfix/`      | `fix: `                   |
   | `feature/`     | `feat: `                  |
   | `enhance/`     | `enhance: `               |
   | `docs/`        | `docs: `                  |
   | `chore/`       | `chore: `                 |

### Step 5: PRドラフト作成・ユーザー確認

1. PRタイトルを生成する（70文字以内、Step 4で推定したプレフィックスを使用）
2. PR本文を以下のテンプレートで生成する:

   ```
   ## Summary
   - <変更の要点1>
   - <変更の要点2>

   Closes #XX  ← Issue特定時のみ

   ## Test plan
   - [ ] <テスト項目>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```

3. タイトルと本文をユーザーに提示し、承認を得る:
   ```
   ## PRドラフト

   タイトル: <タイトル>

   <本文>

   この内容でPRを作成してよいですか？
   ```

**ユーザーの承認を得てから次のステップに進むこと。** ユーザーがタイトルや本文の変更を求めた場合はそれに従う。

### Step 6: PR作成

1. `gh pr create --base main --title "..." --body "..."` でPRを作成する
   - bodyはheredocを使用してフォーマットを保持する:
     ```
     gh pr create --base main --title "<タイトル>" --body "$(cat <<'EOF'
     <本文>
     EOF
     )"
     ```
2. 失敗した場合はエラーメッセージを表示して終了する

### Step 7: 結果表示

作成結果を以下の形式で表示する:

```
## PR作成完了

PR #XX: <タイトル>
<PR URL>

- 対応Issue: #XX <Issueタイトル>  ← Issue特定時のみ
- 変更ファイル数: X件
- 変更行数: +XX / -XX
```
