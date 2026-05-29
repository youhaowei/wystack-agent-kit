---
name: identify-specialists
description: "Analyze a project's codebase and stack, propose the specialist roster beyond the universal pm/principal/qa/devops roles, and generate each specialist's persona brief. Re-running reconciles the discovered roster against the existing one — confident matches keep their entry and hand-tuned brief untouched, ambiguity is flagged not guessed. Use when setting up a new workspace, or later when the user says the project picked up a new domain, the stack shifted, or asks to propose, refresh, or re-sync the specialist roster."
---
# Identify Specialists

Analyze the stack, settle the specialist reviewer roster, generate each specialist's persona brief.

`$ARGUMENTS` — empty (analyze the workspace's project). Invoked standalone or delegated to by `wystack-agent-kit:setup-agent-kit`. `wystack-agent-kit:code-review` also references step 1 for inline ephemeral specialist picks when no workspace is loaded — that path does not persist; this skill remains the curated, persistent path.

**Prerequisites.** Load `wystack-agent-kit:workspace` — it resolves the workspace and the `.wystack/` paths. The workspace must already exist (`storage.json` present); if it does not, the caller runs `wystack-agent-kit:setup-agent-kit` first.

## Workflow

Two modes, picked from current state: **first run** (no `agents.specialists` in `storage.json`) — propose a roster and generate briefs. **Re-run** (`agents.specialists` exists) — reconcile the discovered roster against it, never regenerate from scratch.

### 1. Analyze the codebase

Coarse, own analysis — enough to identify domain reviewers, no deeper. Detect:

- **Languages** — from file extensions across the tree and from lockfile presence.
- **Frameworks / runtimes** — from manifest files: `package.json` (+ its `dependencies`), `pyproject.toml`, `requirements.txt`, `go.mod`, `Cargo.toml`, `Gemfile`, `composer.json`, `pom.xml`, `build.gradle`.
- **Top-level boundaries** — top-level and `apps/*`, `packages/*`, `services/*`, `src/*` directories that mark a domain (`web/`, `api/`, `server/`, `mobile/`, `cli/`).
- **Signal files** — `Dockerfile`, `docker-compose.*`, `migrations/`, `schema.*`, `infra/`, `terraform/`, `.github/workflows/`, `*.proto`.

See [ANALYSIS-HEURISTICS.md](ANALYSIS-HEURISTICS.md) for the detection-to-domain mapping.

> **Optional enrichment.** If an architecture module map exists in the workspace (a separate, possibly-unbuilt capability), read it to sharpen boundary detection. It is an upgrade, never a prerequisite — proceed on coarse analysis alone when absent.

A specialist is a **domain reviewer** — a perspective the universal roster does not already carry. The universal four are fixed: `pm` (product/scope), `principal` (architecture/structure), `qa` (correctness/edges), `devops` (delivery/CI). **Do not identify a role that duplicates one of them** — no generic "code-quality reviewer", no "QA-for-X", no "release manager". A specialist is warranted only when a *stack domain* needs a reviewer who knows that domain's idioms and failure modes (a frontend/UX reviewer, a backend/API reviewer, a data-layer reviewer, a mobile reviewer, an ML reviewer). A small project may correctly need an empty roster.

### 2. Settle the roster

**First run** — there is nothing to reconcile. The discovered domains *are* the proposed roster. Present them as a table — recommend each row, the user confirms, edits, or drops:

| name | domain | why proposed |
|---|---|---|
| `frontend-specialist` | UI components, client state, accessibility | detected `apps/web/` + Next.js in `package.json` |
| `backend-specialist` | API handlers, service layer, data access | detected `apps/api/` + `migrations/` |

**Re-run — reconcile, do not regenerate.** Match each discovered domain against the existing `agents.specialists` entries by **name + domain overlap** — slug equality is the strong signal, domain-phrase agreement is the soft signal (see [ANALYSIS-HEURISTICS.md](ANALYSIS-HEURISTICS.md)). Sort every specialist into one bucket:

- **Confident match** — the discovered domain matches an existing entry on both signals; the specialist still applies. **Keep its entry and its brief file untouched** — the brief may be hand-tuned, never clobber it. The only permitted change: update the `domain` string in `storage.json` if the domain genuinely shifted (an `updated`).
- **No match for a discovered domain** — propose it as `added`: a new specialist, brief to be generated.
- **An existing specialist no longer detected** — propose it as `retired`.
- **Ambiguous** — a domain that splits across two entries, two that merge into one, or any low-confidence partial match is **flagged, never guessed**. Name the candidates and leave the conflicting entries and their briefs untouched for the user to resolve.

Present the reconcile as a single table — `added` / `updated` / `retired` / `flagged`, each row recommended — and stop.

**This is a hard checkpoint.** Stop and wait for explicit approval before touching `storage.json` or any brief. On a first run, an empty roster is a valid outcome — say so rather than inventing specialists. On a re-run, even clean `added`/`updated`/`retired` changes wait for approval: a retire deletes user-facing config, so the user is the only authority to apply it.

### 3. Apply the approved roster to `storage.json`

Once approved, write `agents.specialists` in `.wystack/storage.json` — preserving every other field in the file. Each entry:

```json
{ "name": "frontend-specialist", "domain": "UI components, client state, accessibility", "brief": ".wystack/agents/frontend-specialist.md" }
```

`name` is a stable slug, `domain` is the one-line match string `code-review` filters on, `brief` is the path to the brief file. Per `docs/storage-contract.md`. Apply only what the user approved:

- **First run** — set `agents.specialists` to the approved roster.
- **Re-run** — add approved `added` entries, apply approved `domain`-string `updated`s, remove approved `retired` entries. Confident matches that did not drift are left exactly as they were.

### 4. Generate the persona briefs

Generate a brief only for an **`added`** specialist (first run: every approved entry is an add). For each, write one file into `.wystack/agents/`: `<name>.md` — body = portable principles, frontmatter = identity plus harness-scoped `delegation` preferences. Follow [BRIEF-TEMPLATE.md](BRIEF-TEMPLATE.md) exactly — it mirrors the universal agents in `agents/`. In Codex, the file is injected as a role brief into a built-in transport rather than registered as a custom agent type. The brief carries identity, values, and disciplines only: no method, no MCP tool IDs, no hardcoded `tools:` list, no restated communication contract. Capability comes from the executing harness and provider adapter.

Briefs the reconcile did **not** mark `added` are never written — a confident match keeps its existing brief untouched, including any hand-tuning. A `retired` specialist's brief file is left in place (not deleted) unless the user asks to remove it; its removal from `agents.specialists` is what takes it out of the panel.

Before writing an `added` brief, check `.wystack/agents/` for a stray file at the target path (an orphan from a prior run, not tracked in `agents.specialists`). If one exists, name it and confirm before overwriting.

### 5. Report

Roster decided (names + domains), what changed (`added` / `updated` / `retired` counts on a re-run), every `flagged` case by name, brief files written, and the next step — `code-review` now assembles its panel from the universal roles plus these specialists. If anything was flagged, the report leads with it — the roster is settled only once the user resolves the flags.

## Principles

- **The proposal is a checkpoint, not an FYI** — never write config or generate briefs before the user approves the roster.
- **Specialists are domain reviewers** — distinct from the universal four; a stack domain, not a quality axis.
- **Reconcile, don't regenerate** — a re-run matches the discovered roster against the existing one by name + domain overlap; it never rebuilds from scratch.
- **Hand-tuned briefs are preserved** — on a confident match the entry and its brief file survive untouched; only a genuinely drifted `domain` string updates. A brief is regenerated only for an `added` specialist.
- **Flag ambiguity, never guess** — split / merge / low-confidence matches are flagged and left for the user.
- **Briefs are principles** — portable identity/values/disciplines in the body; harness specifics live in the frontmatter, not the body.

## Reference

- [ANALYSIS-HEURISTICS.md](ANALYSIS-HEURISTICS.md) — stack-signal to specialist mapping, and the reconcile matching signals.
- [BRIEF-TEMPLATE.md](BRIEF-TEMPLATE.md) — the generated `<name>.md` shape.
