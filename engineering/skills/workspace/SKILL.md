---
name: workspace
description: "Load repo-local WyStack Agent Kit workspace context, including .wystack storage mappings, project identity, provider capabilities, and local conventions. Use before planning, prioritization, task creation, or documentation workflows."
---
# Workspace Context

Resolve and load the WyStack workspace first. This skill owns workspace resolution — other lifecycle skills load it rather than locating the workspace themselves.

## Load the constitution

Loading the workspace loads the charter. Read `docs/constitution.md` (plugin root) — the WyStack Agent's behavioral constitution: a core principle and three tenets every skill operates under. It stays in effect for the rest of the session; this is the runtime delivery point — no skill restates it.

## Resolve the workspace

1. Read `.wystack.json` at the repo root (tracked — present in every worktree); follow its `root`.
2. If `.wystack.json` is absent, fall back to `git rev-parse --git-common-dir` → the main worktree, and look for `.wystack/` there.
3. If neither resolves, tell the caller to run `engineering:setup-agent-kit`.

All workspace paths below (`storage.json`, `tasks/`, etc.) are relative to the resolved `root` — never assume `./.wystack`.

## Public Contract

Expected workspace contents:

```text
<root>/
  workspace.md
  storage.json
  tasks/  docs/   (filesystem providers only — may be Notion, kb, etc.)
```

Read `engineering/docs/storage-contract.md` for the canonical concepts, location modes, provider capabilities, and local markdown defaults.

## Provider Selection

1. Prefer the resolved workspace's `storage.json`.
2. If missing and the user is only brainstorming, reviewing, or reading code,
   continue without work-item writes.
3. If missing and the user asks for `next-task`, `new-task`, `start-task`,
   `groom`, `breakdown`, `orchestrate`, or `finish-task`, run or recommend
   `engineering:setup-agent-kit`.
4. Do not assume Notion unless `storage.json` or the user
   explicitly selects a Notion adapter.

## What To Return

Return a compact setup summary:

```md
## Workspace
Project: {name}
Task provider: {provider} ({path_or_tool})
Doc provider: {provider} ({path_or_tool})
Domain docs: {single-context | multi-context | none}

Capabilities:
- search work items: {yes/no}
- create work items: {yes/no}
- update status: {yes/no}
- relations: {native/body-links/manual}
```

If setup is missing, return:

```md
Blocked: the workspace's `storage.json` is missing.
Recommendation: run `engineering:setup-agent-kit` and use local markdown unless this repo already has a tracker.
```

## Local Markdown Defaults

If the provider is `local-markdown`, use these conventions:

```text
<root>/tasks/TASK-0001-slug.md
<root>/docs/prd-title.md
```

Work-item frontmatter:

```yaml
---
id: TASK-0001
title: Example task
status: Backlog
type: Feature
priority: Medium
estimate: M
created: 2026-05-13
---
```

Status lifecycle defaults:

```text
Backlog -> Ready -> In Progress -> In Review -> Done
Any -> Later
Any -> Won't Do
```
