---
name: competitor-analysis
description: >-
  Research, profile, and compare competitors. Use when the user mentions
  "competitor research," "competitor analysis," "competitive intelligence,"
  "competitor profile," "competitor landscape," "who are my competitors,"
  "vs page," "alternative page," "comparison page," "[Product] vs [Product],"
  "[Product] alternative," or shares competitor URLs. Output is structured
  profile docs and optional comparison/alternative pages. PM-owned: research
  feeds positioning and PRD work, not design execution.
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


# Competitor Analysis

Two related jobs:

1. **Profile competitors** — research and produce comparable, fact-based dossiers.
2. **Build comparison pages** — turn profiles into vs / alternative pages (when asked).

## What to do

<what-to-do>

1. **Confirm scope** — get competitor URLs, ask quick-scan vs deep-profile, ask if comparison pages are wanted downstream.
2. **Read existing context** — check `competitor-profiles/` for prior profiles before re-researching. Read project PRD/glossary for "your product" framing.
3. **Profile each competitor** following [PROFILE-TEMPLATE.md](PROFILE-TEMPLATE.md):
   - Save raw data under `competitor-profiles/raw/<slug>/<YYYY-MM-DD>/{scrapes,seo,reviews}/`
   - Synthesize one `competitor-profiles/<slug>.md` per competitor
   - Cite sources for every claim
4. **If multiple competitors** — write `competitor-profiles/_summary.md` with comparison table + positioning map + key takeaways.
5. **If comparison pages requested** — see [COMPARISON-PAGES.md](COMPARISON-PAGES.md) for the four formats (alternative, alternatives, you vs, competitor vs competitor).
6. **Hand off** — name the downstream artifacts that should consume this work (PRD positioning section, sales collateral, comparison-page copy → designer + copywriter).

</what-to-do>

## Principles

- **Facts over opinions.** Every claim traces to a scraped page, review, or metric. Label inferences clearly.
- **Honest assessment.** Don't exaggerate weaknesses or downplay strengths. Useful profiles are accurate.
- **Snapshots, not state.** Always include the "Generated" date. Re-pulls go in fresh date folders, never overwrite.
- **Comparable shape.** All profiles use the same template — consistency matters more than per-profile completeness.
- **Quick scan default.** Use deep-profile mode only when the user asks for it or there are ≤3 competitors.

## Tools

The skill is provider-agnostic. Use whatever's available in the harness:

- **Web fetch / scrape** for site content (homepage, pricing, features, about, customers, integrations, changelog).
- **Web search** for review aggregators (G2, Capterra, TrustRadius, Product Hunt) and DA/traffic estimates.
- **DataForSEO MCP / Ahrefs / SimilarWeb** if available, for backlinks, keyword rankings, traffic estimates.
- Save raw data first, then synthesize — so re-runs and audits are cheap.

## Quick scan vs deep profile

| | Quick scan | Deep profile |
|---|---|---|
| Pages scraped | Homepage + pricing | All key pages + reviews |
| SEO data | Domain rank + keyword count | Full backlinks + ranked keywords + competitor discovery |
| Review mining | Skip | G2 + Capterra + Product Hunt |
| Output | Abbreviated profile | Full template |

## Handoffs

- **PM** uses summaries for positioning, PRD non-goals, prioritization.
- **Designer** uses profiles when building comparison/alternative pages (via `frontend` skill).
- **Copywriter** uses positioning angle + customer language for landing copy.
- **Marketing-specialist** uses competitor SEO data for `discoverability` strategy.
