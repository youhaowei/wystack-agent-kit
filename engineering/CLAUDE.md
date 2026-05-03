# Engineering Plugin

Development lifecycle roles — from requirements through shipped code.

## Doc Model

This plugin separates planning from implementation:

- **Wiki** (Notion) holds PRDs, tasks, initiatives, and draft specs/glossaries — planning and ops layer.
- **Repo** holds promoted specs, glossaries, ADRs (inside specs), code, and tests — implementation truth.
- **Requirements** reach the repo through E2E test JSDoc, never as mirrored PRD files.
- **Committed artifacts are tool-agnostic** — no wiki URLs, page IDs, or tool names.

Full rules, lifecycle, and promotion ceremony: `docs/doc-model.md`. Load before writing or updating any PRD, spec, glossary, or coverage check.

## Agents

Eight roles, each with a clear mandate. In Claude-style harnesses these may map
to named agents directly; in Codex they serve as canonical role briefs for
generic subagents or local role simulation.

## Codex Compatibility

- In Codex, keep these names as the canonical engineering roles.
- When the harness does not expose custom reviewer types directly, treat
  `engineering/agents/*.md` as role briefs for generic subagents.
- When a workflow says "spawn `principal`" or similar, Codex should preserve
  the role name in the prompt and use the nearest supported subagent execution
  type (`default`, `explorer`, or `worker`).

| Agent | One job |
|-------|---------|
| **pm** | Requirements, user stories, prioritization, task management |
| **principal** | Architecture decisions, cross-project alignment, design reviews |
| **stack-engineer** | WyStack core (db/server/client) — integration, adoption, debugging |
| **dx-engineer** | WyStack DX (log, version, agent, CLI, runtime) — tooling, developer experience |
| **ui-engineer** | @wystack/ui (stdui) — design system, primitive usage, token compliance, UI code quality |
| **qa** | Bug triage, testing, verification, coverage |
| **devops** | Git, CI/CD, releases, branch management, deployment |
| **wiki-librarian** | Notion Wiki CRUD — creates/updates PRDs, Specs, and other wiki pages with correct schema and cross-references |

## Skills

Work lifecycle skills migrated from work-plugin. Agents load these as needed.

### PM
- `prd/` — behavior spec from user perspective
- `breakdown/` — PRD + spec to vertical-slice tickets
- `groom/` — codebase-aware task planning and estimation
- `next/` — prioritized task selection from Notion
- `new/` — codebase-informed task creation
- `estimation/` — shared sizing scale for grooming and planning
- `competitor-analysis/` — competitor profiling and comparison pages; informs positioning and PRD non-goals

### Principal
- `spec/` — technical specification with architecture and key decisions (includes optional DDD Domain Model section)
- `glossary/` — ubiquitous language: canonical domain terms, aliases, relationships. Shared by PRD, spec, code, tests.
- `improve-codebase/` — find deepening opportunities (Ousterhout's lens + Fowler's catalog + WyStack constraints). Use when the user wants to improve architecture, find refactoring opportunities, or make a codebase more testable.

### Tech Lead / DevOps
- `start/` — full task lifecycle (Notion to shipped code)
- `groom/` — codebase-aware implementation planning (shared with PM)
- `finish/` — verify, merge/PR, cleanup
- `push-pr/` — commit, push, and open or update a PR
- `git-cleanup/` — local branch cleanup and reconciliation
- `git-worktrees/` — isolated task worktrees with setup and verification
- `swarm/` — parallel ticket execution: teammates in worktrees, review-fix loop, user-gated merges

### Routing
- `orchestrate/` — route a broad request to specialists, fan out multi-stance lenses for decisions, synthesize results. Replaces the former `orchestrator` agent. For parallel ticket execution use `swarm` instead.

### Review
- `code-review/` — static multi-agent code review with ticket-aware context
- `full-review/` — code review + QA + PM pre-merge gate

### Workspace
- `workspace/` — cached Notion schemas, project URLs, and conventions used by engineering workflows

### Wiki Librarian
- Used by the `prd/` and `spec/` workflows for the save-to-Notion step
- Owns Wiki database schema, Notion API quirks, dedup, and cross-referencing
- Other agents should delegate all Notion Wiki operations to wiki-librarian

### QA
The QA agent still draws from general engineering knowledge and tools rather than a plugin-specific skill file.

## The Cycle

```
PM: prd/ -> Principal: spec/ -> PM: breakdown/ -> PM: groom/ -> Tech Lead: start/ -> DevOps: finish/
                                                              └─► Tech Lead: swarm/ (parallel execution with team)
```

Each step references what came before. Tickets ref PRD + spec. Review checks against stories.
