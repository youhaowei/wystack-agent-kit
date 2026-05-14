---
name: workspace
description: "Load repo-local WyStack Agent Kit workspace context, including .wystack storage mappings, project identity, provider capabilities, and local conventions. Use before planning, prioritization, task creation, or documentation workflows."
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


# Workspace Context

Load the repo-local `.wystack/` setup first. If `.wystack/storage.json` does not
exist, tell the caller to run `engineering:setup-agent-kit` before lifecycle
skills that read or write work items.

## Public Contract

Expected setup:

```text
.wystack/
  workspace.md
  storage.json
  tasks/
  docs/
```

Read `engineering/docs/storage-contract.md` for the canonical concepts,
provider capabilities, and local markdown defaults.

## Provider Selection

1. Prefer `.wystack/storage.json` in the target repo.
2. If missing and the user is only brainstorming, reviewing, or reading code,
   continue without work-item writes.
3. If missing and the user asks for `next`, `new`, `start`, `groom`,
   `breakdown`, `swarm`, or `finish`, run or recommend `engineering:setup-agent-kit`.
4. Do not assume Notion unless the repo's `.wystack/storage.json` or user
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
Blocked: `.wystack/storage.json` is missing.
Recommendation: run `engineering:setup-agent-kit` and use local markdown unless this repo already has a tracker.
```

## Local Markdown Defaults

If the provider is `local-markdown`, use these conventions:

```text
.wystack/tasks/TASK-0001-slug.md
.wystack/docs/prd-title.md
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
