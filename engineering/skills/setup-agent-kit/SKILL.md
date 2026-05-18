---
name: setup-agent-kit
description: "Set up a WyStack workspace (per-project or global, tracked via .wystack.json) so Agent Kit lifecycle skills know this project's task tracker, document store, status vocabulary, and domain-doc layout. Run before first use of next-task, new-task, start-task, groom, breakdown, orchestrate, or finish-task in a repo."
---
# Setup Agent Kit

Create or update the WyStack workspace that lifecycle skills read — location, task system, document store, domain-doc layout. Each repo defines its own; no private workspace dependency.

## Files

```text
.wystack.json          tracked, repo root — pointer: { "root": ".wystack" }
<workspace root>/      gitignored
  workspace.md         project identity, conventions, worktree setup
  storage.json         task + doc provider mappings
  verify.json          optional — runtime config; created later by engineering:verify
  tasks/  docs/        filesystem providers only — may instead be Notion, kb, etc.
```

`.wystack.json` is the only tracked file. Don't overwrite existing user content — read it first, summarize, and ask before changing mappings. Full schema: `docs/storage-contract.md`; rationale: `.wystack/decisions/workspace-model.md`.

## Process

### 1. Explore

Before asking: `git remote -v`; root `AGENTS.md` / `CLAUDE.md` / `README.md` / `CONTEXT.md`; `docs/`, `docs/adr/`, `.github/ISSUE_TEMPLATE/`; existing `.wystack/`; signs of a task system (GitHub/GitLab Issues, Linear, Jira, Notion, local markdown).

### 2. Interview

One question at a time, each led by a recommendation.

- **Location** — per-project `.wystack/` (recommended) / global `~/.wystack/<project>/` / custom path.
- **Task system** — local markdown (recommended when no tracker is evident) / GitHub Issues (when the repo has a GitHub remote with issues) / other. For "other", get a paragraph: where items live, how to create and search them, relation support.
- **Status vocabulary** — the status names this project uses (e.g. `Todo / In Progress / In Review / Done`, or GitHub's `open / closed` + labels). Skills map roles like "ready" and "in review" onto these. Default: infer from the task system; confirm.
- **Document store** — local markdown under the workspace `docs/` / repo `docs/` or `.claude/specs/` / Notion / kb / other. Docs need not be files.
- **Requirement-ID format** — how PRD user-story IDs are namespaced so they stay unique across multiple PRDs. Default `<PRD-KEY>-US-<group>.<item>` (e.g. `MEM-US-1.2`); short form `US-1.2` inside its own PRD. Recommend matching the task/doc system's existing ID style.
- **Domain docs** — single `CONTEXT.md` / multi-context `CONTEXT-MAP.md` / none yet (starter section in `workspace.md`).

### 3. Write

- `.wystack.json` at the repo root — `{ "root": <chosen> }`.
- `workspace.md` in the workspace root — sections: Project (name, root, repo), Task System and Document Store (→ `storage.json`), Conventions (requirement-ID format), Domain Docs, Worktree Setup (install/build/baseline commands), Workflow Notes.
- `storage.json` per `docs/storage-contract.md` — valid JSON, provider-neutral, no secrets. Records the status vocabulary alongside the task-provider mapping.
- Filesystem providers — create `tasks/.gitkeep`, `docs/.gitkeep`. Prose-only provider quirks → `adapters/<provider>.md`.

### 4. Report

Workspace location, task and doc providers, files created/updated, lifecycle skills now ready, any manual authentication required.

## Guardrails

- Don't create external provider records during setup.
- Don't assume a tracker the repo or user didn't point to — prefer local markdown when unsure.
- No private page IDs, database IDs, or tokens in tracked files.
