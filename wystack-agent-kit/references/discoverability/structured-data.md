# Structured Data (JSON-LD)

Schema.org JSON-LD fuels both Google rich results AND AI search citation.

## Why JSON-LD over Microdata/RDFa

- Decoupled from markup — easier to maintain.
- Single block per page in `<head>` or `<body>`.
- Google's preferred format.
- Easier to lint and validate.

## Common types per surface

| Surface | Primary type | Secondary |
|---|---|---|
| Product page | `Product` | `Offer`, `AggregateRating`, `Review` |
| Article / blog post | `Article` (or `BlogPosting`, `NewsArticle`) | `Person` (author), `Organization` (publisher) |
| Landing page | `WebPage` + `Organization` | `BreadcrumbList` |
| FAQ section | `FAQPage` | each Q as `Question` + `Answer` |
| How-to | `HowTo` | each step as `HowToStep` |
| Software / app | `SoftwareApplication` | `Offer`, `AggregateRating` |
| Local business | `LocalBusiness` (specific subtype) | `PostalAddress`, `OpeningHours` |
| Recipe | `Recipe` | `NutritionInformation` |
| Event | `Event` | `Place`, `Offer` |
| Video | `VideoObject` | `Clip` |
| Comparison page | `Article` + multiple `Product` | `ComparisonTable` (no official type — use `Table` |

## Template: Product

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "...",
  "image": ["https://example.com/p1.jpg"],
  "brand": { "@type": "Brand", "name": "Brand" },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/product",
    "price": "29.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
</script>
```

## Template: Article

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article title",
  "description": "...",
  "image": ["https://example.com/hero.jpg"],
  "datePublished": "2026-05-02",
  "dateModified": "2026-05-02",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://example.com/authors/author"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Site Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
</script>
```

## Template: Organization (site-wide)

Place once, on the homepage:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Brand Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/brand",
    "https://github.com/brand",
    "https://linkedin.com/company/brand"
  ]
}
</script>
```

## Template: FAQPage

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is X?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "X is..."
      }
    }
  ]
}
</script>
```

> FAQPage is heavily used by AI engines for direct answers. High ROI for any product or doc page with common questions.

## Template: SoftwareApplication

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "App Name",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "89"
  }
}
</script>
```

## Validation

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org)
- Lint in CI: `schema-dts` (TypeScript), `pyld` (Python).

## Common pitfalls

- Schema doesn't match visible content → Google ignores or penalizes.
- Empty fields → invalid; omit instead.
- Reviews without real reviews → manipulation flag.
- Duplicate schema blocks → use `@graph` to bundle.
- Missing required properties for the type — check schema.org docs per type.
