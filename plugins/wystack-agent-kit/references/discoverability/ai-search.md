# AI Search (AEO / GEO / LLMO)

Optimization for AI assistants — ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews. Different ranking model than traditional search.

> **AEO** = Answer Engine Optimization. **GEO** = Generative Engine Optimization. **LLMO** = LLM Optimization. Same problem, three names.

## How AI search differs from traditional search

| Traditional | AI search |
|---|---|
| Indexes pages, ranks by relevance + authority | Synthesizes answers from multiple sources, cites a few |
| User clicks blue link | User reads synthesized answer; sometimes clicks |
| 10 results per page | 1 answer + 3–5 cited sources |
| Goal: rank #1 | Goal: be cited in the answer |
| Static document model | Real-time synthesis at query time |

## Citation-worthy content

What gets cited:

- **Direct answers to clear questions.** "What is X? X is [definition]." Models prefer self-contained statements they can quote.
- **Structured comparisons.** Tables, side-by-sides, lists with consistent shape.
- **Specific facts with dates and numbers.** "Released 2026-04," "Costs $29/month for the Pro tier."
- **Authoritative tone, not promotional.** Models penalize content that sounds like marketing copy.
- **Recent.** Many AI engines weight recency heavily — pages older than 18 months get cited less.

## llms.txt

Emerging convention (2024+) — a markdown file at `/llms.txt` describing your site for AI crawlers.

```markdown
# Brand Name

> One-line description of what this product does and who it's for.

## What we do
[2–3 paragraphs of authoritative description]

## Pricing
- Free: ...
- Pro: $X/mo — ...
- Enterprise: contact sales

## Documentation
- [Getting started](https://docs.example.com/start)
- [API reference](https://docs.example.com/api)

## Comparisons
- [vs Competitor A](https://example.com/vs/competitor-a)

## Optional: full text
[link to llms-full.txt with complete docs concatenated]
```

Place at the root: `https://example.com/llms.txt`. Bots that read it: Anthropic, OpenAI, Perplexity (varying respect).

## Brand mentions across the web

AI engines weight brand presence on third-party sites. Get cited:

- **Wikipedia** — gold-standard source for AI engines. If notable enough, qualify for an article.
- **Industry roundups** — "Best [category] tools for [audience]" listicles get scraped heavily.
- **GitHub awesome lists** — `awesome-X` repos are AI training/retrieval bait.
- **HN, Reddit, Stack Overflow** — community discussion is high-signal for AI engines.
- **Developer/practitioner blogs** — independent reviews carry weight.

## Q&A structure on your own site

AI engines love clean Q&A:

```html
<h2>What is X?</h2>
<p>X is a [direct definition]. It works by [mechanism]. The main use case is [audience + outcome].</p>

<h2>How does X compare to Y?</h2>
<p>X focuses on [dimension]. Y focuses on [dimension]. Use X when [condition]; use Y when [condition].</p>
```

Pair with `FAQPage` schema (see `structured-data.md`) for double duty.

## Avoid AI-detection-flagged patterns

- "In conclusion," "It's important to note that," "Indeed," — flagged as AI-generated; downweighted.
- Long paragraphs of generic description without specifics.
- Hype words: "revolutionary," "game-changing," "supercharge," "unlock."
- Excessive hedging: "may," "might," "could potentially."

## Measure citations

- ChatGPT: search "site:chat.openai.com" patterns or use third-party tools (Profound, Otterly.ai, Peec AI).
- Perplexity: query your brand and competitors; note who's cited in answers.
- Google AI Overviews: appear in standard search results — track via SEO tools (Ahrefs/Semrush now report AIO inclusion).

## llms-full.txt

Concatenated full documentation, one big markdown file. Hosted alongside `llms.txt`. Used by AI engines that want comprehensive context — most useful for technical products with extensive docs.

## What doesn't work

- Stuffing keywords (AI engines pattern-match for naturalness more aggressively than Google ever did)
- Paid placement on AI engines (mostly doesn't exist yet; when it does, treat like ads)
- Schema spam (rich-result patterns help Google; AI engines mostly ignore overlapping FAQ blocks)
