# WyStack Agent Kit Plugin

Portable agent-workflow plugin — requirements through shipped code, frontend design, copy, discoverability, and verification. This file orients whoever edits the plugin; it does **not** reach runtime in a consumer project (a plugin's `CLAUDE.md` isn't loaded there). Runtime behavior lives in the skills, agents, `docs/`, and `references/`.

## Layout

- `skills/` — the workflow verbs. Each `SKILL.md` self-describes through its frontmatter `description`; there is no skill index to maintain here.
- `docs/` — shared methodology every skill inherits:
    - `constitution.md` — the behavioral charter: core principle + 3 tenets.
    - `doc-model.md` — where PRDs, specs, terms, and requirement IDs live.
    - `storage-contract.md` — the `.wystack/` workspace contract and provider model.
    - `extension-contract.md` — generic extension capability, record, authority, freshness, action, and retention model.
    - `workspace-model.md` — the design rationale behind the workspace model: the `.wystack.json` pointer, location modes, provider-driven stores.
    - `review-loop.md`, `testing-philosophy.md`, `communication-contract.md` — convergence, test strategy, output discipline (prose shape + format selection).
    - `run-record.md` — the conformance contract for durable operational evidence (calibration, verdicts, run summaries).
- `references/` — design, copy, discoverability, UI primitive, and philosophy references loaded by the relevant skills.
- `agents/` — universal role briefs every project shares: pm, principal, qa, devops, task-manager, wiki-librarian, designer, ux-writer, copywriter, marketing-specialist. Each agent is one `<name>.md`: body = portable principles (identity, values, disciplines), frontmatter = the adapter both the Claude and Codex harnesses read.

## Framework and instance

The plugin is a **portable framework** — skills carry generic, project-agnostic logic, fixed and shippable to any repo. `.wystack/` is the **project instance**: config, artifacts, calibration, tuning, decisions. A skill never hardcodes a project or tool — it resolves the workspace via the tracked `.wystack.json` pointer at the repo root (`wystack-agent-kit:workspace` owns resolution), then invokes configured extensions through generic capabilities. Full model: `docs/storage-contract.md` and `docs/extension-contract.md`.

**Docs vs code.** All docs — PRDs, specs — live in the configured doc store (default `.wystack/docs`); the store is canonical, there is no promote-to-repo step. The repo holds code, tests, and requirement-ID traces. `.wystack/` is the operational layer; committed code is the implementation truth.

## Behavior

Every skill operates under `docs/constitution.md` — the agent does the work, the human supervises. `wystack-agent-kit:workspace` and `wystack-agent-kit:engineering-context` load it at runtime; the methodology docs realize it. Skills inherit it — they do not restate it.

## Skill style

How to write a `SKILL.md` (distilled from the estimate/calibrate/retro surgery, 2026-07):

- **Every line is an action, a definition the actions use, or a trap flag.** No rationale, no design defense, no restated philosophy — if a sentence argues *why*, cut it; the why lives in commits and articles.
- **Trust the model.** Don't re-teach what a capable model knows, don't fence it in ("don't improvise"), don't script procedure it can derive. State the goal and the constraints; frame accumulated knowledge as a floor, not a ceiling.
- **One skill owns one act.** If a step starts re-describing another skill's method, invoke that skill instead and pass it better context.
- **Principles over magic numbers.** "The smallest set that spans the rung", not "1–3 per rung"; "too few records → say so", not "~4". A number survives only as a scale definition (ladder rungs), never as a behavioral threshold.
- **Sections don't overlap.** Workflow = what to do; a knowledge section = hard-won domain facts (traps that cost real runs to learn); Rules = invariants that hold at every step. A rule that restates a step gets cut.
- **Vocabulary obeys the principles.** A step name that contradicts a rule (a "backfill" in a forward-only skill) gets renamed, not explained.
- **Data has homes.** Evidence → workspace records; reference data → `workspace.md`; portable rules → the skill. Never a log-shaped config file; never provenance flags that a record's own fields already imply.
- **Description = the job + when to invoke.** Nothing else reaches the model before the file body, so neither belongs anywhere else.

## Agent definitions — the portable principles model

An agent definition is **principles**: the role's identity, values, and universal disciplines — fully portable, baked into `<name>.md`. It carries no method (the working procedure is derived at runtime from principles plus the project's conventions), no hand-picked tool list, and no restated communication contract (that is inherited from `docs/communication-contract.md`).

Two things are _not_ portable and live in the **`<name>.md` frontmatter**, never in the body:

- **Capability** — a coarse read-only / read-write rail. The posture _is_ the choice of built-in tools listed: read-only is `Read, Glob, Grep, Bash, WebSearch, WebFetch`; read-write adds `Write, Edit`. Never a specific MCP tool ID — those are install-specific and non-portable.
- **Selection** — invocation metadata: `name`, `description`, `model`.

There is no separate per-agent Codex file. An agent is one `<name>.md`; its frontmatter _is_ the adapter — both the Claude and Codex harnesses load agent definitions from `agents/*.md` frontmatter. Porting to a new harness is that harness reading the same frontmatter, never rewriting the principles.
