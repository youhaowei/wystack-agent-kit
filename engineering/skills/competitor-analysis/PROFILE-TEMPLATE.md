# Competitor Profile Template

One markdown file per competitor at `competitor-profiles/<competitor-slug>.md`.

## Filesystem layout

```
competitor-profiles/
├── raw/
│   └── <competitor-slug>/
│       └── <YYYY-MM-DD>/
│           ├── scrapes/    # one .md per scraped page
│           ├── seo/        # one .json per SEO API call
│           └── reviews/    # one .md/.json per review source
├── <competitor-slug>.md    # synthesized profile
└── _summary.md             # cross-competitor summary (when multiple)
```

Rules:
- `<competitor-slug>` is lowercase, hyphenated.
- `<YYYY-MM-DD>` is the day data was pulled — supports diffing snapshots over time.
- Always create a fresh date folder; never overwrite a prior date.
- The synthesized profile cites the raw data folder it was built from.

## Profile template

```markdown
# [Competitor Name] — Competitor Profile

**URL**: [website]
**Generated**: [YYYY-MM-DD]
**Depth**: [quick scan | deep profile]

---

## At a Glance

| Metric | Value |
|--------|-------|
| Tagline | [from homepage] |
| Founded | [year] |
| Headquarters | [location] |
| Team size | [estimate] |
| Funding | [if known] |
| Domain rank | [DA from Ahrefs/Moz/DataForSEO] |
| Est. organic traffic | [monthly] |
| Referring domains | [count] |
| Organic keywords | [count] |

---

## Positioning & Messaging

**Primary value proposition**: [headline + subheadline]
**Target audience**: [inferred from copy]
**Positioning angle**: [e.g. "simplicity-first," "enterprise-grade," "all-in-one"]
**Key messaging themes**:
- [theme 1 — source page]
- [theme 2]
- [theme 3]

---

## Product & Features

### Core capabilities
- [capability 1] — [brief]
- ...

### Notable differentiators
- [what they emphasize as unique]

### Integrations
- [count] integrations
- Key: [top 5–10]

### Product direction signals
- [from changelog / recent releases]

---

## Pricing

| Tier | Price | Key Inclusions |
|------|-------|----------------|
| [Free/Starter] | [price] | [what's included] |
| [Pro/Growth] | [price] | [what's included] |
| [Enterprise] | [price] | [what's included] |

**Billing**: [monthly/annual, discount for annual]
**Free trial**: [yes/no, duration]
**Notable**: [pricing quirks — per-seat, usage-based, hidden costs]

---

## Customers & Social Proof

**Named customers**: [logos]
**Industries**: [served]
**Case study themes**: [outcomes highlighted]
**Review ratings**:
- G2: [rating] ([count] reviews)
- Capterra: [rating] ([count] reviews)

---

## SEO & Content Strategy

**Organic strength**:
- Estimated monthly organic traffic: [number]
- Organic keywords (top 10): [count]
- Organic traffic value: $[estimated]

**Top organic pages** (by est. traffic):
1. [URL] — [keyword] — [est. traffic]
2. [URL] — [keyword] — [est. traffic]
3. [URL] — [keyword] — [est. traffic]

**Content strategy signals**:
- Blog frequency: [estimate]
- Primary content types: [guides, comparisons, templates]
- Focus areas: [topics]

**Backlink profile**:
- Referring domains: [count]
- Top referring sites: [list 5]
- Acquisition pattern: [growing/stable/declining]

---

## Strengths & Weaknesses

### Strengths
- [strength 1 — evidence source]
- [strength 2]
- [strength 3]

### Weaknesses
- [weakness 1 — evidence source]
- [weakness 2]
- [weakness 3]

---

## Competitive Implications for [Your Product]

**Where they're strong vs. us**: [their advantages]
**Where we're strong vs. them**: [your advantages]
**Opportunities**: [gaps to exploit]
**Threats**: [where they're improving]

---

## Raw Data Sources

- Homepage scraped: [date]
- Pricing scraped: [date]
- SEO data pulled: [date]
- Review data pulled: [date, sources]
- Raw folder: `competitor-profiles/raw/<slug>/<YYYY-MM-DD>/`
```

## Summary template

After profiling all competitors, write `competitor-profiles/_summary.md`:

```markdown
# Competitor Landscape Summary

**Generated**: [YYYY-MM-DD]
**Profiled**: [competitor-1, competitor-2, ...]

## Landscape overview

[One paragraph framing the competitive field.]

## Comparison table

| Metric | You | Competitor A | Competitor B | ... |
|--------|-----|--------------|--------------|-----|
| Founded | | | | |
| Pricing entry | | | | |
| Domain rank | | | | |
| Organic traffic | | | | |
| Positioning angle | | | | |

## Positioning map

[Where each sits on the relevant axes — e.g. simple↔complex, cheap↔premium, generic↔specialist.]

## Key takeaways

1. [strategic observation]
2. [strategic observation]
3. [strategic observation]

## Gaps and opportunities

- [underserved segment / unmet need]
- [positioning gap]
- [feature gap]
```

## Update cadence

- **Quarterly**: re-pull SEO metrics, verify pricing.
- **When a customer mentions a competitor change**: targeted re-scrape.
- **Annually**: full refresh + change log section at the bottom of each profile.
