---
name: setup-agent-kit
description: "Set up a WyStack workspace (per-project or global, tracked via .wystack.json) so Agent Kit lifecycle skills know this project's task tracker, document store, extension bindings, status vocabulary, and domain-doc layout. Run before first use of next-task, new-task, start-task, groom, breakdown, orchestrate, or finish-task in a repo."
---

# Setup Agent Kit

Create or update the WyStack workspace that lifecycle skills read — location,
task system, document store, extension bindings, domain-doc layout. Each repo
defines its own; no private workspace dependency.

## Files

```text
.wystack.json                  tracked, repo root — pointer: { "root": "~/.wystack/<project>" }
~/.wystack/<project>/          global workspace, outside every worktree
  workspace.md                 project identity, conventions, worktree setup
  storage.json                 providers, extension bindings, status vocabulary, workflow conventions, quality gates
  verify.json                  optional — runtime config; created later by wystack-agent-kit:verify
  tasks/  docs/                filesystem providers only — may instead be Notion, kb, etc.
```

`.wystack.json` is the only tracked file. Don't overwrite existing user content — read it first, summarize, and ask before changing mappings. Full schema: `docs/storage-contract.md`; extension model: `docs/extension-contract.md`; rationale: `docs/workspace-model.md`.

## Process

### 1. Explore

**Workspace detection.** Run the resolver block in `docs/storage-contract.md` § Location and resolution; it returns `{ root, mode, storageJson, exists }`. `exists: true` → an existing workspace (update run, below). `mode: unconfigured` or `exists: false` → treat as a fresh setup.

Then explore the repo: `git remote -v`; root `AGENTS.md` / `CLAUDE.md` / `README.md` / `CONTEXT.md`; `docs/`, `.github/ISSUE_TEMPLATE/`; signs of a task system (GitHub/GitLab Issues, Linear, Jira, Notion, local markdown).

If `.wystack.json` and `storage.json` already exist, this is an **update run**, not a fresh setup. Read both, summarize what's currently configured (location, task/doc providers, task + doc status vocabularies, enabled optional doc types, worktree preference, VCS host/CLI, requirement-ID format, preflight, extensions), and report it back. Then ask whether the user wants to:

- **Add missing keys** (recommended when the contract has gained fields since the last setup — e.g., a workspace from before `vcs` was a key). Skip every question whose answer is already present; only ask the ones whose key is absent. Preserve every other value verbatim.
- **Revise specific keys** — name which ones; ask only those. Everything else is left untouched.
- **Re-run end-to-end** — full interview, each existing value pre-filled as the recommendation so the user just confirms or overrides.

Default to "add missing keys" unless the user picks another mode — it's the safest re-run and matches the most common reason for invoking setup again (a new contract field appeared).

### 2. Interview

One question at a time, each led by a recommendation. On an update run, skip every question whose `storage.json` key is already populated unless the user named it in step 1.

- **Location** — global `~/.wystack/<project>/` (recommended — outside every worktree, no gitignore noise, no path ambiguity across harnesses) / per-project `.wystack/` (self-contained but requires careful worktree resolution; legacy default) / custom path. For existing per-project setups: offer to migrate by updating `.wystack.json`'s `root` to the global path and moving the directory — this is non-destructive and reversible.
- **Task system** — local markdown (recommended when no tracker is evident) / GitHub Issues (when the repo has a GitHub remote with issues) / other. For "other", get a paragraph: where items live, how to create and search them, relation support.
- **Status vocabulary** — the status names this project uses (e.g. `Todo / In Progress / In Review / Done`, or GitHub's `open / closed` + labels). Skills map roles like "ready" and "in review" onto these. Default: infer from the task system; confirm.
- **Document store** — where PRDs, specs, stories, and the glossary live (canonical; no promote-to-repo step). Local markdown under the workspace `.wystack/docs/` (recommended) / repo `docs/` / Notion / kb / other. Docs need not be files; local layout is `<path>/{prds,specs,stories,glossary}/` (glossary is core — the term spine).
- **Extension bindings** — local `.wystack` only (default) / Knowledgebase graph-store / configured external tools. Recommend the minimum working set: `wystack-local` for records/relations, plus `kb` only when the `kb` CLI and namespace already exist or the user asks for KB. Extensions are capability providers, not workflow branches.
- **Requirement-ID format** — the doc store provides the story's stable reference; the kit never mints it. Default `{story.id}` (use whatever the doc store calls the story — local-markdown allocates `ST-{n}`, a tracker-backed store is `ENG-{n}`). A project may pin an explicit neutral template (e.g. `ST-{n}`) for the local form; tool-neutrality is a provider-selection property, not a kit guarantee.
- **Doc status vocabulary** — the status names docs move through, one shared ladder for every doc type (PRD/spec/story) since they share one store. Roles: `draft`, `proposed`, `accepted`, `implemented`, `superseded`, `archived` — `accepted` = committed but not necessarily built; `implemented` = built and verified; `superseded` records that a newer doc replaced this one. Default the role names themselves; recommend matching the doc store's native states if it has them (e.g. Notion status options).
- **Optional doc types** — beyond the always-on core (PRD/Spec/Story/Glossary), enable **ADR** (dated, append-only records of *contested* decisions — for projects with real architecture debates whose deliberation would bloat the spec) / **none** (recommended default — add later when the need is concrete). Sets `docs.types` (absent or `[]` = core-only, no loss). The core types — including the glossary, which is the always-on term spine — are never listed here.
- **Estimation anchors** — with task history, offer to run `wystack-agent-kit:calibrate` (establish mode) after setup completes — it reconstructs records from closed tickets and seeds `workspace.md` § Estimation Anchors; too heavy to run inside the interview. Without history, leave the section empty — the first accepted estimate at each rung becomes its provisional anchor.
- **Worktree preference** — whether task work runs in an isolated git worktree: `worktree` (always) / `cwd` (never) / `ask` per task (recommended). Worktrees default to `~/worktrees/<project>/<branch>` outside the repo (no file-watcher recursion, no editor tree noise, no gitignore entry). Set `worktree.directory` only to override with a custom path.
- **Preflight checks** — commands that prove the repo is reviewable before code review/finish flows. Default: infer obvious package scripts and record them only after confirmation; if unsure, leave empty rather than inventing commands.
- **VCS host and CLI** — which platform the remote lives on and which CLI drives PRs. Infer the host from `git remote -v`; offer the matching CLI as the recommendation. Defaults: GitHub remote → `host: github`, `cli: gh`; GitLab → `gitlab`, `glab`; Bitbucket or unknown host → `bitbucket`/`none`, `cli: manual` (lifecycle skills print the resolved command and ask the user to run it). Graphite is an opt-in for stacked-PR users on GitHub: `cli: gt`, `stacked: true`; selecting it should drop a stub `adapters/graphite.md` describing the stacked-PR workflow. Skip the question entirely if `git remote -v` returns nothing — write `host: none`, `cli: manual`. The lookup table mapping `cli` to concrete commands lives in `docs/storage-contract.md`, not in skills.
- **Domain docs** — single `CONTEXT.md` / multi-context `CONTEXT-MAP.md` / none yet (starter section in `workspace.md`).

### 3. Write

On an update run, **merge** — read the current files, apply only the deltas, preserve every other value. Don't rewrite from scratch. Diff the resulting `storage.json` against the original and show the user the change set before saving.

- `.wystack.json` at the repo root — `{ "root": <chosen>, "kitVersion": <installed plugin version> }`. For global mode write the expanded absolute path (e.g. `~/.wystack/wystack`). Stamp `kitVersion` from the installed `plugin.json` so a fresh workspace starts current — `upgrade` then has nothing historical to replay against an already-correct setup. On update, leave `root` untouched unless location changed; refresh `kitVersion` only when an upgrade run reconciles migrations.
- `workspace.md` in the workspace root — sections: Project (name, root, repo), Task System and Document Store (→ `storage.json`), Conventions (requirement-ID format), Estimation Anchors (the `estimate` reference set — rung, ticket ref, one-line argument), Domain Docs, Worktree Setup (install/build/baseline commands), Workflow Notes. On update, append/replace only the sections whose underlying answer changed.
- `storage.json` per `docs/storage-contract.md` — valid JSON, provider-neutral, no secrets. Records the provider mappings, extension registry/bindings, action policy, retention policy, the task and doc status vocabularies (`tasks.statuses`, `docs.statuses`), any enabled optional doc types (`docs.types`), project quality gates, the workflow conventions (`requirementIdFormat`, `worktree`), and the `vcs` block (`host`, `cli`, `stacked`, optional `commands`). For filesystem providers, create the core local subdirs under `docs.path` (`prds/`, `specs/`, `stories/`, `glossary/`); add `adrs/` when `docs.types` enables ADR.
- Filesystem providers — create `tasks/.gitkeep`, `docs/.gitkeep` only if absent. Prose-only provider quirks → `adapters/<provider>.md`.

Extension defaults:

- Always seed `wystack-local` as the portable local record/relation fallback.
- If tasks/docs use `kb`, or the user selects Knowledgebase, add `kb` as a
  `graph-store` extension with `observe.records`, `record.read`,
  `record.write`, `record.query`, `relation.read`, `relation.query`, and
  `subscribe.changes` where the local CLI supports them.
- Do not enable `relation.write` for kb until the adapter has an explicit edge
  write command or stable relation frontmatter field.
- Do not enable mutating external actions by default. Add allowed actions only
  after the user accepts the risk policy.

### 4. Report

Workspace location, task and doc providers, files created/updated, lifecycle skills now ready, any manual authentication required. On an update run, lead with the diff — which keys were added, which changed, which were preserved untouched.

## Guardrails

- Don't create external provider records during setup.
- Don't assume a tracker the repo or user didn't point to — prefer local markdown when unsure.
- No private page IDs, database IDs, or tokens in tracked files.
