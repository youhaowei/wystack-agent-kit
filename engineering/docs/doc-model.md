# Doc Model

How WyStack Agent Kit treats product and engineering documentation.

## The rule

- **Planning and ops live in the configured work system.** PRD, tasks, initiatives, glossary drafts, cross-product concerns, and stakeholder-facing artifacts may live in local markdown, GitHub/GitLab/Linear/Jira, Notion, or another adapter.
- **Implementation truth lives in the repo.** Spec, glossary, ADR, code, tests. Once an artifact becomes implementation-level, the repo is canonical.
- **Requirements enter the repo through E2E tests**, not through mirrored PRD files. The test is the executable proof of the requirement.
- **The repo is tool-agnostic.** No wiki URLs, page IDs, or tool names in committed artifacts. Provenance lives in git history, not in frontmatter.
- **The workspace declares storage.** Lifecycle skills resolve the workspace via the tracked `.wystack.json` pointer and read its `storage.json` before assuming where tasks or docs live.

## Where things live

| Doc | Canonical home | Notes |
|---|---|---|
| **PRD** | Work doc store (forever) | Planning/commitment artifact. Stakeholder-editable. Captures intent, not implementation. |
| **Spec** | Work doc store → Repo once active | Draft with stakeholders. Promote to repo on status flip. Repo canonical after. |
| **Glossary (single-product)** | Work doc store → Repo once stable | Same lifecycle as spec. Domain terms that match code belong next to code. |
| **Glossary (cross-product)** | Work doc store | Only if terms genuinely span products. Most codebases don't need this. |
| **ADR** | Inside spec (in repo) | Decision records travel with the code that enacts them. Not a separate folder. |
| **Tasks, initiatives** | Work-item store | Ops-layer. Cross-repo, cross-functional, includes non-code work. |
| **Requirement IDs (F-X.Y)** | Authored in PRD, referenced in repo test JSDoc | The only requirement trace in the repo. |

## Promotion ceremony

Spec and glossary share one lifecycle: **draft → promote → repo-canonical**. The `spec` and `glossary` skills run it; each supplies its own parameters — artifact name, promoted-file path, frontmatter `id`, and the approve-status values that trigger promotion.

**Draft** — authored in the configured doc store via the skill, iterated with stakeholders. Stays there while the design or terminology is debated.

**Promote** — once the draft's status flips to approved, the skill:

1. Fetches the full draft via `wiki-librarian`.
2. Writes the promoted file under the configured `docs.promotedRoot` — `<promotedRoot>/specs/NNNN-slug.md` and `<promotedRoot>/glossary.md`, with `.claude` as the default root. Frontmatter is tool-neutral; all tool references are stripped — no doc-store URLs, page IDs, or tool names; cross-references become name-only.
3. Marks the doc-store page `promoted` — one-way.
4. Commits — the message is the provenance record; no doc-store URLs in the body.

Promotion is **once per artifact**, not a continuous sync. Afterward the doc-store copy is a frozen snapshot of the initial design. A read-only mirror can be generated separately if stakeholders want a live view; the repo stays canonical.

**Repo-canonical** — all subsequent edits happen in the repo file via PR, alongside the code that enacts them. Never sync changes back to the doc store.

## Requirements in the repo

No mirrored PRD file. Requirements reach the repo through E2E test documentation:

```ts
/**
 * F-1.2: Draft application save
 *
 * User story: Applicant starts form, leaves, returns later — draft persists.
 * Success: Applicant resumes where they left off.
 *
 * @prd Blossom Application        (reference, not a link)
 */
test("applicant can save draft and resume", async () => {
  // ...
});
```

Why this beats a mirrored PRD:
- **Zero drift**: can't document a requirement without a test demonstrating it.
- **Tight traceability**: `F-1.2` → test → implementation code, no intermediate doc.
- **Executable**: tests can't lie about what shipped. A mirrored PRD can.
- **Tool-agnostic**: repo says nothing about where the `F-1.2` ID originated.

## Repo layout

```
<docs.promotedRoot>/             # .claude by default
  specs/
    0001-feature-name.md         # promoted from the doc store, canonical
    0002-other-feature.md
  glossary.md                    # promoted from the doc store, canonical
```

Frontmatter is tool-neutral:

```yaml
---
id: SPEC-0001
title: Feature Name
status: active
---
```

No `wiki_page_id`, no external URLs, no provenance metadata. If you need to trace where a spec came from, use `git log` on the promote commit.

## Coverage verification

A requirement in the PRD without a matching test is a coverage gap. Checking this is the `qa` agent's job — on-demand, not continuous.

`qa` reads requirement IDs from the configured doc store via `wiki-librarian`, greps the repo for each, and reports:
- Orphan requirements (no test)
- Orphan tests (requirement ID not in PRD)
- Specs missing referenced requirement IDs

Run pre-release, pre-demo, during QA passes. Not every PR.

## Why this shape

1. **Agent-friendly**: agents reading the repo get spec + glossary + tests without doc-store round-trips. Coverage grep works across the whole traceability chain.
2. **Drift-resistant**: implementation artifacts evolve with the code that enacts them. PR reviews catch spec drift naturally.
3. **Tool-portable**: the repo doesn't assume a specific doc or task tool. Swap providers tomorrow — only the workspace config and adapter instructions change, not committed artifacts.
4. **Stakeholder-friendly**: teams keep their preferred collaboration surface for non-engineers.

## DDD awareness

Domain-driven design shows up in this model as two separate artifacts, deliberately:

| DDD concern | Home | Skill |
|---|---|---|
| **Ubiquitous language** — domain terms, canonical names, aliases to avoid, relationships | Glossary (doc store → repo) | `glossary/` |
| **Strategic / tactical DDD** — bounded contexts, aggregates, domain events, context maps, anti-corruption layers | Spec (optional Domain Model section) | `spec/` |
| **PRD** uses the language but doesn't author DDD patterns | Configured doc store (stays) | `prd/` |

The PRD references glossary terms precisely but doesn't introduce DDD modeling concepts — that's the wrong register for stakeholders. The spec owns architectural DDD when applicable; projects that don't do DDD skip the Domain Model section with no loss. The glossary is the shared ubiquitous language both depend on.

Flow: glossary seeds canonical terms → PRD and spec both use them → code and tests use them → coverage check verifies the loop closes.

## Skills that participate

- `setup-agent-kit/` — creates `.wystack/` workspace and storage setup for a repo
- `prd/` — writes PRDs in the configured doc store using glossary terms; seeds new domain terms back into the glossary draft; never mirrors to repo
- `spec/` — owns the spec draft → promote lifecycle; carries optional Domain Model section for DDD-committed projects
- `glossary/` — owns the ubiquitous language lifecycle (draft → promote), mirrors `spec/`'s structure
- `qa` agent — runs coverage verification on demand
- `wiki-librarian` agent — document-store CRUD; plugin skills delegate here
- `breakdown/`, `groom/`, `start-task/` — read promoted specs and glossary from the configured `docs.promotedRoot` when present; fall back to configured doc store via `wiki-librarian` for drafts
