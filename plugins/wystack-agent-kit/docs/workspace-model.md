# Workspace Model — `.wystack/` configuration

**Status:** Accepted (revised 2026-05-27)
**Date:** 2026-05-15
**Context:** Framework-vs-instance work surfaced that `.wystack/` location and structure were framework-dictated and filesystem-assumed. Revised after observing that agents in harness-created worktrees (Cursor, Claude) repeatedly resolved `.wystack` relative to `cwd`, landing on empty worktree-local paths and creating fresh workspaces instead of finding the existing one.

## Problem

- `.wystack/` is gitignored → `git worktree` checkouts can't see it. Agents in worktrees often resolve the workspace root relative to `cwd` rather than the repo root, creating a fresh workspace in the worktree directory instead of finding the existing one.
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
| **Global** (default) | `~/.wystack/<project>` | Outside every repo and worktree — no gitignore needed, no path ambiguity, consistent across all harnesses. |
| **Per-project** (legacy) | `.wystack` | Gitignored workspace in the repo. Self-contained but requires agents to resolve `root` relative to the repo root, not `cwd`. Error-prone in worktrees. |
| **Custom** | any path | Escape hatch. |

For existing per-project setups: migrate by updating `.wystack.json`'s `root` to the global path and moving the directory. `setup-agent-kit` offers this on an update run.

### 3. Structure — configurable paths, fixed concepts

The framework names the **concepts** — task store, doc store, run records, artifacts, decisions. The project configures **where each lives** via `storage.json`. Skills ask the config for a location; they never hardcode `.wystack/docs/`.

### 4. Stores are provider-driven

Task store and doc store are not necessarily filesystem. Providers: `local-markdown`, `notion`, `github`, `kb`, etc. — one adapter each. `storage.json` selects the provider and its config (path for filesystem, database ID for Notion, namespace for `kb`).

Only **operational local data** — config, run records (`calibration/`, `perspective/`, …), `artifacts/` — is always filesystem under the workspace root. The user-facing stores (tasks, docs) can live anywhere a provider reaches.

### 5. Init interviews for it

`wystack-agent-kit:setup-agent-kit` asks: workspace location (per-project / global / custom), store providers, and layout for filesystem providers. It writes `.wystack.json` + `storage.json` and scaffolds the chosen structure.

### 6. Worktree visibility resolution

1. **Primary** — run `git rev-parse --show-toplevel` to get the repo root. Read `.wystack.json` there. Resolve `root` relative to the repo root (for relative paths) or expand `~` (for global paths). Never resolve relative to `cwd`.
2. **Fallback** — if no `.wystack.json`, resolve the main worktree via `git rev-parse --git-common-dir` and look for `.wystack/` beside it.

The `worktree` skill also drops a `.wystack` symlink as ergonomics; the pointer file is the contract. With global mode, the symlink is unnecessary — the absolute path in `.wystack.json` is unambiguous from any directory.

## Guardrails

1. **`.wystack.json` is the only committed workspace file.** Everything else under the workspace root is gitignored local state (or lives outside the repo entirely for global mode).
2. **Framework names concepts, project configures locations.** No hardcoded `.wystack/` subpaths in skills.
3. **Stores are provider-driven.** Never assume a task or doc is a file.
4. **Default is global** (`~/.wystack/<project>`); per-project and custom are supported for backward compatibility.
