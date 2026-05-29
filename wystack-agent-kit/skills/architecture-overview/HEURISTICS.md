# Architecture Overview — Heuristics

How codebase signals become modules, dependency edges, and trace edges. Guidance, not a lookup table — a real project blends signals; judge the whole picture and enrich with agent reasoning where the heuristics are thin.

Run cheap, breadth-first detection first — file census, manifests, top-level structure. Read individual source files only to resolve a module boundary or follow a dependency that the coarse pass left ambiguous.

## Detecting modules and entrypoints

A **module** is a cohesive unit of code with a boundary. Find the top (entrypoint-rooted) tier first; record a nested module only when its boundary is already obvious.

| Signal | How to read it |
|---|---|
| **Workspace members** | `apps/*`, `packages/*`, `services/*` in a monorepo manifest (`pnpm-workspace.yaml`, root `package.json` `workspaces`, Cargo workspace) — each member is a top-tier module candidate. |
| **Manifest entrypoints** | `package.json` `main` / `exports` / `bin`, `pyproject.toml` `[project.scripts]`, `go.mod` + `main` package, `Cargo.toml` `[[bin]]` / `[lib]`. These name a module's entrypoint directly. |
| **Top-level source dirs** | `src/*` subdirectories, framework-convention dirs (`routes/`, `pages/`, `app/`, `cmd/*`) — a cohesive subtree is a module; its index/barrel file is its entrypoint. |
| **Framework units** | A Next.js route group, a NestJS module, a Django app, a Rails engine — the framework's own module unit maps to a map module. |

**Entrypoint is nullable.** A top-tier module normally has one. A nested module, a library with no single entry, or a grab-bag utility directory may have `entrypoint: null` — record the null rather than inventing a file.

## Inferring owned files

A module owns the files reachable from its entrypoint that no sibling module also claims. Practically:

- Start from the entrypoint, walk its directory subtree — files under the module's root directory are its owned files by default.
- A file imported by two modules but living under neither's root is a shared dependency — it belongs to the module whose root contains it, or to a dedicated `shared` / `common` module if one exists. Do not double-own a file.
- Test files (`*.test.*`, `*.spec.*`, `__tests__/`, `tests/`) go in the module's `tests` list, not `ownedFiles`.

The `ownedFiles` set is a reconciliation match signal — keep it precise. An imprecise set weakens the next re-map's ability to match.

## Drawing dependency edges

Follow imports between modules — the edge is the *inter-module* fact, not every file-level import.

| Edge `kind` | Signal |
|---|---|
| `import` | A static `import` / `require` / `use` / `#include` in an owned file resolving into another module's files. |
| `dynamic` | A lazy or dynamic import (`import()`, `React.lazy`, conditional `require`). |
| `runtime` | A dependency the static import graph misses — a dependency-injection registration, a config-driven dispatch, a plugin loaded by name, an event subscription. Found by reading wiring code, not by following imports. |

Record one edge per ordered module pair per kind; set `via` to one representative owned file where the dependency originates. A module that imports nothing from other modules contributes no edges — that is a true graph fact, not a gap.

**Boundary signals.** A module's `boundaries` describes its public surface. If an edge resolves into a file that is *not* the target module's entrypoint or a clearly-public file, that is a boundary-crossing worth noting in the target's `boundaries` text — the map records it descriptively; it does not forbid it (consumers judge conformance, not this skill).

## Drawing trace edges

A trace edge links a module to a PRD feature or a spec. Draw one only when the relationship is clear — do not speculate.

| Target | How to find it |
|---|---|
| `spec` | A spec in the configured doc store (resolve via `wiki-librarian`) whose subject is this module's domain. Use the spec's `id` (`SPEC-NNNN`) as `target.ref`. |
| `prd-feature` | A requirement ID (`conventions.requirementIdFormat`, e.g. `BLOSSOM-US-1.2`) referenced in this module's test JSDoc — per `docs/doc-model.md`, requirements reach the repo through E2E test docs. Grep the module's `tests` for requirement IDs. |

Trace edges are facts — re-derive them every run for every module, the same as owned files and dependency edges. They hang off the persisted module ID, so the *join* survives a confident reconciliation match even though each edge's content is freshly derived; only a `flagged` (unresolved-ambiguity) module keeps its prior trace edges untouched, since there is no confident module to re-derive them for. A consequence: a requirement ID added to or removed from a test is reflected on the next re-map — the map tracks the current code, not a past snapshot. If a module's domain is plain but no spec or requirement ID is found, record no trace edge; absence of a trace edge is itself descriptive (the module is not tied to documented intent).

## Reconciliation matching

On a re-map, match each discovered module against existing records by **multi-signal overlap**, all three signals weighed together:

- **Entrypoint** — same repo-relative entrypoint path is a strong signal.
- **Path** — owned-file paths rooted in the same directory.
- **Owned-file set** — substantial overlap between the discovered and recorded `ownedFiles`.

A **confident match** is entrypoint agreement plus substantial owned-file overlap — the same module, its facts changed. Update in place, keep the ID and trace edges. A discovered module matching no record is `added`; a record matched by nothing is `retired`. Anything in between — one discovered module overlapping two records (a split), two discovered modules overlapping one record (a merge), or a weak partial overlap — is `flagged`, never resolved by guessing. The threshold is judgment, not a number: if you would have to guess which record a discovered module *is*, flag it.
