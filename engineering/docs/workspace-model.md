# Workspace Model — `.wystack/` configuration

**Status:** Accepted
**Date:** 2026-05-15
**Context:** Framework-vs-instance work surfaced that `.wystack/` location and structure were framework-dictated and filesystem-assumed.

## Problem

- `.wystack/` is gitignored → `git worktree` checkouts can't see it, but `orchestrate` teammates run in worktrees and need it.
- The framework dictated the `.wystack/docs/` and `.wystack/tasks/` layout — but layout is user preference.
- Stores aren't necessarily filesystem — a project may keep tasks and docs in Notion, or docs in `kb`.

## Decisions

### 1. `.wystack.json` pointer — the one tracked file

A single committed file at the repo root names where the workspace lives:

```json
{ "root": ".wystack" }
```

It is the *only* tracked piece — a pointer, not state. Because it is committed, **every worktree carries it**, which dissolves the visibility problem: a skill reads `.wystack.json`, follows `root`, done.

### 2. Location — chosen at init

| Mode | `root` | Notes |
|---|---|---|
| **Per-project** (default) | `.wystack` | Gitignored workspace in the repo. Self-contained. |
| **Global** | `~/.wystack/<project>` | Outside the repo — no gitignore/worktree issue at all. |
| **Custom** | any path | Escape hatch. |

### 3. Structure — configurable paths, fixed concepts

The framework names the **concepts** — task store, doc store, calibration, tuning, artifacts, decisions. The project configures **where each lives** via `storage.json`. Skills ask the config for a location; they never hardcode `.wystack/docs/`.

### 4. Stores are provider-driven

Task store and doc store are not necessarily filesystem. Providers: `local-markdown`, `notion`, `github`, `kb`, etc. — one adapter each. `storage.json` selects the provider and its config (path for filesystem, database ID for Notion, namespace for `kb`).

Only **operational local data** — config, `calibration/`, `artifacts/`, `tuning.json` — is always filesystem under the workspace root. The user-facing stores (tasks, docs) can live anywhere a provider reaches.

### 5. Init interviews for it

`engineering:setup-agent-kit` asks: workspace location (per-project / global / custom), store providers, and layout for filesystem providers. It writes `.wystack.json` + `storage.json` and scaffolds the chosen structure.

### 6. Worktree visibility resolution

1. **Primary** — read `.wystack.json` (tracked, present in every worktree); follow `root`.
2. **Fallback** — if no `.wystack.json`, resolve the main worktree via `git rev-parse --git-common-dir` and look for `.wystack/` there.

The `worktree` skill also drops a `.wystack` symlink as ergonomics; the pointer file is the contract.

## Guardrails

1. **`.wystack.json` is the only committed workspace file.** Everything else under the workspace root is gitignored local state.
2. **Framework names concepts, project configures locations.** No hardcoded `.wystack/` subpaths in skills.
3. **Stores are provider-driven.** Never assume a task or doc is a file.
4. **Default is per-project**; global and custom are offered, not forced.
