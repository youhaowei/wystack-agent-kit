---
name: competitor-analysis
description: "Research and profile competitors into comparable, fact-based dossiers and a positioning map. Use when the user mentions competitor research, competitive analysis, competitive intelligence, competitor profiles, or the competitor landscape, or shares competitor URLs. Output feeds positioning, PRD goals, and non-goals. For building competitor comparison / vs pages, see design:copywriting."
---
# Competitor Analysis

Research competitors and produce comparable, fact-based dossiers — the positioning input for PRD and brainstorm work.

## Workflow

1. **Confirm scope** — get competitor URLs; ask quick-scan vs deep-profile.
2. **Read existing context** — check `competitor-profiles/` (repo root) for prior profiles before re-researching. Read the project PRD and glossary for "your product" framing.
3. **Profile each competitor** following [PROFILE-TEMPLATE.md](PROFILE-TEMPLATE.md):
   - Save raw data under `competitor-profiles/raw/<slug>/<YYYY-MM-DD>/{scrapes,seo,reviews}/`
   - Synthesize one `competitor-profiles/<slug>.md` per competitor
   - Cite sources for every claim
4. **If multiple competitors** — write `competitor-profiles/_summary.md` with a comparison table, positioning map, and key takeaways.
5. **Report** — hand the result to `engineering:present`, leading with the positioning takeaway: where the competitive gap is and what it implies for goals and non-goals. The profiles are the evidence; the takeaway is the lead, not a raw dossier dump.

## Principles

- **Facts over opinions.** Every claim traces to a scraped page, review, or metric. Label inferences clearly.
- **Honest assessment.** Don't exaggerate weaknesses or downplay strengths. Useful profiles are accurate.
- **Snapshots, not state.** Always include the "Generated" date. Re-pulls go in fresh date folders, never overwrite.
- **Comparable shape.** All profiles use the same template — consistency matters more than per-profile completeness.
- **Depth matches stakes.** Quick scan by default; deep-profile when the user asks, or when the competitor set is small enough to afford it.

## Tools

The skill is provider-agnostic. Use whatever's available in the harness:

- **Web fetch / scrape** for site content (homepage, pricing, features, about, customers, integrations, changelog).
- **Web search** for review aggregators (G2, Capterra, TrustRadius, Product Hunt) and traffic estimates.
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

- **PRD / brainstorm** — `engineering:prd` and `engineering:brainstorm` consume the profiles and positioning map for goals, non-goals, and prioritization.
- **Design** — `design:copywriting` builds competitor comparison / vs pages from these profiles; competitor SEO data also feeds `design:discoverability`.
