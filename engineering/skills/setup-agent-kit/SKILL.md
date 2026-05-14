---
name: setup-agent-kit
description: "Set up a repo-local .wystack workspace so WyStack Agent Kit lifecycle skills know this project's task tracker, document store, status vocabulary, and domain-doc layout. Run before first use of next, new, start, groom, breakdown, swarm, or finish in a repo."
---

## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.

# Setup Agent Kit

Create or update the repo-local `.wystack/` setup consumed by WyStack Agent Kit
lifecycle skills.

## Goal

The engineering workflows should not depend on any private workspace. Each repo
must define its own task system and document store before lifecycle skills write
or update work records.

## Files

Create or update:

```text
.wystack/
  workspace.md
  storage.json
  tasks/
  docs/
```

Do not overwrite existing user content. If files already exist, read them first,
summarize the current setup, and ask before changing provider mappings.

## Process

### 1. Explore

Inspect the repo before asking:

- `git remote -v` and `.git/config`
- root `AGENTS.md`, `CLAUDE.md`, `README.md`, `CONTEXT.md`, `CONTEXT-MAP.md`
- `docs/`, `docs/adr/`, `.github/ISSUE_TEMPLATE/`
- existing `.wystack/`
- signs of task systems: GitHub Issues, GitLab, Linear, Jira, Notion, local markdown

### 2. Recommend Defaults

Lead with one recommendation. Defaults:

- If the repo has a GitHub remote and issues appear enabled or referenced, recommend GitHub Issues.
- If the repo has GitLab remote, recommend GitLab Issues.
- If there is existing `.wystack/` or `.scratch/` task content, recommend local markdown.
- Otherwise recommend local markdown under `.wystack/tasks`.

### 3. Confirm Task System

Ask one question at a time.

Question A: Which task system should Agent Kit use?

Recommended options:

- Local markdown — no external account, stores work items under `.wystack/tasks`.
- GitHub Issues — use the repo's GitHub Issues and `gh` CLI.
- Other — user describes Linear, Jira, Notion, or another workflow in prose.

If user chooses Other, ask for one paragraph covering:

- where work items live
- how to create one
- how to search/list them
- how statuses are represented
- whether relations/blockers are supported

### 4. Confirm Document Store

Question B: Where should planning docs live?

Recommended options:

- Local markdown — store PRDs/specs/notes under `.wystack/docs`.
- Repo docs — use existing `docs/` or `.claude/specs/`.
- Other — user describes Notion, Linear docs, Google Docs, or another store.

### 5. Confirm Domain Docs

Question C: How should agents learn this project's language?

Recommended options:

- Single context — one `CONTEXT.md` at repo root plus optional `docs/adr/`.
- Multi-context — root `CONTEXT-MAP.md` points to package-specific context docs.
- None yet — create a starter section in `.wystack/workspace.md`.

### 6. Write

Create directories as needed.

Write `.wystack/workspace.md` with:

```md
# WyStack Agent Kit Workspace

## Project

- Name:
- Root:
- Primary repo:

## Task System

See `.wystack/storage.json`.

## Document Store

See `.wystack/storage.json`.

## Domain Docs

## Workflow Notes
```

Write `.wystack/storage.json` using the contract in
`engineering/docs/storage-contract.md`. Keep it valid JSON.

For local markdown task setup, create `.wystack/tasks/.gitkeep` and
`.wystack/docs/.gitkeep`.

For provider setup, create `.wystack/adapters/<provider>.md` if the provider
needs prose instructions that do not fit in JSON.

### 7. Report

Return:

- configured task provider
- configured doc provider
- files created/updated
- lifecycle skills that are now ready
- any manual authentication required

## Guardrails

- Do not create provider-specific external records during setup.
- Do not assume Notion, GitHub, Linear, or Jira unless the repo or user points there.
- Do not put private page IDs, database IDs, or API tokens into public docs.
- Prefer local markdown when unsure.
- Keep `.wystack/storage.json` provider-neutral enough for agents to read without secrets.
