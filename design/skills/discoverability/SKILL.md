---
name: discoverability
description: Make a site, product, plugin, or tool findable across all surfaces — Google/Bing search, AI search (ChatGPT, Claude, Perplexity, AI Overviews, AEO/GEO/LLMO), structured data (JSON-LD schema), site architecture (URL structure, IA, internal linking, sitemap), directories (Product Hunt, GitHub topics, npm keywords, AlternativeTo, G2, Capterra, MCP registry, plugin marketplaces), and AI agent discovery (tool catalogs, llms.txt, README parsing). Use when the user mentions "SEO", "schema markup", "structured data", "make this rank", "rank for X", "AI search", "AEO", "GEO", "LLMO", "show up in ChatGPT", "Perplexity citations", "AI Overviews", "Product Hunt launch", "submit to directories", "GitHub topics", "make my plugin discoverable", "MCP registry", "llms.txt", "sitemap", "meta tags", "OG image", "Core Web Vitals", "internal linking", "URL structure", or "site architecture".
---

# Discoverability

Channel-agnostic findability. Five surfaces, one cohesive concern.

## What to do

<what-to-do>

1. **Confirm the surface mix.** Ask which channels matter for this project — most have a primary (e.g. organic search for a content site, marketplace for a plugin) but rarely just one.
2. **Audit current state per surface** before recommending. For each in-scope surface, run the relevant check from the references.
3. **Recommend in priority order** — fix critical breakage first (uncrawlable pages, missing canonicals, no sitemap, no `robots.txt`), then high-leverage additions (schema for top pages, llms.txt, directory listings).
4. **Implement incrementally.** A complete schema block on the homepage beats partial schema across 50 pages. Ship one full thing, then expand.
5. **Measure.** Set up the right dashboard before launch — Google Search Console, Bing Webmaster, AI citation trackers, directory listings tracker. Without measurement you can't tell what worked.

</what-to-do>

## The five surfaces

Load the relevant reference for each in-scope channel:

| Surface | When | Reference |
|---|---|---|
| Traditional search (Google/Bing) | Any web property | [`references/discoverability/traditional-search.md`](../../references/discoverability/traditional-search.md) |
| Structured data (JSON-LD) | Anything indexable; double duty for AI engines | [`references/discoverability/structured-data.md`](../../references/discoverability/structured-data.md) |
| AI search (AEO / GEO / LLMO) | Any web property reachable by AI crawlers | [`references/discoverability/ai-search.md`](../../references/discoverability/ai-search.md) |
| Site architecture / IA | Multi-page sites | [`references/discoverability/site-architecture.md`](../../references/discoverability/site-architecture.md) |
| Directories / marketplaces | Products, plugins, tools, apps | [`references/discoverability/directories.md`](../../references/discoverability/directories.md) |
| AI agent discovery | Tools, plugins, MCP servers, packages | [`references/discoverability/agent-discoverability.md`](../../references/discoverability/agent-discoverability.md) |

## Quick audits per surface

### Traditional search
- `robots.txt` exists and allows crawl?
- `sitemap.xml` exists and submitted to GSC?
- Title tag + meta description on every important page?
- Canonical tag set, no conflicts (HTTP/HTTPS, www/non-www, trailing slash)?
- Core Web Vitals passing (LCP < 2.5s, INP < 200ms, CLS < 0.1)?
- One H1 per page, sequential heading levels?

### Structured data
- Site-wide `Organization` on homepage?
- Page-type schema on all major templates (Product, Article, FAQPage, SoftwareApplication, BreadcrumbList)?
- Validated in Rich Results Test?
- No phantom data (schema fields with no visible equivalent)?

### AI search
- Authoritative tone, not promotional?
- Direct Q&A structure on key pages?
- llms.txt at root?
- Brand mentions on Wikipedia / GitHub / HN / Reddit?
- Recent (< 18 months) content?

### Site architecture
- Important pages within 2 clicks of homepage?
- Topic clusters: pillar pages link to sub-topics, sub-topics link back?
- Anchor text descriptive (no "click here")?
- No orphan pages?
- URLs lowercase, hyphenated, stable?

### Directories
- Product Hunt launch planned/done with comms runway?
- Listed on relevant evergreen review sites (G2, Capterra) — for B2B?
- Listed on AI directories (TAAFT, Futurepedia) — for AI tools?
- Listed on GitHub topics + awesome lists — for OSS?
- Listed on MCP registry / plugin marketplaces — for AI tools/extensions?
- Listings tailored per directory (not pasted everywhere)?

### Agent discoverability
- README opens with one-line description + install command?
- Description names trigger phrases agents will hear in user prompts?
- llms.txt + optional llms-full.txt?
- Recent commits, versioned releases, responsive issue tracker?
- Tool/skill descriptions optimized for dispatch (not marketing prose)?

## Outputs

When asked to *audit*: structured findings doc with per-surface severity (MUST / SUGGEST), specific fixes, and a priority order.

When asked to *implement*: ship the actual changes — schema blocks added, sitemap regenerated, llms.txt written, listings drafted. Don't just hand back recommendations.

## Hand-offs

- **Designer** owns implementation of meta tags, schema in components, OG images, internal linking patterns.
- **Copywriter** owns the actual content of titles, descriptions, llms.txt copy, directory listings.
- **Marketing-specialist** (you) coordinates strategy across surfaces and owns standalone discoverability work like Product Hunt launches.

## Anti-patterns

- **Keyword stuffing.** Both Google and AI engines pattern-match for naturalness; stuffing tanks ranking.
- **Schema spam.** Lots of FAQPage blocks with phantom Q&A → manipulation flag.
- **Mass directory submission.** 100 spam directories backlinks hurt; 10 quality listings help.
- **Optimizing only for one surface.** A page tuned for Google may bomb for AI search; tune for both.
- **Treating discoverability as post-launch polish.** Schema, IA, and meta should be designed in from day one.
