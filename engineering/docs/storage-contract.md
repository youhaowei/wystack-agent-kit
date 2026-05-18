# Storage Contract

WyStack Agent Kit workflows are storage-agnostic. Skills operate on project
concepts; adapters explain how a specific repo stores those concepts.

## Setup Files

Every repo that wants lifecycle workflows should have:

```text
.wystack/
  workspace.md
  storage.json
  tasks/
  docs/
```

`engineering:setup-agent-kit` creates these files. Users may edit them directly.

## Location and resolution

The workspace location is project-configured, not fixed. One tracked file at the repo root — `.wystack.json` — names where it lives:

```json
{ "root": ".wystack" }
```

`.wystack.json` is the **only committed workspace file** — a pointer, not state. Everything under `root` is gitignored local state.

**Location modes** (chosen at init):

| Mode | `root` | Notes |
|---|---|---|
| Per-project (default) | `.wystack` | Gitignored workspace in the repo |
| Global | `~/.wystack/<project>` | Outside the repo — no worktree visibility issue |
| Custom | any path | Escape hatch |

**Resolving the workspace** — a skill, from any directory including a worktree:

1. **Primary** — read `.wystack.json` (tracked, so present in every worktree); follow `root`.
2. **Fallback** — if `.wystack.json` is absent, resolve the main worktree with `git rev-parse --path-format=absolute --git-common-dir` and look for `.wystack/` beside it.

Because `.wystack.json` is committed, every worktree carries it — skill-created or harness-created (`orchestrate` execution agents run in harness worktrees). The `engineering:worktree` skill also drops a `.wystack` symlink as ergonomics; the pointer file is the contract.

## Structure and providers

The framework names the **concepts** — task store, doc store, calibration, tuning, artifacts, decisions. The project configures **where each lives** in `storage.json`. Skills ask the config for a location; they never hardcode `.wystack/docs/` or `.wystack/tasks/`.

Stores are **provider-driven** — the task store and doc store are not necessarily filesystem. Providers: `local-markdown`, `notion`, `github`, `kb`, etc. `storage.json` selects the provider and its config (path for filesystem, database ID for Notion, namespace for `kb`). Only operational local data — config, `calibration/`, `artifacts/`, `tuning.json` — is always filesystem under the workspace root.

## Canonical Concepts

| Concept | Meaning |
|---|---|
| Project | The product/repo/work area the agent is helping with. |
| Work item | A tracked unit of work: task, bug, feature, research item, or epic. |
| Work doc | A planning or decision artifact: PRD, spec, glossary, ADR, or note. |
| Requirement | User-facing behavior or acceptance condition that should be verified. |
| Trace link | A relationship between work items, docs, requirements, code, and PRs. |

Avoid provider names in core workflow instructions. Say "work item", not
"Notion task" or "GitHub issue", unless describing a specific adapter.

## Required Adapter Capabilities

An adapter can be prose-only. It must tell agents what is available and how to
act safely.

```json
{
  "version": 1,
  "project": {
    "name": "Example",
    "root": "."
  },
  "tasks": {
    "provider": "local-markdown",
    "path": ".wystack/tasks",
    "idPrefix": "TASK",
    "statuses": {
      "backlog": "Backlog",
      "ready": "Ready",
      "inProgress": "In Progress",
      "inReview": "In Review",
      "done": "Done",
      "deferred": "Later",
      "cancelled": "Won't Do"
    },
    "capabilities": {
      "search": true,
      "create": true,
      "updateStatus": true,
      "relations": "body-links"
    }
  },
  "docs": {
    "provider": "local-markdown",
    "path": ".wystack/docs",
    "capabilities": {
      "search": true,
      "create": true,
      "update": true,
      "crossLink": true
    }
  }
}
```

## Local Markdown Defaults

Local markdown is the portable floor. It should work without network access,
private APIs, or extra authentication.

Recommended work item frontmatter:

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

Body sections:

```md
## Description

## Acceptance Criteria

## Scope

## Links
```

## Provider Adapters

Provider-specific adapters should live outside the core contract:

```text
.wystack/
  storage.json              # selected provider and mappings
  adapters/
    notion.md               # optional private provider instructions
    github.md               # optional repo-specific issue instructions
```

Adapters own provider quirks: API names, schema IDs, label mappings, relation
limits, auth requirements, and verification steps.

## Runtime Adapters

Claude sub-agent definitions are runtime assets. Codex does not have the same
native sub-agent model, so Codex should consume shared role briefs as prompt
context rather than treating Claude agents as portable primitives.

Shared source should be role language, for example:

```text
roles/work-item-manager.md
roles/doc-librarian.md
roles/principal.md
```

Runtime packaging can derive:

```text
adapters/claude/agents/*.md
adapters/codex/skill-metadata
```

Current repo layout still has historical `engineering/agents/*.md`; treat those
as Claude-compatible role briefs until the folder is split.
