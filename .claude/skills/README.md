# Claude Code Skills

Custom skills that automate common development workflows in this project. Each skill is invoked via slash command in Claude Code.

## Available Skills

| Skill | Command | Description |
|-------|---------|-------------|
| `git-start-issue` | `/git-start-issue <Issue number>` | Start implementation workflow from a GitHub Issue — fetch issue, validate labels, create branch, and enter plan mode |
| `git-create-pr` | `/git-create-pr` | Create a GitHub PR from the current branch — analyze changes, check size limits, and generate PR with proper formatting |
| `git-respond-review` | `/git-respond-review <PR number>` | Respond to GitHub PR review comments — analyze, fix code, and reply to each comment |

## Adding a New Skill

1. Create a directory under `.claude/skills/`:

   ```
   .claude/skills/<skill-name>/
   ```

2. Create a `SKILL.md` file in that directory with the following structure:

   ```markdown
   ---
   name: <skill-name>
   description: <One-line description of what the skill does>
   argument-hint: "<argument placeholder>"  # optional, omit if no arguments
   ---

   # <Skill Title>

   <Detailed instructions for Claude Code to follow when this skill is invoked.>
   ```

   - `name` — Identifier used in the slash command (`/<name>`)
   - `description` — Shown in skill listings; keep it concise
   - `argument-hint` — Placeholder text shown to the user (e.g., `"<Issue number>"`)

3. The skill will be automatically available as `/<skill-name>` in Claude Code.
