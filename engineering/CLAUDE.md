# WyStack Engineering Plugin

Portable engineering-workflow plugin — requirements through shipped code. This file orients whoever edits the plugin; it does **not** reach runtime in a consumer project (a plugin's `CLAUDE.md` isn't loaded there). Runtime behavior lives in the skills and `docs/`.

## Layout

- `skills/` — the workflow verbs. Each `SKILL.md` self-describes through its frontmatter `description`; there is no skill index to maintain here.
- `docs/` — shared methodology every skill inherits:
  - `constitution.md` — the behavioral charter: core principle + 3 tenets.
  - `doc-model.md` — where PRDs, specs, glossaries, ADRs, and requirement IDs live.
  - `storage-contract.md` — the `.wystack/` workspace contract and provider model.
  - `workspace-model.md` — ADR behind the workspace model: the `.wystack.json` pointer, location modes, provider-driven stores.
  - `review-loop.md`, `testing-philosophy.md`, `communication-contract.md` — convergence, test strategy, output shape.
- `agents/` — role briefs: pm, principal, qa, devops, the WyStack-domain engineers, wiki-librarian, task-manager.

## Framework and instance

The plugin is a **portable framework** — skills carry generic, project-agnostic logic, fixed and shippable to any repo. `.wystack/` is the **project instance**: config, artifacts, calibration, tuning, decisions. A skill never hardcodes a project — it resolves the workspace via the tracked `.wystack.json` pointer at the repo root (`engineering:workspace` owns resolution). Full model: `docs/storage-contract.md`.

**The one exception — promotion.** *Promoted* specs, glossaries, and ADRs go to the repo (`docs/`, `.claude/specs/`), not `.wystack/`. `.wystack/` is the operational layer; the repo holds implementation truth.

## Behavior

Every skill operates under `docs/constitution.md` — the agent does the work, the human supervises. `engineering:workspace` and `engineering:engineering-context` load it at runtime; the methodology docs realize it. Skills inherit it — they do not restate it.

## Codex compatibility

`agents/*.md` are the canonical role briefs. In Codex, preserve the role name in the prompt and use the nearest supported subagent type (`default`, `explorer`, `worker`).
