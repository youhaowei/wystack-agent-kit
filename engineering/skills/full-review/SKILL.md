---
name: full-review
description: "Run a comprehensive pre-merge review that combines code review, QA verification, and product assessment. Use when the user asks for a ship check, merge readiness review, full review, or thorough pre-PR validation. Also invoked by `engineering:finish` as the final gate."
---

# Full Review

The complete pre-merge assessment. Combines three lenses that individually catch different classes of issues:

- **Code review** — is the code well-written? (`engineering:code-review`)
- **QA** — does it meet requirements? (`qa`)
- **Product** — does it deliver user value? (PM agent)

Running all three catches the gap between "code works" and "feature ships
correctly." Each lens operates independently — code review doesn't need QA
results, and vice versa — so the first two run in parallel. PM review runs
after because it benefits from knowing what issues were already found.

## Codex Compatibility

- `engineering:code-review` is a workflow, not proof that named reviewer agent
  types exist in the current session.
- In Codex, use generic subagents plus the role briefs from
  `engineering/agents/*.md`, or the nearest installed standalone skills, rather
  than assuming direct support for names like `principal` or `pm`.
- Preserve the Claude-facing role names in prompts and reports. The Codex
  compatibility layer should change execution mechanics, not the engineering
  reviewer roster.
- If the engineering plugin is not actually loaded in the current session, say
  so explicitly and run a best-effort equivalent review pipeline.

## Input

`$ARGUMENTS`

- **Empty** — full review of current branch vs base
- **Notion URL** — full review against a specific ticket
- **`--code-only`** — skip QA and PM, just run `engineering:code-review`

## Context First

Before dispatching any review lens, invoke `engineering:engineering-context` with mode
`review` when that skill is available in the current harness.

- Pass the returned context block through to `engineering:code-review`.
- Pass the same block to `qa` and PM review so all three lenses evaluate the
  same requirements, decisions, non-goals, and known edge cases.
- If `engineering:engineering-context` is unavailable, assemble the equivalent block
  manually from the ticket/spec links and repo docs, and label it as fallback
  context.

## Pipeline

```
┌─────────────────────┐
│ engineering:engineering-context │
└──────────┬──────────┘
           │
   ┌───────▼────────┐   ┌─────────────┐
   │ engineering:   │   │     qa      │    parallel
   │  code-review   │   └──────┬──────┘
   └────────┬───────┘          │
            └──────────┬───────┘
                       │
               ┌───────▼────────┐
               │   PM review    │    sequential — sees prior findings
               └───────┬────────┘
                       │
               ┌───────▼────────┐
               │ Unified report │
               │   + triage     │
               └────────────────┘
```

### 1. Resolve Ticket

Detect task from branch name (`task-{id}-*`) or use provided Notion URL. Spawn **`notion-researcher`** on a lightweight model tier (for example, Haiku) to fetch title, ACs, scope, plan, user stories. This context feeds all three lenses.

If no ticket found, ask the user for a Notion URL or requirements description. Full review without requirements context is too weak — QA can't verify ACs and PM can't assess user value.

### 2. Build Review Context

Run `engineering:engineering-context` in `review` mode when available and carry its output
forward unchanged. If it is unavailable, build the same block manually and
label it as fallback context.

### 3. Code Review + QA (parallel)

Launch both in parallel:

**`engineering:code-review`** — pass the ticket context, the review-context
block, and changed files. Returns: deduplicated findings with severity.

**`qa`** — pass the ticket context and the same review-context block. Returns:
requirements checklist (PASS/FAIL/UNTESTED), edge cases by severity, runtime
verification results.

### 4. PM Review

Spawn **`engineering:pm`** agent with:
- Ticket context (ACs, user stories, scope)
- Review-context block from step 2
- Changed files list
- Summary of code review findings (so PM doesn't re-flag code issues)
- Summary of QA results (so PM knows what passed/failed)

PM focuses on:
- Does the implementation deliver the user value described in the ticket?
- Would a user understand this feature? Any UX gaps?
- Scope creep — does the code do things the spec didn't ask for?
- Scope gaps — does the spec ask for things the code doesn't do?
- Are there product edge cases engineers wouldn't think of? (permissions, onboarding, empty states, error messaging)

PM returns findings in the same severity format as code review.

### 5. Unified Report

Merge findings from all three lenses into one report, triaged into MUST / SUGGEST / PATTERNS using the orchestrator's severity model (see `engineering:code-review` for the model + bright-line tests).

```
## Full Review — TASK-{id}: {title}

### Status
Code review: {n MUST} / {n SUGGEST} / {n PATTERNS}
QA: {pass}/{total} requirements passed, {n edge cases}
PM: {n product findings}

### MUST (merge gate)
{all MUST findings — code, failed ACs, critical PM gaps; each: file:line, description, source, recommended action}

### SUGGEST (optional)
{all SUGGEST findings; each: file:line, description, source, recommended destination — inline comment, KB, or ticket-if-triggered}

### PATTERNS OBSERVED
{named patterns worth capturing; each: pattern name, location, proposed destination — CLAUDE.md / Spec / KB}

### Requirements Coverage
{PASS/FAIL/UNTESTED table from QA}

### Merge Readiness
{READY if zero MUST, else BLOCKED + list of MUSTs}
```

### 6. Action Selection

Present action options after the unified report:

```
**Actions:**
1. **Fix inline** — auto-fix all MUSTs in this session; SUGGESTs go to inline comments / KB (you review diff before commit)
2. **Fix MUSTs only** — fix MUST findings + failed ACs only, then merge
3. **Discuss + fix** — walk through one-by-one, fix as we go
4. **Discuss only** — review findings, decide what to do later
5. **Skip + merge** — acknowledge findings, proceed to merge
```

The report itself is detailed enough to copy/paste into another session — each finding includes file:line, full description, impact, and suggested fix.

### 6. Execute Action

**Fix inline / Fix blocking**:
1. Generate fixes for applicable findings
2. Apply fixes via Edit tool
3. Re-run preflight to verify fixes don't break anything
4. Present diff summary for user review
5. If preflight passes, proceed to `engineering:finish` for merge

**Discuss + fix**:
Walk through findings one at a time (same as `engineering:code-review` discuss mode). Fix as you go. After walkthrough completes, proceed to `engineering:finish` for merge.

**Discuss only**:
Walk through findings one at a time without fixing. Review and understand. User can return later to fix or proceed with merge.

**Skip + merge**:
Acknowledge findings, proceed to `engineering:finish` for merge. Include acknowledged findings in PR description for visibility.

## Integration with `engineering:finish`

When `engineering:finish` calls this skill:
- Any MUST finding or failed AC blocks the merge by default
- User can override with acknowledgment
- The finish skill uses merge readiness from the unified report to decide whether to proceed

## Edge Cases

- **No ticket**: warn, run code review at full strength, QA and PM operate in reduced mode (no ACs to check against)
- **`--code-only`**: skip QA and PM, run `engineering:code-review` only — useful for quick feedback mid-implementation
- **All passing**: skip triage, report clean and offer to proceed to `engineering:finish`
- **QA or PM agent fails**: continue with available results, note the gap
