---
name: spec
description: "Write, promote, or update a technical specification — system design, component boundaries, data flow, key decisions (including ADRs). The engineering counterpart to `prd`. Use when architecture needs documenting before implementation, when a signed-off draft is ready to promote into the repo, or when editing an already-promoted spec. Triggers on: \"write a spec\", \"tech spec\", \"design doc\", \"architecture doc\", \"system design\", \"promote the spec\", or after `engineering:brainstorm --grill` produces architecture that needs formal documentation."
---

<what-to-do>

Write, promote, and maintain a technical specification. PRD says **what**; spec says **how**. The spec owns architecture (component boundaries, data flow, key decisions including ADRs).

Pick the phase from the spec's current state:

- **Draft** — spec doesn't exist, or exists in the wiki as a draft.
- **Promote** — draft is approved; export to `.claude/specs/NNNN-slug.md`.
- **Repo-canonical** — `.claude/specs/NNNN-slug.md` exists; edit the file directly via PR.

Default selection: if no spec exists → draft. If wiki spec is `approved`/`implementing` and no `.claude/specs/` file → promote. If `.claude/specs/NNNN-slug.md` exists → repo-canonical.

`$ARGUMENTS` — feature/system description, PRD reference, spec title to promote, or empty (interactive).

## Phase 1 — Draft

1. **Research** — explore the codebase. The `engineering:principal` agent is a good collaborator.
2. **Challenge trade-offs** — MUST invoke `Skill("engineering:brainstorm", "--grill")` before proceeding. Do NOT ask ad-hoc inline questions — the brainstorm flow (one-at-a-time interview, parallel research, codex pressure test) must run in full.
3. **Reference the PRD** — the spec implements PRD behaviors. Cross-reference, don't duplicate.
4. **Decisions over descriptions** — focus on the non-obvious. Document WHY, not just WHAT. See [SPEC-FORMAT.md](SPEC-FORMAT.md) for what a spec captures and the right level of detail.
5. **Diagrams over prose** — component boundaries and data flow are almost always clearer as diagrams.
6. **Save draft to wiki** — delegate to the `wiki-librarian` agent. Pass: title (prefixed `"Spec — "`), full content, project name, suggested Tags, related page URLs to cross-reference (especially the PRD). Do NOT call wiki MCP tools directly.
7. **Update related docs** — ask `wiki-librarian` to search and update related PRDs, specs, epics, tasks. When related tasks exist, ensure the spec has an `Implementation tickets` section with their URLs grouped by phase/area/decision. When a related PRD exists, both pages link to each other.
8. **Verify backlinks** — fetch the spec and related pages after updates. Don't report completion until backlinks resolve, or until you've reported an explicit manual follow-up with the exact links/section text.

Drafts stay in the wiki while stakeholders iterate. They do not enter the repo yet.

## Phase 2 — Promote

Invoked explicitly (_"promote the spec"_) or automatically when a draft's status flips to `approved`/`implementing`.

1. **Fetch the draft** — delegate to `wiki-librarian` for the full content.
2. **Determine target filename** — next sequential number in `.claude/specs/` (e.g. `0004-` if `0003-foo.md` is the highest). Slug the title.
3. **Strip tool references** — promoted file contains no wiki URLs, page IDs, or tool names. References to the PRD become name-only. No provenance metadata in frontmatter.
4. **Write the file** — `.claude/specs/NNNN-slug.md` with tool-neutral frontmatter:
   ```yaml
   ---
   id: SPEC-NNNN
   title: <title>
   status: active
   ---
   ```
   Followed by the spec body, including the Decisions (ADR) section.
5. **Mark wiki page promoted** — delegate to `wiki-librarian` to update the wiki page's status to `promoted` and add a note that the canonical version now lives in the repo. One-way; no bidirectional URL.
6. **Commit** — message is the provenance record: `promote spec NNNN: <title>`. Don't put wiki URLs in the body.
7. **Announce completion** — report the new path. Subsequent edits happen via PR.

## Phase 3 — Repo-canonical

1. **Locate the file** — find the matching `.claude/specs/NNNN-slug.md`.
2. **Edit directly** — modify in place using standard editing tools.
3. **Update the Decisions section** — if the change reverses or supersedes a prior decision, add a new ADR entry rather than rewriting the old one.
4. **Do not sync back to the wiki** — the wiki copy is a historical snapshot.
5. **Commit normally** — spec changes travel in the same PR as the code that enacts them when possible.

</what-to-do>

<supporting-info>

## Reference

- [SPEC-FORMAT.md](SPEC-FORMAT.md) — what a spec captures, the optional Domain Model (DDD) section, and the right level of detail with examples.
- `docs/doc-model.md` (engineering plugin root) — broader doc model: where PRDs, glossaries, ADRs, and requirement IDs live, and how coverage is verified.

## Lifecycle

```
1. draft            — spec does not yet exist, or exists in the wiki as a draft
2. promote          — draft is approved; export to .claude/specs/NNNN-slug.md
3. repo-canonical   — spec lives in the repo; edits happen via PR
```

## Rules

- **Complements the PRD** — PRD says what, spec says how. Don't duplicate.
- **Decisions are the core** — if there's no decision to document, there's no spec to write.
- **Architecture, not implementation** — component boundaries and data flow, not TypeScript interfaces.
- **ADRs live inside the spec** — not in a separate `docs/adr/` folder. Each decision: _decision / alternatives / why / reversibility_.
- **Drafts in the wiki, active specs in the repo** — enforced by the lifecycle. Don't mix.
- **Repo is tool-agnostic** — promoted files never reference the wiki. Provenance lives in git history.
- **Feeds into `engineering:breakdown`** — the spec + PRD together define what gets split into tickets.
- **Use `wiki-librarian` for all wiki operations** — never call wiki MCP tools directly. The agent handles schema compliance, title persistence, dedup, and cross-referencing.
- **Glossary discipline** — terms used in the Domain Model section come from the project glossary. If a term is missing, add it via `engineering:glossary` before finalizing.

</supporting-info>
