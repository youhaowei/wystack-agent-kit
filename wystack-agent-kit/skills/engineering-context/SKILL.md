---
name: engineering-context
description: "Gather spec-anchored context for engineering work by delegating to task-manager, wiki-librarian, Explore, and a knowledge-base search in parallel. Use whenever you're about to review, test, fix, plan, or document work that references a ticket, feature, or feature-branch. Invoke this BEFORE reviewers, test-writers, or architects — they produce false-positive findings without Goals, Non-Goals, and Key Decisions in hand. Also use when the user mentions a PRD/Spec URL, a TASK-### ID, or a feature name and you need the surrounding design context before proceeding."
---

# Engineering Context

Return a spec-anchored context block so downstream work (reviews, tests, fixes, breakdowns, design decisions) measures code against intent, not guesswork.

Without this step, reviewers flag intentional design as bugs, test-writers encode implementation as contract, and architects re-litigate decisions that already happened. Run this once upfront; every downstream consumer gets the same framing.

`$ARGUMENTS` —

- Branch name (ticket-ID detection patterns: `task-{id}`, `{PROJECT}-{id}` like `WS-123`/`ENG-456`, bare leading digits, path-style prefixes like `feat/{id}-*`).
- Work-item URL/path or `TASK-###` ID.
- Feature/phase name for title-based search.
- Empty → infer from current branch + `git log -20 --oneline` (commits often carry an ID even when the branch doesn't).

When a ticket ID is detected (from args, branch, or commits), `task-manager` MUST be dispatched with that ID — do not let the freshness check skip on title-match alone.

**Mode** (optional, second arg): `review` | `test` | `plan` | `fix`. Adjusts what `Explore` returns. If omitted, infer; explicit always wins. See [mode auto-detection](#mode-auto-detection) for inference rules.

## Load the constitution

This is the entrance for review and analysis work. Before gathering context, read `docs/constitution.md` (plugin root) — the WyStack Agent's behavioral constitution: a core principle and three tenets every skill operates under. It stays in effect for the rest of the session; this is the runtime delivery point for review-side skills — no skill restates it.

## Pipeline

`Freshness check → Parallel fetch (4 sources) → Synthesize → Return structured block`

### 1. Freshness check (do this first)

Scan the current conversation for context already loaded — re-fetching wastes tokens and risks divergent answers. Skip a source if the conversation already contains its output.

| Source                           | Already-loaded signals                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `task-manager` (ticket)          | A `TASK-###` with ACs, a work-item URL/path fetched this session, or the user pasted the ticket body                        |
| `wiki-librarian` (PRD/Spec/Story) | Text containing `## Goals`, `## Non-Goals`, `Decision #`, a requirement ID like `ST-42`, or a doc URL/path fetched          |
| `Explore` (repo)                 | A recent `Explore` agent report, or substantial reads of `CLAUDE.md` / `DESIGN.md` + multiple files in the affected modules |
| Knowledge base (prior decisions) | Recent knowledge-base search output, or loaded project memory files                                                         |

State what you found inline so the user can override: _"Freshness check: PRD is already in context from the earlier fetch. Skipping wiki-librarian. Dispatching task-manager + Explore + kb."_

When unsure, err toward re-fetching — stale context is worse than one extra subagent call. But don't re-fetch a PRD whose content is visibly in the transcript.

### 2. Parallel dispatch

Launch the not-skipped sub-agents in a **single message**.

#### a. `wystack-agent-kit:task-manager` → configured work items

Pass:

- Branch name + search patterns (`task-{id}-*`, `feat/{feature}-phase{N}`, `fix/{id}`).
- Relevant commits — commit messages often carry `TASK-###` even when the branch doesn't.
- Explicit request for: ticket title, ID, status, ACs, scope, plan, **and any linked PRD/Spec URLs** (passed through to wiki-librarian).

#### b. `wystack-agent-kit:wiki-librarian` → configured work docs

Pass:

- Task's linked PRD/Spec/Story URLs (if known upfront — pass through, don't make it search).
- Feature/phase name for title-search if URLs aren't available.
- Instruction: return **full content** of PRDs/Specs + Stories (when `storyHome = docs`, stories are docs here; when `storyHome = tasks`, stories arrive via task-manager) + one hop of Related/Prior-art links. Not summaries — downstream consumers quote from it. **Always resolve the glossary terms the changed area uses** — the docs cite `[[term-slug]]`; return those notes so the canonical definitions travel with the context (a reviewer measuring code against intent needs the term meanings, not a guess). A term used in the code or docs with no glossary note is a coverage gap — flag it. When `adr` is enabled (`docs.types`), also pull ADRs the spec links via `expands:` as part of that one hop — they carry the contested-decision rationale the spec one-liner compresses, the context that stops a reviewer re-litigating a settled call.

The librarian is the right agent for reads, not just writes — it knows the doc-store schema and finds docs the task-manager can't.

#### c. `Explore` (medium thoroughness) → codebase

Scope based on mode:

| Mode     | What Explore should surface                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `review` | Module boundaries around the changed files, local conventions, relevant `CLAUDE.md`/`DESIGN.md`, tests defining expected behavior |
| `test`   | Existing test helpers/factories/fixtures, test conventions in the affected area, what behaviors lack coverage                     |
| `plan`   | Architecture of the area to be changed, extension points, recent churn in the module                                              |
| `fix`    | Entry points, error paths, and existing tests around the bug site                                                                 |

Cap the report at ≤400 words. Reviewers don't need a tour — they need the load-bearing conventions.

#### d. Knowledge-base search → prior decisions (via Bash)

If the project has a knowledge-base CLI, search it for prior decisions and retro findings — two passes, one general and one over retrospective records. With the `kb` CLI this is:

```bash
kb search "<feature-name / task-title keywords>" --ns default --limit 20 --json
kb search "<same keywords>" --ns retro --limit 10 --json
```

It returns memories that captured prior decisions (_"we rejected Redux"_) and retro findings (known bugs in the area). These often explain _"why is the code like this?"_ better than PRDs do.

If there is no knowledge-base CLI, or it fails, note it and continue. Not critical path.

### 3. Synthesize and return

Produce the structured block in [CONTEXT-BLOCK.md](CONTEXT-BLOCK.md). Pass it **verbatim** — do not paraphrase the spec. Downstream reviewers need the exact wording to check findings against.

### 4. Gate

After presenting the block, state back one short confirmation: _"Context captured: {feature name}, Phase {N}, {M} goals / {K} non-goals / {D} decisions. Proceeding to {downstream step}."_

If anything critical is missing — no PRD found and no user-provided fallback, or the spec has open questions that directly affect the downstream work — pause and ask. Don't plow ahead with a shaky foundation; the downstream step will amplify the gap.

## Mode auto-detection

Infer from, in priority order:

1. **The invoking skill.** `wystack-agent-kit:code-review` / `:full-review` → `review`. `tdd` / `test-writer` / `qa` → `test`. `wystack-agent-kit:prd` / `:spec` / `:breakdown` / `:groom` / `:new-task` / `:start-task` → `plan`. `fix` / `triage` → `fix`.
2. **Recent tool output.** A fresh `git diff` / changed-file list / output from a `prView` capability invocation → `review`. Failing test output, stack traces, error logs → `fix`. Running `bun test` / `vitest` / reading `test/*.ts` files → `test`. Drafting docs with no repo diff → `plan`.
3. **User's latest message verbs.** _"review", "findings", "check this branch"_ → `review`. _"write tests", "coverage"_ → `test`. _"why is this broken", "failing", "regression"_ → `fix`. _"plan", "break down", "estimate", "groom"_ → `plan`.
4. **Ambiguous or no signal** → default to `review`. It's the widest mode; the others are narrower subsets.

State the detection inline so the caller can redirect:

> _"Detected mode: `fix` (signals: recent stack trace, user said 'why is this failing'). Proceeding — reply with a different mode if that's wrong."_

Never silently categorize. If signals disagree (invoking skill says `review` but the conversation reads as a bug hunt), surface that: _"Invoked from code-review but conversation reads like a fix — going with `review` since it's broader; say `fix` if you want the narrower Explore."_ Let the user break the tie once; don't ping on every inference.

## Reference

- [CONTEXT-BLOCK.md](CONTEXT-BLOCK.md) — the synthesized output template returned in step 3.

## Fallback paths

If `task-manager` or `wiki-librarian` reports the configured provider is unavailable:

1. Check the workspace's `storage.json` and any `adapters/<provider>.md` instructions.
2. Re-dispatch the sub-agent once the tool is available. These sub-agents know the doc-store and task schemas; raw MCP calls don't.
3. `WebFetch` as last resort for public pages.

A subagent's _"unavailable"_ reply is never terminal — the question is _how_ to hand them the tool, not whether to use them.

## Skip conditions

- Simple one-line fixes where the contract is self-evident (typo, import cleanup, lint nit).
- Exploratory prototyping (throwaway work).
- The conversation already ran this skill earlier in the session and the scope hasn't changed — the freshness check would return _"all four sources fresh"_ and skip the whole thing anyway.
