---
name: context
description: "Gather spec-anchored context for engineering work by delegating to task-manager, wiki-librarian, Explore, and kb in parallel. Use whenever you're about to review, test, fix, plan, or document work that references a ticket, feature, or feature-branch. Invoke this BEFORE reviewers, test-writers, or architects — they produce false-positive findings without Goals, Non-Goals, and Key Decisions in hand. Also use when the user mentions a PRD/Spec URL, a TASK-### ID, or a feature name and you need the surrounding design context before proceeding."
---

# Engineering Context

One job: return a spec-anchored context block so downstream work (reviews, tests, fixes, breakdowns, design decisions) measures code against intent, not against guesswork.

Without this step, reviewers flag intentional design as bugs, test-writers encode implementation as contract, and architects re-litigate decisions that already happened. The fix is cheap — run this once upfront, then every downstream consumer gets the same framing.

## Input

`$ARGUMENTS` — optional. Accepts any of:
- Branch name (detect `task-{id}-*`, `feat/{feature}-phase{N}`, `fix/{id}`)
- Notion Task URL or TASK-### ID
- Feature name / phase name for title-based search
- Empty → infer from current branch + `git log -20 --oneline`

**Mode** (optional, second arg): `review` | `test` | `plan` | `fix`. Adjusts what `Explore` returns. If omitted, the skill infers from conversation signals (see below). Explicit argument always wins.

### Mode auto-detection

Infer from, in priority order:

1. **The invoking skill.** `engineering:code-review` / `:full-review` → `review`. `tdd` / `test-writer` → `test`. `engineering:prd` / `:spec` / `:breakdown` / `:groom` / `:new` / `:start` → `plan`. `fix` / `triage` → `fix`.
2. **Recent tool output.** A fresh `git diff` / changed file list / `gh pr` → `review`. Failing test output, stack traces, error logs → `fix`. Running `bun test` / `vitest` / reading `test/*.ts` files → `test`. Drafting docs with no repo diff → `plan`.
3. **User's latest message verbs.** "review", "findings", "check this branch" → `review`. "write tests", "coverage" → `test`. "why is this broken", "failing", "regression" → `fix`. "plan", "break down", "estimate", "groom" → `plan`.
4. **Ambiguous or no signal** → default to `review`. It's the widest mode; the others are narrower subsets.

**State the detection inline** so the caller can redirect:

> *"Detected mode: `fix` (signals: recent stack trace, user said 'why is this failing'). Proceeding — reply with a different mode if that's wrong."*

Never silently categorize. If the signals disagree (e.g. invoking skill says `review` but the conversation is clearly a bug hunt), surface that: *"Invoked from code-review but conversation reads like a fix — going with `review` since it's broader; say `fix` if you want the narrower Explore."* Let the user break the tie once; don't ping on every inference.

## Pipeline

```
Freshness check → Parallel fetch (4 specialists) → Synthesize → Return structured block
```

### 1. Freshness check (do this first)

Before dispatching specialists, scan the current conversation for context that's already loaded. Re-fetching wastes tokens and risks diverging answers. Skip a specialist if the conversation already contains its output.

For each of the four sources below, look for these signals in the recent transcript (tool results, user messages, system reminders):

| Source | Already-loaded signals |
|---|---|
| `task-manager` (ticket) | A `TASK-###` with ACs, a Notion Task URL that was fetched this session, or the user pasted the ticket body |
| `wiki-librarian` (PRD/Spec) | Text containing "## Goals", "## Non-Goals", "Decision #", user stories like "US-5", or a Wiki URL that was fetched |
| `Explore` (repo) | A recent Explore agent report, or substantial reads of `CLAUDE.md` / `DESIGN.md` + multiple files in the affected modules |
| `kb` (prior decisions) | Recent `kb search` output, or loaded project memory files beyond `MEMORY.md` |

State what you found inline, so the user can override: *"Freshness check: PRD is already in context from the earlier fetch. Skipping wiki-librarian. Dispatching task-manager + Explore + kb."*

If you're unsure whether something is fresh enough, err toward re-fetching — stale context is worse than one extra subagent call. But don't re-fetch a PRD whose content is visibly in the transcript.

### 2. Parallel dispatch

Launch the not-skipped specialists in a **single message**. Each gets a focused prompt.

#### a. `engineering:task-manager` → Notion Tasks

Give it:
- Branch name + search patterns (`task-{id}-*`, `feat/{feature}-phase{N}`, `fix/{id}`)
- Relevant commits — commit messages often carry `TASK-###` even when the branch doesn't
- Explicit request for: ticket title, ID, status, ACs, scope, plan, **and any linked PRD/Spec URLs** (passed through to wiki-librarian's synthesis)

#### b. `engineering:wiki-librarian` → Notion Wiki

Give it:
- Task's linked PRD/Spec URLs (if known upfront — pass through, don't make it search)
- Feature name / phase name for title-search if URLs aren't available
- Instruction: return **full content** of PRDs/Specs + one hop of Related/Prior-art links. Not summaries — downstream consumers quote from it.

The librarian is the right agent for *reads*, not just writes: it knows the Wiki schema and finds docs the task-manager can't.

#### c. `Explore` (medium thoroughness) → codebase

Give it the scope based on mode:

| Mode | What Explore should surface |
|---|---|
| `review` | Module boundaries around the changed files, local conventions, relevant CLAUDE.md/DESIGN.md, tests defining expected behavior |
| `test` | Existing test helpers/factories/fixtures, test conventions in the affected area, what behaviors lack coverage |
| `plan` | Architecture of the area to be changed, extension points, recent churn in the module |
| `fix` | Entry points, error paths, and existing tests around the bug site |

Cap the report at ≤400 words. Reviewers don't need a tour — they need the load-bearing conventions.

#### d. `kb` search → prior decisions (via Bash)

Query the personal knowledge graph for durable decisions and known issues. Two passes:

```bash
kb search "<feature-name / task-title keywords>" --ns default --limit 20 --json
kb search "<same keywords>" --ns retro --limit 10 --json
```

Returns: memories/edges that captured prior decisions ("we rejected Redux", "Bun segfaults on `lbug.close()`") and retro findings (known bugs in the area). These often explain "why is the code like this?" better than PRDs do — the PRD captures the current feature's intent; the KB captures durable cross-feature decisions.

If `kb` CLI fails (Ollama down, DB issues), note it and continue. Not critical path.

### 3. Synthesize and return

Produce a structured block the caller can pass verbatim to downstream work. Do **not** paraphrase the spec — downstream reviewers need the exact wording to check findings against.

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

### 4. Gate

After presenting the context block, **state back to the user one short confirmation**: "Context captured: {feature name}, Phase {N}, {M} goals / {K} non-goals / {D} decisions. Proceeding to {downstream step}."

If anything critical is missing — no PRD found and no user-provided fallback, or the spec has open questions that directly affect the downstream work — pause and ask. Don't plow ahead with a shaky foundation; the downstream step will amplify the gap.

## Fallback paths

If `task-manager` or `wiki-librarian` reports "Notion unavailable":
1. Try loading the Notion MCP via `ToolSearch select:mcp__plugin_Notion_notion__notion-fetch`.
2. Re-dispatch the specialist once the tool is available. Specialists know the Wiki/Tasks schema; raw MCP calls don't.
3. WebFetch as last resort for public pages.

A subagent's "unavailable" reply is never terminal — the question is *how* to hand them the tool, not whether to use them.

## When NOT to use this skill

- Simple one-line fixes where the contract is self-evident (typo, import cleanup, lint nit)
- Exploratory prototyping (throwaway work)
- The conversation already ran `engineering:context` earlier in the session and the scope hasn't changed (freshness check would return "all four sources fresh" → skip the whole thing)

## Callers

This skill is designed to be invoked by other engineering skills before they do substantive work:

- `engineering:code-review` — before dispatching reviewers
- `tdd` — before writing the first failing test
- `engineering:prd` / `:spec` / `:breakdown` / `:groom` — before drafting
- `fix` / `triage` — before investigating
- `test-writer` agent — ideally the caller runs this first and passes the returned block into the agent's prompt

Each caller should invoke with the mode that matches their downstream work.
