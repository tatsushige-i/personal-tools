**Language:** English | [日本語](docs/ja-JP/README.md)

# Personal Tools

A collection of personal utility tools built with Next.js.

> **Note:** This project was created with [Claude Code](https://claude.ai/code). All coding is done by Claude Code, and humans are responsible only for review and feedback.

## Tools

A list of all available tools is shown on the top page after running `npm run dev`. The source for each tool lives under `src/app/tools/`, and the registry is the `tools` array in [`src/app/page.tsx`](src/app/page.tsx).

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS 4
- shadcn/ui

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and configure the required variables
npm run dev
```

### Environment Variables

- `GEMINI_API_KEY` — required for **Text Rewriter** and **JSON Formatter** (AI conversion). Get one at https://aistudio.google.com/apikey.
- `GITHUB_TOKEN` — optional, enables the contribution heatmap in **GitHub Repo Analyzer**. Create a classic Personal Access Token with the `read:user` scope at https://github.com/settings/tokens. If unset, the heatmap is shown as disabled and other features still work.

## Claude Code Setup

This project syncs shared Claude Code configuration from [shared-claude-code](https://github.com/tatsushige-i/shared-claude-code).

Synced items:
- **Rules** — shared coding/workflow rules (`.claude/rules/shared/`)
- **Skills** — shared slash commands (`.claude/skills/`)
- **Hooks** — shared automation hooks (`.claude/settings.json`)

To sync the latest rules, skills, and hooks from shared-claude-code, run:

```
/config-claude-sync
```

## Docs

- [Architecture](.claude/rules/architecture.md) — Directory structure, layer separation, routing
- [Conventions](.claude/rules/conventions.md) — Coding rules, workflow, PR guidelines
- [CLAUDE.md](CLAUDE.md) — Commands, project overview, development guide
