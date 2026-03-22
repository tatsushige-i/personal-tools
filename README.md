**Language:** English | [日本語](docs/ja-JP/README.md)

# Personal Tools

A collection of personal utility tools built with Next.js.

> **Note:** This project was created with [Claude Code](https://claude.ai/code). All coding is done by Claude Code, and humans are responsible only for review and feedback.

## Tools

| Tool | Description | Path |
|------|-------------|------|
| UUID Generator | Generate UUID v4/v7 and ULID with bulk generation and clipboard copy | `/tools/uuid-generator` |
| Text Rewriter | Rewrite text with tone conversion, translation, summarization, and proofreading (powered by Gemini) | `/tools/text-rewriter` |
| JSON Formatter | Format, minify, validate JSON with tree view and path filter | `/tools/json-formatter` |

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

## Docs

- [Architecture](.claude/rules/architecture.md) — Directory structure, layer separation, routing
- [Conventions](.claude/rules/conventions.md) — Coding rules, workflow, PR guidelines
- [CLAUDE.md](CLAUDE.md) — Commands, project overview, development guide
