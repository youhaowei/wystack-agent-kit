# Comparison & Alternative Pages

Four formats, each matching a different search intent. These pages need real, verifiable competitor facts (pricing, features, citable claims) — readers verify, so acknowledge competitor strengths, say who each is best for, and centralize per-competitor data so updates propagate to every page.

## Format 1: [Competitor] Alternative (singular)

**Intent**: actively switching from a specific competitor.
**URL**: `/alternatives/[competitor]` or `/[competitor]-alternative`
**Keywords**: "[Competitor] alternative", "alternative to [Competitor]", "switch from [Competitor]"

1. Why people look for alternatives (validate the pain)
2. You as the alternative (quick positioning)
3. Detailed comparison (features, service, pricing)
4. Who should switch — and who shouldn't
5. Migration path
6. Social proof from switchers
7. CTA

## Format 2: [Competitor] Alternatives (plural)

**Intent**: researching options, earlier in the journey.
**URL**: `/alternatives/[competitor]-alternatives`
**Keywords**: "[Competitor] alternatives", "best [Competitor] alternatives", "tools like [Competitor]"

1. Why people look for alternatives (common pain points)
2. What to look for (criteria framework)
3. List of alternatives — you first, but include 4–7 real options
4. Comparison table (summary)
5. Detailed breakdown of each
6. Recommendation by use case
7. CTA

> Listing real alternatives builds trust and ranks better. Don't list only your product.

## Format 3: You vs [Competitor]

**Intent**: directly comparing you to a specific competitor.
**URL**: `/vs/[competitor]` or `/compare/[you]-vs-[competitor]`
**Keywords**: "[You] vs [Competitor]", "[Competitor] vs [You]"

1. TL;DR (key differences in 2–3 sentences)
2. At-a-glance comparison table
3. Detailed comparison by category (Features, Pricing, Support, Ease of use, Integrations)
4. Who [You] is best for
5. Who [Competitor] is best for (be honest)
6. What customers say (switcher testimonials)
7. Migration support
8. CTA

## Format 4: [Competitor A] vs [Competitor B]

**Intent**: comparing two competitors (not you directly).
**URL**: `/compare/[a]-vs-[b]`

1. Overview of both products
2. Comparison by category
3. Who each is best for
4. The third option (introduce yourself)
5. Comparison table (all three)
6. CTA

> Captures competitor-term search traffic; positions you as knowledgeable.

## Essential sections (any format)

- **TL;DR** — key differences in 2–3 sentences for scanners.
- **Paragraph comparisons** — beyond tables; explain *when* each difference matters.
- **Feature comparison** — per category: how each handles it, strengths, limits, bottom line.
- **Pricing comparison** — tier-by-tier, what's included, hidden costs, total for a sample team size.
- **Who it's for** — explicit ideal customer for each option.
- **Migration** — what transfers, what reconfigures, support offered, switcher quotes.

## Centralized competitor data

Per-competitor source of truth, reused across all pages:

```yaml
name: ResponseHub
positioning: enterprise survey + analytics
target: Fortune 500 ops teams
pricing: { starter: $99/mo, pro: $499/mo, enterprise: contact }
features: { surveys: 5, analytics: 4, integrations: 3 }  # 0–5 strength rating
strengths: [deep enterprise SSO, polished analytics]
weaknesses: [long contracts, limited self-serve]
best_for: [Fortune 500 ops]
not_ideal_for: [small teams, startups]
common_complaints: ["Sales-led, slow onboarding", "Export limited to CSV"]
migration_notes: ["Most fields export via API", "Custom workflows need rebuild"]
```

## SEO & upkeep

- **Internal linking** — link related comparison pages; link feature pages to relevant comparisons; hub page linking all competitor content.
- **Schema** — FAQ schema for "What is the best alternative to [Competitor]?".
- **Depth** — thin pages get outranked; pricing and migration sections must satisfy intent.
- **Refresh** — verify pricing/features quarterly, re-scrape on a reported change, full refresh annually.
