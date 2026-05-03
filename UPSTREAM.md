# Upstream Sources

This repo's plugins are derived from external open-source projects. This file tracks what we forked, when we last checked for upstream changes, and what to look for on the next check.

**Cadence:** review every 4–6 weeks, or when something breaks.

**Process for a check-in:**

1. Diff each upstream against the version pinned in `<plugin>/UPSTREAM-BASELINE.json`.
2. For each meaningful change: decide port / skip / file follow-up ticket.
3. Bump the **Last checked** date and **`pin.sha`** in the baseline if we sync.
4. Note significant divergences in the **Local divergence** section so future checks understand what we deliberately don't sync.

Each plugin owns a machine-readable `UPSTREAM-BASELINE.json` capturing its current pin, imports, renames, drops, and local additions. A future sync agent can use it to do three-way diffs (local vs pinned vs current upstream).

---

## Engineering plugin

| Field | Value |
|---|---|
| Source | https://github.com/obra/superpowers |
| Author | Jesse Vincent ([@obra](https://github.com/obra)) |
| License | MIT |
| Current pinned | v5.0.7 (cached at `~/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/`) |
| Upstream HEAD | `e7a2d16` (2026-04-28) |
| Last checked | 2026-05-02 |
| Baseline | [`engineering/UPSTREAM-BASELINE.json`](engineering/UPSTREAM-BASELINE.json) |

**What we took:** the high-level lifecycle shape (brainstorm → spec → plan → TDD → review → finish), the subagent dispatch pattern, git-worktree isolation, multi-agent code review, and TDD discipline.

**Local divergence (intentional):**

- Heavy WyStack/Notion integration (PRD/Spec/Tasks live in Notion Wiki).
- Custom doc model (`engineering/docs/doc-model.md`) — promoted specs in repo, drafts in wiki.
- Two-label severity model (MUST / SUGGEST) with a "near-term-trigger" test for ticket creation. See `engineering/skills/code-review/SEVERITY.md`.
- Notion-aware skills (`groom`, `swarm`, `start`, `finish`, `next`, `new`, `project`, `workspace`) with no upstream equivalent.
- `improve-codebase` skill (Ousterhout vocabulary + Fowler catalog + WyStack constraints) — added 2026-05-01.
- `competitor-analysis` skill — owned by `pm`, derived from coreyhaines31/marketingskills `competitor-profiling` + `competitor-alternatives`. Added 2026-05-02.
- Codex compatibility annotations in skill bodies — superpowers is Claude-Code only.

**Upstream check focus:**

- New skills under `skills/` — check if any belong in our pipeline.
- Changes to `subagent-driven-development`, `requesting-code-review`, `dispatching-parallel-agents` — directly map to our `swarm`, `code-review`, `swarm` respectively.
- Hook patterns under `hooks/` — we don't ship any yet.

**Note for upstream contributions:** Superpowers explicitly rejects "compliance restructures" of skills (per their CLAUDE.md). Don't open PRs that restructure their skills to match our `<what-to-do>`/`<supporting-info>` pattern.

---

## Design plugin (now includes harvested marketing concerns)

| Field | Value |
|---|---|
| Source | https://github.com/pbakaus/impeccable (original inspiration) + harvested copy/discoverability concerns |
| Author | Paul Bakaus ([@pbakaus](https://github.com/pbakaus)) for the design substrate; Corey Haines ([@coreyhaines31](https://github.com/coreyhaines31)) for the copy/marketing-psychology substrate |
| License | check repo (impeccable) + check repo (marketingskills) |
| Current pinned | impeccable v1.3.0 (cached at `~/.claude/plugins/cache/impeccable/impeccable/1.3.0/`) |
| Upstream HEAD | impeccable: `skill-v3.0.6` + `ext-v1.0.3` (2026-04-29/30) — restructured, not syncable |
| Last checked | 2026-05-02 |
| Baseline | [`design/UPSTREAM-BASELINE.json`](design/UPSTREAM-BASELINE.json) |

**Status:** This plugin is **no longer a maintained fork** — it's a derivative work inspired by impeccable v1.3.0 + harvested marketing concerns. Upstream impeccable has restructured to a different generation (skill v3 + browser extension + multi-harness installers). Future "syncs" port concepts selectively, not files.

**What we took (impeccable substrate):** anti-pattern catalog (the AI slop test, named patterns: cardocalypse, purple gradient, glow mode, etc.), brand-vs-product register concept, codebase-aware polish, bold aesthetic direction principle. See `design/references/philosophies/impeccable.md`.

**What we took (marketing harvest, 2026-05-02):**

- `copywriting` — full skill, absorbing copy-editing's seven-sweep methodology
- `references/marketing-psychology.md` — 70+ mental models, ported verbatim
- New `discoverability` skill — bundles SEO + AEO/GEO + structured data + IA + directories + agent discovery
- New `ux-writing` skill — in-product copy patterns adapted from impeccable's frontend-design `reference/ux-writing.md`

**Local divergence (intentional):**

- Renamed: `frontend-design` → `frontend`, `critique` → `design-review`, `teach-impeccable` → `establish` (rewritten), `setup` → `establish` (renamed Apr 2026, then rewritten May 2026 to be DESIGN.md-only).
- Kept: `polish`. (Original `distill` and `iterate` dropped 2026-05-02 — single-use in 90 days.)
- Dropped from impeccable: `colorize`, `bolder`, `quieter`, `extract`, `adapt`, `optimize`, `animate`, `harden`, `audit`, `normalize`, `delight`, `clarify`, `onboard`. The 23-command surface is too narrow for our usage data.
- Dropped from marketingskills: `paid-ads`, `referral-program`, `email-sequence`, `launch-strategy`, `pricing-strategy`, `free-tool-strategy`, `marketing-ideas`, `content-strategy`, `social-content`, `programmatic-seo`, `product-marketing-context`, `analytics-tracking`, `ab-test-setup`, all narrow CRO variants (`signup-flow-cro`, `form-cro`, `popup-cro`, `paywall-upgrade-cro`, `onboarding-cro`, `page-cro`). Not adopted from upstream: `cold-email`, `churn-prevention`, `lead-magnets`, `customer-research`, `ad-creative`, `aso-audit`, `community-marketing`, `revops`, `sales-enablement`, `image`, `video`. Most are general-knowledge enough that Claude handles them without a dedicated SKILL.md.
- Moved to engineering: `competitor-analysis` (consolidates upstream `competitor-profiling` + `competitor-alternatives`) — owned by `pm`, not designer.
- `establish` is scoped to DESIGN.md only; PRODUCT.md belongs to engineering's PM workflow (`prd`, `project`, `glossary`).
- Added `references/philosophies/{impeccable,anthropic-frontend,wystack}.md` for absorbed design philosophies; references grow as we adopt more.
- Stripped impeccable's command frontmatter pattern (`user-invokable: true`, `args:` blocks) — we treat them as plain skills.

**Upstream check focus:**

- Concepts worth porting from impeccable's current product (variant planning, mock-fidelity contracts, contrast detector) — port as references, not skills.
- New named anti-patterns from impeccable's slop catalog → add to `references/anti-patterns.md`.
- Marketing skills coreyhaines releases that match our actual workflow (rare — 90 days of data showed near-zero usage of the marketing plugin).
- Anthropic frontend-design upstream — dormant since late 2025; check quarterly.

---

## Marketing plugin — harvested into design (2026-05-02)

The marketing plugin was **deleted** on 2026-05-02. Reasons:

- 90 days of usage data showed 1 marketing-agent dispatch and ~3 skill loads — the plugin was effectively unused.
- The user's actual workflow is "I'm designing a site" — copy + SEO + IA are part of design execution, not separate marketing work.
- Cohesion follows the verb. Splitting into a marketing plugin reflected agency org structure, not the user's reality.

**What was harvested into design:**

- `copywriting` (merged with `copy-editing`'s seven-sweep methodology)
- `marketing-psychology` (full content as `design/references/marketing-psychology.md`)
- The competitor work moved to engineering as `competitor-analysis` under `pm`.
- New `discoverability` skill consolidates the SEO concerns (`seo-audit`, `schema-markup`, `ai-seo`, `site-architecture`, `directory-submissions`).

**What was dropped permanently:** All standalone marketing skills (paid-ads, referral-program, email-sequence, launch-strategy, pricing-strategy, free-tool-strategy, marketing-ideas, content-strategy, social-content, programmatic-seo, product-marketing-context, analytics-tracking, ab-test-setup, all narrow CRO variants).

**Original upstream:** `coreyhaines31/marketingskills`. Pin at deletion: commit `59596ef70467` (cached at `~/.claude/plugins/cache/marketingskills/marketing-skills/59596ef70467/`). Not tracked here going forward.

---

## Quick check command

When ready for a sweep:

```bash
# Engineering
gh api repos/obra/superpowers/releases/latest --jq '.tag_name + " — " + .published_at'
gh api repos/obra/superpowers/commits/main --jq '.sha + "  " + .commit.author.date'

# Design (impeccable inspiration)
gh api repos/pbakaus/impeccable/releases --jq '.[0:3] | .[] | .tag_name + "  " + .published_at'
gh api 'repos/pbakaus/impeccable/commits?per_page=10' --jq '.[] | "\(.sha[0:7])  \(.commit.author.date | split("T")[0])  \(.commit.message | split("\n")[0])"'

# Three-way diff workflow (any plugin):
# 1. Read <plugin>/UPSTREAM-BASELINE.json for pin.sha + imports map.
# 2. For each entry in `imports`: diff `local file` vs `gh api .../contents/<upstream-path>?ref=<pin.sha>` vs HEAD.
# 3. Honor `dropped` (don't re-suggest), `added_local` (don't try to find upstream).
# 4. After sync: bump pin.sha + checked_at in baseline.
```
