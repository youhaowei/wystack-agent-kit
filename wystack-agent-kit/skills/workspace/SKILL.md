---
name: workspace
description: "Load repo-local WyStack Agent Kit workspace context, including .wystack storage mappings, project identity, provider capabilities, and local conventions. Use before planning, prioritization, task creation, or documentation workflows."
---

# Workspace Context

Resolve and load the WyStack workspace first. This skill owns workspace resolution — other lifecycle skills load it rather than locating the workspace themselves.

## Load the constitution

Loading the workspace loads the charter. Read `docs/constitution.md` (plugin root) — the WyStack Agent's behavioral constitution: a core principle and three tenets every skill operates under. It stays in effect for the rest of the session; this is the runtime delivery point — no skill restates it.

## Resolve the workspace

1. Run `git rev-parse --show-toplevel` to get the repo root. Read `.wystack.json` at that path (tracked — present in every worktree); resolve its `root` **relative to the repo root**, not relative to `cwd`. In a worktree, `cwd` is the worktree directory — resolving `.wystack` relative to `cwd` lands on an empty worktree path, which is the most common cause of agents creating a fresh workspace instead of finding the existing one.
2. If `.wystack.json` is absent, fall back to `git rev-parse --git-common-dir` → the main worktree, and look for `.wystack/` there.
3. If neither resolves, tell the caller to run `wystack-agent-kit:setup-agent-kit`.

All workspace paths below (`storage.json`, `tasks/`, etc.) are relative to the resolved `root` — never assume `./.wystack`.

## Public Contract

Expected workspace contents:

```text
<root>/
  workspace.md
  storage.json
  tasks/  docs/   (filesystem providers only — may be Notion, kb, etc.)
```

Read `docs/storage-contract.md` for the canonical concepts, location modes, provider capabilities, and local markdown defaults.

## Provider Selection

1. Prefer the resolved workspace's `storage.json`.
2. If missing and the user is only brainstorming, reviewing, or reading code,
   continue without work-item writes.
3. If missing and the user asks for `next-task`, `new-task`, `start-task`,
   `groom`, `breakdown`, `orchestrate`, or `finish-task`, run or recommend
   `wystack-agent-kit:setup-agent-kit`.
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
Recommendation: run `wystack-agent-kit:setup-agent-kit` and use local markdown unless this repo already has a tracker.
```

## Local Markdown Defaults

If the provider is `local-markdown`, use these conventions:

```text
<root>/tasks/TASK-0001-slug.md
<root>/docs/prds/0001-slug.md
<root>/docs/specs/0001-slug.md
```

Docs are canonical in the store — there is no promote-to-repo step. The doc path comes from `docs.path` (default `<root>/docs`); see `docs/doc-model.md`.

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

Work-item status lifecycle defaults (`tasks.statuses`):

```text
Backlog -> Ready -> In Progress -> In Review -> Done
Any -> Later
Any -> Won't Do
```

Doc status lifecycle defaults (`docs.statuses`, shared by PRD/spec):

```text
Draft -> Active -> Superseded
Any -> Archived
```

`Superseded` records that a newer doc replaced this one (alongside a `supersedes:` link); the superseded doc's body is never edited. See `docs/doc-model.md`.
