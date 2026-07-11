---
name: discoverability
description: Make a site, product, plugin, or tool findable across all surfaces — Google/Bing search, AI search (ChatGPT, Claude, Perplexity, AI Overviews, AEO/GEO/LLMO), structured data (JSON-LD schema), site architecture (URL structure, IA, internal linking, sitemap), directories (Product Hunt, GitHub topics, npm keywords, AlternativeTo, G2, Capterra, MCP registry, plugin marketplaces), and AI agent discovery (tool catalogs, llms.txt, README parsing). Use when the user mentions "SEO", "schema markup", "structured data", "make this rank", "rank for X", "AI search", "AEO", "GEO", "LLMO", "show up in ChatGPT", "Perplexity citations", "AI Overviews", "Product Hunt launch", "submit to directories", "GitHub topics", "make my plugin discoverable", "MCP registry", "llms.txt", "sitemap", "meta tags", "OG image", "Core Web Vitals", "internal linking", "URL structure", or "site architecture".
---
# Discoverability

Channel-agnostic findability. Six surfaces, one cohesive concern.

## What to do

1. **Confirm the surface mix.** Ask which channels matter — most projects have a primary (organic search for content, marketplace for a plugin) but rarely just one.
2. **Audit current state per in-scope surface** using the relevant reference, before recommending.
3. **Recommend in priority order** — fix critical breakage first (uncrawlable pages, missing canonicals, no sitemap/`robots.txt`), then high-leverage additions (schema for top pages, llms.txt, directory listings).
4. **Implement incrementally.** Ship one full thing (complete homepage schema) before expanding (partial schema across 50 pages).
5. **Measure.** Stand up the right dashboard before launch — GSC, Bing Webmaster, AI citation trackers, listings tracker — or you can't tell what worked.

## The six surfaces

Load the relevant reference for each in-scope channel:

| Surface | When | Reference |
|---|---|---|
| Traditional search (Google/Bing) | Any web property | [`references/discoverability/traditional-search.md`](../../references/discoverability/traditional-search.md) |
| Structured data (JSON-LD) | Anything indexable; double duty for AI engines | [`references/discoverability/structured-data.md`](../../references/discoverability/structured-data.md) |
| AI search (AEO / GEO / LLMO) | Any web property reachable by AI crawlers | [`references/discoverability/ai-search.md`](../../references/discoverability/ai-search.md) |
| Site architecture / IA | Multi-page sites | [`references/discoverability/site-architecture.md`](../../references/discoverability/site-architecture.md) |
| Directories / marketplaces | Products, plugins, tools, apps | [`references/discoverability/directories.md`](../../references/discoverability/directories.md) |
| AI agent discovery | Tools, plugins, MCP servers, packages | [`references/discoverability/agent-discoverability.md`](../../references/discoverability/agent-discoverability.md) |

Each reference carries the surface's audit checklist; run it during step 2.

## Outputs

- **Audit** → structured findings doc: per-surface severity (MUST / SUGGEST), specific fixes, priority order.
- **Implement** → ship the actual changes (schema added, sitemap regenerated, llms.txt written, listings drafted), not just recommendations.

## Hand-offs

- **Designer** — implements meta tags, schema in components, OG images, internal linking.
- **Copywriter** — writes the titles, descriptions, llms.txt copy, directory listings.
- **Marketing-specialist** (you) — coordinates strategy across surfaces and owns standalone work like Product Hunt launches.

## Anti-patterns

- **Keyword stuffing** — Google and AI engines pattern-match for naturalness; stuffing tanks ranking.
- **Schema spam** — FAQPage blocks with phantom Q&A read as manipulation.
- **Mass directory submission** — 10 quality listings help; 100 spam backlinks hurt.
- **Optimizing for one surface** — a page tuned for Google may bomb for AI search; tune for both.
- **Treating discoverability as post-launch polish** — schema, IA, and meta belong in from day one.
