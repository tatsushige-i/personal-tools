# Skills

Custom slash commands for Claude Code, defined in `.claude/skills/`.

## Shared Skills (symlinks → shared-claude-rules)

- `/config-shared-sync` — Syncs shared rules and skills symlinks from shared-claude-rules
- `/git-branch-cleanup` — Cleans up after a PR merge
- `/git-issue-create` — Creates a GitHub Issue from conversation context
- `/git-issue-start [issue-number]` — Fetches a GitHub Issue and creates a feature branch
- `/git-pr-create [commit-message]` — Commits, pushes, and creates a PR
- `/git-review-respond [pr-number]` — Handles PR review comments end-to-end
