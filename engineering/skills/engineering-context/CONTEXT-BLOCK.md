# Context Block

The structured output this skill returns. Pass **verbatim** to downstream consumers — do not paraphrase. Reviewers and test-writers quote from it to check findings against intent.

```
## Context

**Ticket:** TASK-### — "title" (status) → URL
**PRD:** title → URL (fetched / already-in-context)
**Spec:** title → URL (fetched / already-in-context)
**Branch / feature:** {branch or feature name}

### Goals (from PRD)
{verbatim bullets}

### Non-Goals (from PRD)
{verbatim bullets — critical. Reviewers must check findings against these.}

### Phase scope
{which user stories / tasks belong to *this* phase vs future phases. Findings that flag "missing feature X" when X is a future phase are noise.}

### Key decisions (from Spec)
{verbatim — especially decisions that look like bugs but are intentional, e.g. "losing the graph loses nothing", "forgetEdge is graph-only"}

### Open questions (from Spec)
{verbatim. Findings that hit an open question are labeled "Spec Open Q", not bugs.}

### Edge-case expectations (from PRD tables, if any)
{verbatim rows — code that matches these is correct, not buggy}

### Prior decisions (from KB)
{top memories/edges matching the feature keywords. Format: `- <fact> (sentiment, source memory)`}

### Known issues (from KB namespace=retro)
{top retro findings in the same area}

### Repo conventions (from Explore)
{load-bearing patterns — 5-8 bullets}

### Context gathering gaps
{anything you couldn't fetch — missing PRD, KB unavailable, ambiguous ticket. State so callers know what framing is shaky.}
```
