---
name: engineering-context
description: "Gather spec-anchored context for engineering work by delegating to task-manager, wiki-librarian, Explore, and kb in parallel. Use whenever you're about to review, test, fix, plan, or document work that references a ticket, feature, or feature-branch. Invoke this BEFORE reviewers, test-writers, or architects — they produce false-positive findings without Goals, Non-Goals, and Key Decisions in hand. Also use when the user mentions a PRD/Spec URL, a TASK-### ID, or a feature name and you need the surrounding design context before proceeding."
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


<what-to-do>

Return a spec-anchored context block so downstream work (reviews, tests, fixes, breakdowns, design decisions) measures code against intent, not guesswork.

Without this step, reviewers flag intentional design as bugs, test-writers encode implementation as contract, and architects re-litigate decisions that already happened. Run this once upfront; every downstream consumer gets the same framing.

`$ARGUMENTS` —

- Branch name (ticket-ID detection patterns: `task-{id}`, `{PROJECT}-{id}` like `WS-123`/`ENG-456`, bare leading digits, path-style prefixes like `feat/{id}-*`).
- Notion Task URL or `TASK-###` ID.
- Feature/phase name for title-based search.
- Empty → infer from current branch + `git log -20 --oneline` (commits often carry an ID even when the branch doesn't).

When a ticket ID is detected (from args, branch, or commits), `task-manager` MUST be dispatched with that ID — do not let the freshness check skip on title-match alone.

**Mode** (optional, second arg): `review` | `test` | `plan` | `fix`. Adjusts what `Explore` returns. If omitted, infer; explicit always wins. See [mode auto-detection](#mode-auto-detection) for inference rules.

## Pipeline

`Freshness check → Parallel fetch (4 specialists) → Synthesize → Return structured block`

### 1. Freshness check (do this first)

Scan the current conversation for context already loaded — re-fetching wastes tokens and risks divergent answers. Skip a specialist if the conversation already contains its output.

| Source | Already-loaded signals |
|---|---|
| `task-manager` (ticket) | A `TASK-###` with ACs, a Notion Task URL fetched this session, or the user pasted the ticket body |
| `wiki-librarian` (PRD/Spec) | Text containing `## Goals`, `## Non-Goals`, `Decision #`, user stories like `US-5`, or a Wiki URL fetched |
| `Explore` (repo) | A recent `Explore` agent report, or substantial reads of `CLAUDE.md` / `DESIGN.md` + multiple files in the affected modules |
| `kb` (prior decisions) | Recent `kb search` output, or loaded project memory files beyond `MEMORY.md` |

State what you found inline so the user can override: _"Freshness check: PRD is already in context from the earlier fetch. Skipping wiki-librarian. Dispatching task-manager + Explore + kb."_

When unsure, err toward re-fetching — stale context is worse than one extra subagent call. But don't re-fetch a PRD whose content is visibly in the transcript.

### 2. Parallel dispatch

Launch the not-skipped specialists in a **single message**.

#### a. `engineering:task-manager` → Notion Tasks

Pass:
- Branch name + search patterns (`task-{id}-*`, `feat/{feature}-phase{N}`, `fix/{id}`).
- Relevant commits — commit messages often carry `TASK-###` even when the branch doesn't.
- Explicit request for: ticket title, ID, status, ACs, scope, plan, **and any linked PRD/Spec URLs** (passed through to wiki-librarian).

#### b. `engineering:wiki-librarian` → Notion Wiki

Pass:
- Task's linked PRD/Spec URLs (if known upfront — pass through, don't make it search).
- Feature/phase name for title-search if URLs aren't available.
- Instruction: return **full content** of PRDs/Specs + one hop of Related/Prior-art links. Not summaries — downstream consumers quote from it.

The librarian is the right agent for reads, not just writes — it knows the Wiki schema and finds docs the task-manager can't.

#### c. `Explore` (medium thoroughness) → codebase

Scope based on mode:

| Mode | What Explore should surface |
|---|---|
| `review` | Module boundaries around the changed files, local conventions, relevant `CLAUDE.md`/`DESIGN.md`, tests defining expected behavior |
| `test` | Existing test helpers/factories/fixtures, test conventions in the affected area, what behaviors lack coverage |
| `plan` | Architecture of the area to be changed, extension points, recent churn in the module |
| `fix` | Entry points, error paths, and existing tests around the bug site |

Cap the report at ≤400 words. Reviewers don't need a tour — they need the load-bearing conventions.

#### d. `kb` search → prior decisions (via Bash)

Two passes:

```bash
kb search "<feature-name / task-title keywords>" --ns default --limit 20 --json
kb search "<same keywords>" --ns retro --limit 10 --json
```

Returns memories/edges that captured prior decisions (_"we rejected Redux"_, _"Bun segfaults on `lbug.close()`"_) and retro findings (known bugs in the area). These often explain _"why is the code like this?"_ better than PRDs do.

If `kb` CLI fails (Ollama down, DB issues), note it and continue. Not critical path.

### 3. Synthesize and return

Produce the structured block in [CONTEXT-BLOCK.md](CONTEXT-BLOCK.md). Pass it **verbatim** — do not paraphrase the spec. Downstream reviewers need the exact wording to check findings against.

### 4. Gate

After presenting the block, state back one short confirmation: _"Context captured: {feature name}, Phase {N}, {M} goals / {K} non-goals / {D} decisions. Proceeding to {downstream step}."_

If anything critical is missing — no PRD found and no user-provided fallback, or the spec has open questions that directly affect the downstream work — pause and ask. Don't plow ahead with a shaky foundation; the downstream step will amplify the gap.

## Mode auto-detection

Infer from, in priority order:

1. **The invoking skill.** `engineering:code-review` / `:full-review` → `review`. `tdd` / `test-writer` / `qa` → `test`. `engineering:prd` / `:spec` / `:breakdown` / `:groom` / `:new` / `:start` → `plan`. `fix` / `triage` → `fix`.
2. **Recent tool output.** A fresh `git diff` / changed file list / `gh pr` → `review`. Failing test output, stack traces, error logs → `fix`. Running `bun test` / `vitest` / reading `test/*.ts` files → `test`. Drafting docs with no repo diff → `plan`.
3. **User's latest message verbs.** _"review", "findings", "check this branch"_ → `review`. _"write tests", "coverage"_ → `test`. _"why is this broken", "failing", "regression"_ → `fix`. _"plan", "break down", "estimate", "groom"_ → `plan`.
4. **Ambiguous or no signal** → default to `review`. It's the widest mode; the others are narrower subsets.

State the detection inline so the caller can redirect:

> _"Detected mode: `fix` (signals: recent stack trace, user said 'why is this failing'). Proceeding — reply with a different mode if that's wrong."_

Never silently categorize. If signals disagree (invoking skill says `review` but the conversation reads as a bug hunt), surface that: _"Invoked from code-review but conversation reads like a fix — going with `review` since it's broader; say `fix` if you want the narrower Explore."_ Let the user break the tie once; don't ping on every inference.

</what-to-do>

<supporting-info>

## Reference

- [CONTEXT-BLOCK.md](CONTEXT-BLOCK.md) — the synthesized output template returned in step 3.

## Fallback paths

If `task-manager` or `wiki-librarian` reports _"Notion unavailable"_:

1. Try loading the Notion MCP via `ToolSearch select:mcp__plugin_Notion_notion__notion-fetch`.
2. Re-dispatch the specialist once the tool is available. Specialists know the Wiki/Tasks schema; raw MCP calls don't.
3. `WebFetch` as last resort for public pages.

A subagent's _"unavailable"_ reply is never terminal — the question is *how* to hand them the tool, not whether to use them.

## Skip conditions

- Simple one-line fixes where the contract is self-evident (typo, import cleanup, lint nit).
- Exploratory prototyping (throwaway work).
- The conversation already ran this skill earlier in the session and the scope hasn't changed — the freshness check would return _"all four sources fresh"_ and skip the whole thing anyway.

## Callers

This skill is designed to be invoked by other engineering skills before they do substantive work:

- `engineering:code-review` — before dispatching reviewers.
- `engineering:full-review` — passes the block to `code-review`, `qa`, and `pm` lenses.
- `qa` — before verifying acceptance criteria.
- `tdd` / `test-writer` agent — before writing the first failing test.
- `engineering:prd` / `:spec` / `:breakdown` / `:groom` — before drafting.
- `fix` / `triage` — before investigating.

Each caller invokes with the mode that matches their downstream work.

</supporting-info>
