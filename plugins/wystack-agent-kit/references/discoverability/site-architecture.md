# Site Architecture / IA

URL structure, navigation, internal linking. Affects crawlability AND AI parsing AND user findability.

## URL structure principles

- **Lowercase, hyphenated.** `/pricing` not `/Pricing` or `/pricing_page`.
- **Reflect hierarchy.** `/blog/category/post-slug` shows nesting; `/p/123/blog-post` doesn't.
- **Stable.** Never change a URL without 301 redirect. URLs are part of the public API.
- **No verbs.** `/users/123` not `/get-user/123`. URLs are nouns.
- **No file extensions for content.** `/about` not `/about.html`. Tech-stack invisibility.
- **Avoid IDs in URL when slug works.** `/blog/why-x-matters` not `/blog/post-1234`.

## Navigation hierarchy

| Pattern | When |
|---|---|
| **Flat (≤7 top items)** | Small sites, marketing sites, single-product apps |
| **Two-level mega menu** | Larger marketing sites with categories |
| **Sidebar (persistent)** | Doc sites, dashboards, complex apps |
| **Breadcrumbs** | Always for nested content; emit `BreadcrumbList` schema |

> Hick's Law: more options = slower decisions. Top nav over 7 items signals an IA problem.

## Topic clusters (the modern SEO model)

Replace the old "thousands of long-tail pages" model with topic clusters:

```
Pillar page (broad topic)
├── Sub-topic page A
├── Sub-topic page B
├── Sub-topic page C
│   └── Deep article (specific question within sub-topic C)
└── Sub-topic page D
```

- Pillar covers the topic broadly + links to all sub-topics.
- Sub-topics deep-dive one aspect each + link back to pillar + link laterally to siblings.
- Internal links use descriptive anchor text matching the destination's topic.

## Internal linking

- **In-content links carry weight.** Footer links carry minimal SEO weight.
- **Anchor text matters.** Use descriptive text matching the destination's main keyword.
- **No more than ~100 internal links per page.** Beyond that, signal dilution.
- **Hub pages** for major topics — link from homepage and main nav.
- **Two clicks from homepage** is the target depth for important pages.

## Content depth model

Two-tiered:

| Tier | Pages | Purpose |
|---|---|---|
| **Trunk** | Homepage, pricing, product, about, contact | Brand + conversion |
| **Branches** | Topic clusters, comparison pages, doc roots | Discoverability + nurture |
| **Leaves** | Individual articles, deep docs, comparison-pair pages | Long-tail capture |

## Programmatic pages

When generating pages at scale (location pages, vs/alternative pages, integration pages):

- **Each page must add unique value** — not the same template with [Variable] swapped.
- **Index control** — if pages are thin, exclude from sitemap or use `noindex` until quality threshold met.
- **Template + data sources** — keep generation logic in code; content in structured data; review samples manually.
- **Avoid index bloat** — Google penalizes sites with thousands of low-quality pages.

## Faceted navigation (for catalog sites)

| Pattern | When |
|---|---|
| Server-rendered facet URLs | When facet combinations are intentional landing pages (`/category/red-shoes`) |
| `noindex` + canonical to category root | When facets are filters, not destinations |
| URL parameters with `robots.txt` blocks | Tracking-only parameters |

## Search inside the site

- Built-in site search closes the gap when navigation can't reach.
- Track failed searches — they reveal IA gaps (people searching for pages that don't exist or are mis-named).

## Common architectural anti-patterns

- **Orphan pages** — pages with no inbound internal links. Crawlers can't find them; users can't either.
- **Click-depth > 4** — important content buried.
- **Duplicate URLs** — same content at multiple URLs without canonical. Common with case-sensitive routes, trailing slashes, params.
- **Pagination without rel=prev/next or alternative URLs** — uncrawlable beyond page 1.
- **Modal-only content** — content trapped behind JS interactions, no URL.
- **Auto-redirect chains** — A→B→C costs ranking signal at each hop.
