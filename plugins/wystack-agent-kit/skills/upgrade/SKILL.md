---
name: upgrade
description: "Reconcile a project's workspace to the installed kit version by replaying declared migration steps. Use when the kit was updated and a project needs its config, skills, and stored docs migrated to the new version — e.g. after a status-vocabulary change or a doc-model change. Guided, per-step, human-in-the-loop for any write to a store the kit doesn't own."
---
# Upgrade

Reconcile this project to the installed kit version. "Upgrade" is not a download — the host owns that (Claude Code marketplace, Codex/Cursor caches, `grok plugin update`, Pi install). This skill replays the **migration steps** the project is behind on, against its workspace and stores.

`$ARGUMENTS` — empty (reconcile to the installed version), or a target version.

**Prerequisite.** Load `wystack-agent-kit:workspace` for the configured stores and the workspace root. Read `.wystack.json` (`kitVersion`) and the migration ledger.

## Guided, not a script

This is a **guided** flow, not an execution script. The split is by **ownership and reversibility** — the same line the rest of the kit draws:

- **`auto` steps** — changes to what the kit owns (config files, shipped skills, vocabulary definitions). Apply them and report a summary. They're local and reversible.
- **`guided` steps** — outward writes to stores the kit *doesn't* own (the doc store, the work-item tracker — Notion pages, Linear issues, user docs). Walk each one: explain what it changes and why, show the affected scope (e.g. "14 docs at `Active`"), apply it through the provider adapter, confirm it landed, then advance. The human can **skip, defer, or stop** between steps.

Never make an unsupervised outward write. `guided` steps respect the workspace `actionPolicy` (`external_mutation`).

## The migration manifest drives everything

Don't infer what changed — read it. The manifest is a framework asset at `migrations/MIGRATIONS.json` in the plugin root, versioned with the plugin. Each kit release that touches a contract ships declarative migration steps there (`docs/storage-contract.md` § Migrations; the marketplace `publish` skill enforces this). A step declares `id`, `version`, `description`, `type`, `target`, `applyMode` (`auto` | `guided`), and an optional `skipIfPresent` no-op guard. The release author — who knows whether a step writes a live store — declares the mode; this skill is a pure executor. No prose-parsing, no risk-guessing.

## The ledger is the truth

`<workspace>/migrations.json` records applied step IDs and outcomes (applied / skipped / deferred). The skill never trusts a version scalar to know what's applied — partial application is normal (the user may apply 3 of 5 steps and stop).

- **Outstanding** = declared steps − ledger.
- **Skipped / deferred** steps stay outstanding and are re-offered next upgrade.
- **Cold start** (no ledger, e.g. a project provisioned before migrations existed): treat as nothing applied and replay from the manifest baseline. Steps are idempotent / `skipIfPresent`, so already-satisfied changes no-op rather than double-apply.

`.wystack.json` carries a coarse `kitVersion` for display; advance it as releases fully apply, but the ledger — not the scalar — decides what runs.

## Workflow

1. **Detect the gap.** Compare the installed kit `version` (`plugin.json`) against the project's `kitVersion`. If the installed kit is *behind* the latest available, **guide the user to update through their host** (the kit never downloads) — then continue with whatever is installed.
2. **Assemble outstanding steps.** Read the manifest for every version in the gap; subtract the ledger. Order by version, then declared order.
3. **Apply `auto` steps.** Mechanical/local/structural changes — apply through adapters, summarize what changed. Record each in the ledger.
4. **Walk `guided` steps.** For each: explain, show scope, apply through the provider adapter on confirmation, verify it landed, record the outcome (applied / skipped / deferred). Honor skip/defer/stop.
5. **Finalize.** Update `kitVersion` to the highest version whose steps are all applied. Report what was applied, skipped, and deferred, and what an idempotent re-run would pick up.

## Rules

- Store writes go through the adapters (`wystack-agent-kit:wiki-librarian` / `wystack-agent-kit:task-manager`) — never call provider APIs directly.
