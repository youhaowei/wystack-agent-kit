# Doc Model

How the engineering plugin treats product and engineering documentation.

## The rule

- **Planning and ops live in the wiki (Notion).** PRD, tasks, initiatives, glossary drafts, cross-product concerns, stakeholder-facing artifacts.
- **Implementation truth lives in the repo.** Spec, glossary, ADR, code, tests. Once an artifact becomes implementation-level, the repo is canonical.
- **Requirements enter the repo through E2E tests**, not through mirrored PRD files. The test is the executable proof of the requirement.
- **The repo is tool-agnostic.** No wiki URLs, page IDs, or tool names in committed artifacts. Provenance lives in git history, not in frontmatter.

## Where things live

| Doc | Canonical home | Notes |
|---|---|---|
| **PRD** | Wiki (forever) | Planning/commitment artifact. Stakeholder-editable. Captures intent, not implementation. |
| **Spec** | Wiki → Repo once active | Draft in wiki with stakeholders. Promote to repo on status flip. Repo canonical after. |
| **Glossary (single-product)** | Wiki → Repo once stable | Same lifecycle as spec. Domain terms that match code belong next to code. |
| **Glossary (cross-product)** | Wiki | Only if terms genuinely span products. Most codebases don't need this. |
| **ADR** | Inside spec (in repo) | Decision records travel with the code that enacts them. Not a separate folder. |
| **Tasks, initiatives** | Wiki | Ops-layer. Cross-repo, cross-functional, includes non-code work. |
| **Requirement IDs (F-X.Y)** | Authored in wiki PRD, referenced in repo test JSDoc | The only requirement trace in the repo. |

## Spec lifecycle

```
1. Draft      — write in wiki via the `spec` skill. Iterate with stakeholders.
2. Approve    — status flips to "active / implementing".
3. Promote    — the `spec` skill exports content to .claude/specs/NNNN-slug.md,
                strips tool references, marks the wiki page as archived/promoted.
4. Repo-canonical — all subsequent edits happen via PR alongside code.
5. Optional mirror — a read-only wiki view can be generated for stakeholders
                     who prefer browsing there. Repo stays canonical.
```

The promote step is **once per spec**, not a continuous sync. After promotion, the wiki copy is a historical snapshot of the initial design — not a live view.

## Glossary lifecycle

Same shape as spec. Draft in wiki for collaborative term debate; promote to `.claude/glossary.md` once stable. Subsequent term additions happen via PR alongside the code that introduces them.

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
.claude/
  specs/
    0001-feature-name.md        # promoted from wiki, canonical
    0002-other-feature.md
  glossary.md                    # promoted from wiki, canonical
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

A requirement in the wiki PRD without a matching test is a coverage gap. Checking this is the `qa` agent's job — on-demand, not continuous.

`qa` reads requirement IDs from the wiki PRD via `wiki-librarian`, greps the repo for each, and reports:
- Orphan requirements (no test)
- Orphan tests (requirement ID not in PRD)
- Specs missing referenced requirement IDs

Run pre-release, pre-demo, during QA passes. Not every PR.

## Why this shape

1. **Agent-friendly**: agents reading the repo get spec + glossary + tests without wiki round-trips. Coverage grep works across the whole traceability chain.
2. **Drift-resistant**: implementation artifacts evolve with the code that enacts them. PR reviews catch spec drift naturally.
3. **Tool-portable**: the repo doesn't assume a specific wiki tool. Swap the wiki tomorrow — only the skills change, not the committed artifacts.
4. **Stakeholder-friendly**: the wiki keeps its role as the collaboration surface for non-engineers.

## DDD awareness

Domain-driven design shows up in this model as two separate artifacts, deliberately:

| DDD concern | Home | Skill |
|---|---|---|
| **Ubiquitous language** — domain terms, canonical names, aliases to avoid, relationships | Glossary (wiki → repo) | `glossary/` |
| **Strategic / tactical DDD** — bounded contexts, aggregates, domain events, context maps, anti-corruption layers | Spec (optional Domain Model section) | `spec/` |
| **PRD** uses the language but doesn't author DDD patterns | Wiki (stays) | `prd/` |

The PRD references glossary terms precisely but doesn't introduce DDD modeling concepts — that's the wrong register for stakeholders. The spec owns architectural DDD when applicable; projects that don't do DDD skip the Domain Model section with no loss. The glossary is the shared ubiquitous language both depend on.

Flow: glossary seeds canonical terms → PRD and spec both use them → code and tests use them → coverage check verifies the loop closes.

## Skills that participate

- `prd/` — writes wiki PRDs using glossary terms; seeds new domain terms back into the glossary draft; never mirrors to repo
- `spec/` — owns the spec draft → promote lifecycle; carries optional Domain Model section for DDD-committed projects
- `glossary/` — owns the ubiquitous language lifecycle (draft → promote), mirrors `spec/`'s structure
- `qa` agent — runs coverage verification on demand
- `wiki-librarian` agent — all wiki CRUD; plugin skills delegate here
- `breakdown/`, `groom/`, `start/` — read promoted specs from `.claude/specs/` and glossary from `.claude/glossary.md` when present; fall back to wiki via `wiki-librarian` for drafts
