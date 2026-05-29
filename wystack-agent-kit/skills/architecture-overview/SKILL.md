---
name: architecture-overview
description: "Generate and maintain the architecture overview — a derived, descriptive module-dependency map of what the codebase currently IS, the third artifact alongside PRD (what the product should do) and Spec (how it should be structured). A mapper analyzes the codebase into modules, inter-module dependency edges, and trace edges linking modules to PRD features and specs. Re-running reconciles discovered structure against existing records — confident matches keep their persisted IDs and trace edges, ambiguity is flagged not guessed. Use when the user wants an architecture overview, a module map, a dependency graph of the codebase, to see what modules exist, or to refresh the map after the code has changed."
---
# Architecture Overview

Generate and reconcile the module-dependency map — the descriptive record of what the codebase currently IS.

`$ARGUMENTS` — empty: v1 maps the whole workspace project in one pass (per-module drill-down is v2). Invoked standalone, or delegated to when another skill needs the current module map and none exists.

**Prerequisites.** Load `wystack-agent-kit:workspace` — it resolves the workspace and the `.wystack/` root. The workspace must already exist (`storage.json` present); if it does not, the caller runs `wystack-agent-kit:setup-agent-kit` first.

**This is descriptive, never prescriptive.** The map records what the code *is*. It never says what the code *should be* — intent lives in the PRD (what the product should do) and the Spec (how it should be structured). The map links to those artifacts through trace edges; it never embeds or duplicates them.

**Scope — v1.** This skill builds the map: the schema, generation,
reconciliation, and the map-run record. It does **not** wire every consumer.
`improve-codebase`, `code-review`, and `verify` are named as future readers of
the map — building so a consumer *could* read it is in scope;
conformance-checking the map against a spec, and turning map findings into
durable findings, are explicitly separate follow-up tasks. Do not build them
here. It does, however, write its map-run through the configured `record.write`
binding so a graph-store extension such as Knowledgebase can index the run.

## The artifact

A **module-dependency graph** stored as derived state under `.wystack/arch-map/`. See [SCHEMA.md](SCHEMA.md) for the exact JSON shape.

- **Nodes are modules.** "Module" is the kit's existing structural vocabulary — introduce no new term. Each module carries a persisted opaque ID, an entrypoint (nullable), its owned files, its boundaries, and its tests.
- **Edges are inter-module dependencies.** The map is a graph, not a flat inventory: a boundary is a constraint on an edge, dead code is a reachability property of the graph. Edges are non-optional — a module with no recorded dependencies states that explicitly, it does not omit the question.
- **Modules nest.** A module has a `parentId`; top-tier modules (`parentId: null`) are entrypoint-rooted. The generated map materializes the top tier, plus any nested module whose boundary the analysis already makes obvious. On-demand drill-down into deeper tiers is a v2 capability — v1 maps the whole workspace in one pass.
- **Trace edges link modules to intent.** A trace edge connects a module to a PRD feature or a spec it relates to. Many-to-many — the map is the join table between code structure and intent.

The map is **derived state — gitignored**, regenerated like `.wystack/calibration/`.
It is never committed. Identity (the opaque IDs) is persisted across
regenerations; facts (everything else) are derived. The map cannot rot —
regeneration *is* the update. The current map may live in `.wystack/arch-map/`
as the portable local cache while map-run records go through the configured
record store.

## Workflow

Two modes, picked from current state: **first map** (no `.wystack/arch-map/`) or **re-map / reconcile** (it exists).

### 1. Analyze the codebase

Coarse, breadth-first analysis — language and framework heuristics, not a line-by-line read. Detect entrypoints, infer each module's owned files and boundaries, and follow imports to draw the dependency edges. See [HEURISTICS.md](HEURISTICS.md) for the detection rules.

Where heuristics are thin or the structure is ambiguous, enrich with agent reasoning — read a manifest, a router file, an index — enough to place a module confidently. Generation is language/framework heuristics *plus* agent-assisted enrichment, not heuristics alone.

Produce a candidate set: modules (entrypoint, owned files, boundaries, tests), dependency edges between them, and trace edges to any PRD feature or spec the module clearly relates to. Materialize the top (entrypoint-rooted) tier; record a nested module only when its boundary is already obvious from the analysis.

### 2. Reconcile against the existing map

**First map** — there is nothing to reconcile. Mint a fresh opaque ID for every module (see [SCHEMA.md](SCHEMA.md) for the ID rule) and treat the whole candidate set as `added`.

**Re-map** — reconcile, do not regenerate. Match each discovered module against the existing records by **multi-signal overlap** — entrypoint, path, and owned-file set considered together:

- **Confident match** — entrypoint agrees and the owned-file sets substantially overlap. **Keep the record's ID**; re-derive all its facts in place — including its trace edges. The ID is the only thing carried across; everything else is regenerated from the current codebase.
- **No match** — a discovered module that matches no record is `added` with a fresh ID.
- **Unmatched record** — an existing record that no discovered module matches is `retired`.
- **Ambiguous** — a discovered module that splits across two records, two that merge into one, or any low-confidence partial match is **flagged, never guessed**. Record it as `flagged` with the candidates named, and leave the conflicting records — and their trace edges — untouched for the user to resolve.

Identity is persisted and opaque; facts — including trace edges — are derived and re-generated every run. What survives a confident match is the module's ID, and because trace edges hang off that ID the *join* survives even though each edge's content is freshly derived. Reconcile is what makes the map live without rotting.

### 3. Checkpoint before the first write

On a **first map**, present the proposed top-tier module set as a table — modules, entrypoints, edge count — and stop for explicit approval before persisting. A bad initial guess on a hierarchical project is expensive to unwind; the checkpoint is cheap.

On a **re-map**, the checkpoint is the **flagged** set: if reconciliation flagged any split / merge / low-confidence case, surface those and stop — clean `added` / `updated` / `retired` changes apply without a checkpoint, but ambiguity is never persisted without the user.

### 4. Write the map

Write the reconciled graph to the configured record/relation store when it
supports `record.write` and `relation.write`; otherwise write the current map to
`.wystack/arch-map/` per [SCHEMA.md](SCHEMA.md). If a graph-store extension is
configured but lacks `relation.write`, store the module records through
`record.write` and keep dependency/trace edges in the local `.wystack/arch-map/`
cache, noting the fallback. Updated records keep their IDs; added records carry
fresh IDs; retired records are removed from current state (their disappearance
is captured in the run record, step 5).

### 5. Write the map-run record

Every run — first map or re-map — writes one **map-run record**: a typed JSON
record through the configured `record.write` binding, falling back to
`.wystack/arch-map-runs/` only when no record store is configured or the
extension is unavailable. A map-run record is a run-summary, not a
finding/verdict record: the status-and-triage finding model does not apply to
it. It enumerates what was `added`, `updated`, `retired`, and `flagged`, and
notes any drift observed. See [SCHEMA.md](SCHEMA.md) for the record shape. Run
records accrue — never prune them as a side effect; `retro` and future reviews
read the history.

### 6. Report

Report the run: module count by tier, edge count, what changed (`added` /
`updated` / `retired` counts), every `flagged` case by name, and the map-run
record location (configured store plus fallback/cache path when used). If
anything was flagged, the report leads with it — the map is consistent only
once the user resolves the flags.

## Principles

- **Descriptive, never prescriptive.** The map records what is. Intent lives in PRD and Spec; the map links to them, never embeds them.
- **Reconcile, don't regenerate.** A re-map matches against existing records by multi-signal overlap. Identity persists; facts are re-derived.
- **Flag ambiguity, never guess.** Split / merge / low-confidence cases are recorded as flagged and left for the user.
- **The map is a graph.** Edges are non-optional; boundaries are edge constraints; dead code is a reachability property — not a flat inventory.
- **Derived state, never committed.** The map lives under `.wystack/`, regenerated, gitignored.
- **One structural noun — "module".** Reuse the kit's vocabulary; introduce no new structural term.

## Reference

- [SCHEMA.md](SCHEMA.md) — the JSON shape of modules, dependency edges, trace edges, opaque IDs, and the map-run record.
- [HEURISTICS.md](HEURISTICS.md) — entrypoint detection, owned-file inference, boundary signals, and dependency-edge extraction.
