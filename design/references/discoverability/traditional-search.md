# Traditional Search (Google, Bing)

The classical SEO surface. Still the largest single discovery channel for most products.

## Crawlability foundation

| Asset | Required | Notes |
|---|---|---|
| `robots.txt` | Yes | Allow crawling, declare sitemap location, block admin/staging paths |
| `sitemap.xml` | Yes | Auto-regenerate on content change. Submit in Google Search Console |
| Canonical tags | Yes | One canonical per page; consistent across HTTP/HTTPS, www/non-www |
| Status codes | Yes | 200 for valid pages; 301 for moved (never 302); 410 for permanently gone |

## On-page essentials

### Meta tags

```html
<title>Page-specific, ~50–60 chars, primary keyword early</title>
<meta name="description" content="~150 chars, summarizes value, includes primary + secondary keywords naturally" />
<link rel="canonical" href="https://example.com/this-page" />
```

### Open Graph + Twitter cards

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://example.com/og/page-slug.png" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

OG image: 1200×630, < 1MB, branded, descriptive text on image.

### Structured headings

- One `<h1>` per page, matches `<title>` intent.
- Sequential `<h2>`–`<h6>` — never skip levels.
- Headings describe content, not just style.

## Core Web Vitals (ranking factor since 2021)

| Metric | Target | What it measures |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | Main content visible |
| **INP** (Interaction to Next Paint) | < 200ms | Interactivity |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability |

Test via PageSpeed Insights, Chrome DevTools, or `web-vitals` lib in production.

## Internal linking

- Topic clusters: pillar page links to all sub-topic pages; sub-topics link back and to siblings.
- Use descriptive anchor text — never "click here".
- Footer links carry low value; in-content links carry high value.
- Maximum ~100 internal links per page (signal dilution beyond that).

## URL structure

- Lowercase, hyphenated.
- Reflect hierarchy: `/blog/category/post-slug`.
- Avoid query params for content URLs (use rewrites).
- Stable — never change a URL without 301 redirect.

## Sitemap considerations

- One sitemap per ~50,000 URLs; index sitemap if more.
- Include `<lastmod>` only if accurate (Google penalizes lying lastmods).
- Separate sitemaps for content types (`sitemap-blog.xml`, `sitemap-products.xml`).
- Image sitemap if images drive traffic.

## Common mistakes

- Multiple H1s
- Title tag stuffed with keywords ("Best Project Management Tool | Free Project Management | Project Management Software")
- Auto-translated content with no native review (poor quality signal)
- Infinite-scroll without paginated alternative URLs (uncrawlable)
- JS-only content without SSR/prerender (Googlebot is fine, other bots aren't)
- Hreflang errors on multi-language sites
