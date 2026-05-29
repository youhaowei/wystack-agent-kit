# Comparison & Alternative Pages

Four formats, each matching a different search intent. Use after profiling is complete — work from the competitor profiles produced by `wystack-agent-kit:competitor-analysis`; these pages need facts to be honest.

## Principles

- **Honesty builds trust.** Acknowledge competitor strengths. Don't misrepresent. Readers verify.
- **Depth over surface.** Beyond feature checklists — explain *why* differences matter, with use cases.
- **Help them decide.** Be explicit about who you're best for AND who the competitor is best for.
- **Modular content.** Centralize per-competitor data; updates propagate to all pages.

## Format 1: [Competitor] Alternative (singular)

**Search intent**: actively switching from a specific competitor.
**URL**: `/alternatives/[competitor]` or `/[competitor]-alternative`
**Keywords**: "[Competitor] alternative", "alternative to [Competitor]", "switch from [Competitor]"

**Structure**:
1. Why people look for alternatives (validate the pain)
2. You as the alternative (quick positioning summary)
3. Detailed comparison (features, service, pricing)
4. Who should switch — and who shouldn't
5. Migration path
6. Social proof from switchers
7. CTA

## Format 2: [Competitor] Alternatives (plural)

**Search intent**: researching options, earlier in journey.
**URL**: `/alternatives/[competitor]-alternatives`
**Keywords**: "[Competitor] alternatives", "best [Competitor] alternatives", "tools like [Competitor]"

**Structure**:
1. Why people look for alternatives (common pain points)
2. What to look for in an alternative (criteria framework)
3. List of alternatives (you first, but include 4–7 real options)
4. Comparison table (summary)
5. Detailed breakdown of each alternative
6. Recommendation by use case
7. CTA

> Including real alternatives builds trust and ranks better. Don't list only your product.

## Format 3: You vs [Competitor]

**Search intent**: directly comparing you to a specific competitor.
**URL**: `/vs/[competitor]` or `/compare/[you]-vs-[competitor]`
**Keywords**: "[You] vs [Competitor]", "[Competitor] vs [You]"

**Structure**:
1. TL;DR (key differences in 2–3 sentences)
2. At-a-glance comparison table
3. Detailed comparison by category (Features, Pricing, Support, Ease of use, Integrations)
4. Who [You] is best for
5. Who [Competitor] is best for (be honest)
6. What customers say (testimonials from switchers)
7. Migration support
8. CTA

## Format 4: [Competitor A] vs [Competitor B]

**Search intent**: comparing two competitors (not you directly).
**URL**: `/compare/[a]-vs-[b]`

**Structure**:
1. Overview of both products
2. Comparison by category
3. Who each is best for
4. The third option (introduce yourself)
5. Comparison table (all three)
6. CTA

> Captures search traffic for competitor terms; positions you as knowledgeable.

## Essential sections (any format)

- **TL;DR** — key differences in 2–3 sentences for scanners.
- **Paragraph comparisons** — beyond tables; explain *when* each difference matters.
- **Feature comparison** — per category: how each handles it, strengths, limitations, bottom line.
- **Pricing comparison** — tier-by-tier, what's included, hidden costs, total cost for sample team size.
- **Who it's for** — explicit ideal customer for each option.
- **Migration** — what transfers, what reconfigures, support offered, switcher quotes.

## Centralized competitor data

Per-competitor source of truth for use across all pages:

```yaml
name: ResponseHub
url: https://responsehub.example
positioning: enterprise survey + analytics
target: Fortune 500 ops teams
pricing:
  starter: $99/mo
  pro: $499/mo
  enterprise: contact
features:
  surveys: 5  # 0–5 strength rating
  analytics: 4
  integrations: 3
strengths:
  - deep enterprise SSO
  - polished analytics dashboards
weaknesses:
  - long contract requirement
  - limited self-serve
best_for:
  - Fortune 500 ops
not_ideal_for:
  - small teams, startups
common_complaints:
  - "Sales-led, slow onboarding"
  - "Analytics export limited to CSV"
migration_notes:
  - "Most fields export cleanly via API"
  - "Custom workflows need rebuild"
```

## SEO

- **Internal linking** — link related comparison pages, link from feature pages to relevant comparisons, hub page linking all competitor content.
- **Schema** — FAQ schema for "What is the best alternative to [Competitor]?".
- **Pricing pages and migration sections** — deep enough to satisfy intent; thin pages get outranked.

## Update cadence

- **Quarterly**: verify pricing, check major feature changes.
- **When customer mentions a change**: targeted re-scrape.
- **Annually**: full refresh of all competitor data.
