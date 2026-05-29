# Architecture Overview — Schema

The JSON shape of the module-dependency map and its run record. The map is
derived state; this schema is the contract a future consumer reads against.
When `storage.json` binds records/relations to a graph-store extension, the
same shapes are written there through `record.write` / `relation.write`; the
`.wystack/` paths below are the portable local fallback/cache.

## Storage layout

Two directories, both directly under the resolved `.wystack/` root, both
gitignored. They are distinct on purpose: **current state** mutates in place
under reconciliation; **run records** are append-only history. In a graph-store
workspace, the configured record store is the primary sink and these directories
remain the fallback/cache.

```text
.wystack/
  arch-map/                 # current state — reconciled in place
    map.json                # graph metadata + the edge lists
    modules/
      <module-id>.json      # one file per module
  arch-map-runs/            # typed run records — one file per run, immutable
    <run-id>.json
```

**Why per-module files, one shared edge file.** A module is the unit reconciliation updates, retires, or adds — a file per module keeps each change a single-file write and keeps a large map diff-legible. Edges are graph-global (an edge names two modules) and small relative to module facts, so `map.json` holds both edge lists in one place; reconciling edges is a whole-list rewrite, not a per-edge merge.

## Identity

A module ID is **opaque and persisted** — minted once when the module first appears, never derived from path, name, or entrypoint. Format: `mod_` followed by a short random token (e.g. `mod_7f3a9c`). Reconciliation preserves the ID of every confidently-matched module; only a genuinely new module gets a fresh one. Because the ID is not derived, renaming a directory or moving the entrypoint does not change identity — that is what lets trace edges survive a re-map.

Run record IDs follow the same rule: `run_` plus a short random token.

## `arch-map/modules/<module-id>.json`

```json
{
  "id": "mod_7f3a9c",
  "parentId": null,
  "name": "auth",
  "entrypoint": "src/auth/index.ts",
  "ownedFiles": [
    "src/auth/index.ts",
    "src/auth/session.ts",
    "src/auth/tokens.ts"
  ],
  "boundaries": "Public surface is index.ts. Token internals are not imported elsewhere.",
  "tests": [
    "src/auth/__tests__/session.test.ts"
  ]
}
```

| Field | Meaning |
|---|---|
| `id` | Opaque persisted identity. See above. |
| `parentId` | The enclosing module's `id`, or `null` for a top-tier (entrypoint-rooted) module. Hierarchy is expressed here, not by a nesting of files. |
| `name` | Human-readable label — derived, may change between runs. Not identity. |
| `entrypoint` | Repo-relative path to the module's entry file, or `null`. A top-tier module normally has one; a nested or library-style module may not. Nullable by design. |
| `ownedFiles` | Repo-relative paths the module owns. A reconciliation match signal — keep it accurate. |
| `boundaries` | One or two sentences: what the module exposes and what stays internal. A boundary violation is a property of an edge crossing into a non-exposed file. |
| `tests` | Repo-relative paths of the tests covering this module. May be empty; an empty list is a fact (the module is untested), not an omission. |

## Dependency edges and trace edges — in `arch-map/map.json`

```json
{
  "version": 1,
  "generatedAt": "2026-05-18T14:00:00Z",
  "lastRunId": "run_a1b2c3",
  "dependencyEdges": [
    { "from": "mod_7f3a9c", "to": "mod_5e8d21", "via": "src/auth/session.ts", "kind": "import" }
  ],
  "traceEdges": [
    { "module": "mod_7f3a9c", "target": { "kind": "prd-feature", "ref": "BLOSSOM-US-1.2" } },
    { "module": "mod_7f3a9c", "target": { "kind": "spec", "ref": "SPEC-0003" } }
  ]
}
```

**Dependency edges** and **trace edges are different record types** — do not unify them. A dependency edge connects a module to another *module*; a trace edge connects a module to *intent* (a PRD feature or a spec). They have different target kinds. Both are facts — fully re-derived every run; what makes a trace edge feel persistent is that it hangs off the persisted module ID, so a confident reconciliation match preserves the *join* (the module endpoint) even as each edge's content is freshly derived. Only a `flagged` module — one reconciliation could not confidently match — keeps its prior trace edges untouched, awaiting user resolution.

### Dependency edge

| Field | Meaning |
|---|---|
| `from`, `to` | Module IDs. The dependency points `from` → `to`. |
| `via` | The owned file where the dependency originates — locates the edge in the code. |
| `kind` | `import` (static import / require), `dynamic` (lazy/dynamic import), or `runtime` (a dependency the static graph misses — a DI registration, a config-driven dispatch). |

Edges are non-optional. A module with no outbound dependencies contributes no `from` entries — that is a true statement about the graph, distinct from "not yet analyzed". The run record (`flagged`) is where an unanalyzed gap is recorded, never a silently missing edge.

### Trace edge

| Field | Meaning |
|---|---|
| `module` | The module ID this trace hangs off. |
| `target.kind` | `prd-feature` or `spec`. |
| `target.ref` | The intent artifact's own identifier — a requirement ID (`conventions.requirementIdFormat`, e.g. `BLOSSOM-US-1.2`) for `prd-feature`, a spec `id` (`SPEC-NNNN`) for `spec`. A name-only reference; the map never embeds the PRD or spec content. |

Trace edges are many-to-many — one module may relate to several features and specs; one feature may span several modules. The map is the join table.

## `arch-map-runs/<run-id>.json` — the map-run record

A typed JSON record conforming to `docs/run-record.md`: one record per run,
written through the configured `record.write` binding when available, with one
file per run under `.wystack/arch-map-runs/` as fallback/cache. It is
**immutable once written** (each run stands on its own — unlike calibration, it
is not updated in place).

```json
{
  "id": "run_a1b2c3",
  "type": "arch-map-run",
  "ranAt": "2026-05-18T14:00:00Z",
  "mode": "re-map",
  "summary": {
    "moduleCount": 12,
    "topTierCount": 5,
    "dependencyEdgeCount": 23,
    "traceEdgeCount": 8
  },
  "changes": {
    "added": ["mod_9a0b1c"],
    "updated": ["mod_7f3a9c", "mod_5e8d21"],
    "retired": ["mod_3c4d5e"],
    "flagged": [
      {
        "kind": "split",
        "description": "Discovered structure splits mod_5e8d21 into a UI half and a data half.",
        "candidates": ["mod_5e8d21"]
      }
    ]
  },
  "drift": "auth module gained a runtime dependency on the new mod_9a0b1c billing module."
}
```

| Field | Meaning |
|---|---|
| `id` | Opaque run ID — `run_` plus a short random token. |
| `type` | Always `arch-map-run` — the record type, per `run-record.md`. |
| `ranAt` | ISO-8601 timestamp of the run. |
| `mode` | `first-map` or `re-map`. |
| `summary` | Counts after the run — modules, top-tier modules, dependency edges, trace edges. |
| `changes.added` / `updated` / `retired` | Module IDs in each reconciliation outcome. |
| `changes.flagged` | Each ambiguous case: `kind` is `split`, `merge`, or `low-confidence`; `description` says what was ambiguous; `candidates` names the module IDs involved. The map-run record is where ambiguity is durably recorded — the map itself never holds a guessed resolution. |
| `drift` | Free-text note on structural drift the run observed — a new cross-module dependency, a module that grew past its boundary, a feature that lost its owning module. Empty string if none. |

Run records accrue and are never auto-pruned — `retro` and future reviews read the whole history.
