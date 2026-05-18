---
name: spec
description: "Write, promote, or update a technical specification — system design, component boundaries, data flow, key decisions (including ADRs). The engineering counterpart to `prd`. Use when the user wants a tech spec, design doc, architecture doc, or system design documented before implementation, when a signed-off draft is ready to promote into the repo, when editing an already-promoted spec, or after `engineering:brainstorm --grill` produces architecture that needs formal documentation."
---
# Spec

A technical specification: PRD says **what**, spec says **how** — component boundaries, data flow, key decisions (ADRs).

`$ARGUMENTS` — feature/system description, PRD reference, spec title to promote, or empty (interactive).

**Prerequisites.** Load `engineering:workspace` — it resolves the document store and the promoted-spec directory (`.claude/specs/` by default). If the workspace isn't set up, run `engineering:setup-agent-kit`.

Three phases, picked from current state:

- **Draft** — no spec, or a draft in the doc store.
- **Promote** — the doc-store draft is `approved`/`implementing`, no promoted file yet.
- **Repo-canonical** — the promoted file exists.

## Phase 1 — Draft

1. **Research** — explore the codebase; `engineering:principal` is a good collaborator.
2. **Challenge trade-offs** — if the architecture isn't pressure-tested, invoke `Skill("engineering:brainstorm", "--grill")` and let it run in full. If a brainstorm design is already in context, build from it.
3. **Draft the spec** — decisions over descriptions, document WHY; diagrams for boundaries and data flow; cross-reference the PRD, don't duplicate it. See [SPEC-FORMAT.md](SPEC-FORMAT.md).
4. **Critique** — invoke `engineering:critique` on the draft; resolve load-bearing findings before saving.
5. **Save + cross-link** — delegate to `wiki-librarian`: save with title `"Spec — …"`, then update related PRDs/specs/tasks (an `Implementation tickets` section, bidirectional PRD links). Verify backlinks resolve before reporting done; if a write can't be automated, report it as a setup gap with a concrete fix — don't hand the edits over as a chore. Never call doc-store MCP tools directly.

Drafts stay in the doc store while stakeholders iterate.

## Promote & repo-canonical

Both follow the shared **promotion ceremony** — see `docs/doc-model.md`. Spec's parameters:

| Parameter | Value |
|---|---|
| Promoted file | `NNNN-slug.md` (next sequential number) in the specs directory |
| Frontmatter `id` | `SPEC-NNNN` |
| Promote triggers | status flips to `approved`/`implementing`, or explicit _"promote the spec"_ |
| Commit message | `promote spec NNNN: <title>` |

Spec-specific: in a repo-canonical edit that supersedes a prior decision, add a new ADR entry rather than rewriting the old one.

## Rules

- **ADRs live inside the spec** — not a separate `docs/adr/` folder. Each: _decision / alternatives / why / reversibility_.
- **Promoted files are tool-agnostic** — never reference the doc store; provenance lives in git history.
- **Glossary discipline** — Domain Model terms come from the project glossary; missing terms get added via `engineering:glossary` first.

## Reference

- [SPEC-FORMAT.md](SPEC-FORMAT.md) — what a spec captures, the optional DDD Domain Model section, level of detail.
- `docs/doc-model.md` — where PRDs, glossaries, ADRs, and requirement IDs live; coverage verification.
