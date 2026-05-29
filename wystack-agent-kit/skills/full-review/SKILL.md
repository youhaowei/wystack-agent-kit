---
name: full-review
description: "Run a comprehensive pre-merge assessment combining code review, QA verification, and product acceptance. Use when the user asks for a ship check, merge-readiness review, full review, or thorough pre-PR validation. Read-only — produces a verdict, not fixes. Also invoked by `wystack-agent-kit:finish-task` as its final gate."
---
# Full Review

The complete pre-merge **assessment** — three lenses that catch the gap between _"code works"_ and _"feature ships correctly"_:

- **Code review** — is the code well-written? (`wystack-agent-kit:code-review`)
- **QA** — does it meet requirements, and does it work at runtime? (`wystack-agent-kit:qa`)
- **Product** — does it deliver user value? (`wystack-agent-kit:pm`)

Read-only: full-review *assesses and reports a verdict*. It does not fix code or land branches — that's `wystack-agent-kit:finish-task`, which runs full-review inside its convergence loop (`docs/review-loop.md`).

`$ARGUMENTS` — empty (current branch vs base), a work-item URL/path, or `--code-only` (skip QA and PM).

## Pipeline

1. **Resolve ticket.** Detect from the branch name (`task-{id}-*`) or use the provided work-item URL/path; fetch title, ACs, scope, plan, user stories via the provider adapter. No ticket → ask the user for a URL/path or requirements — full-review without requirements context is too weak (QA can't verify ACs, PM can't assess value).
2. **Build context.** Invoke the `wystack-agent-kit:engineering-context` skill with `review` mode; pass the returned block **verbatim** to all three lenses. If unavailable, assemble the equivalent block manually and label it fallback.
3. **PR snapshot.** Capture the PR (title/body/URL, base/head, diff stats, review/merge/check state) if one exists; else synthesize from branch, commits, diff. The report compares PR intent to actual diff and requirements.
4. **Code review + QA (parallel).** Single message:
   - `wystack-agent-kit:code-review` — PR snapshot, ticket context, context block, changed files. Returns findings + severity + architectural insight.
   - `wystack-agent-kit:qa` — ticket context, the same context block, `docs/testing-philosophy.md`. Returns a requirements checklist (PASS/FAIL/UNTESTED), strategic test gaps or waste tests, edge cases by severity, and runtime verification results.
5. **PM acceptance (sequential).** Spawn `wystack-agent-kit:pm` with the PR snapshot, ticket context, the context block, changed files, and a summary of code-review + QA findings (so PM doesn't re-flag code issues). PM judges: does this deliver the user value? Would a user understand it? Scope creep / gaps. Product edge cases engineers miss (permissions, onboarding, empty states, error messaging). PM returns an accept / reject verdict, findings in the same severity format.
6. **Unified verdict.** Merge all findings into one report, triaged per [SEVERITY.md](../code-review/SEVERITY.md) — MUST / SUGGEST. Deliver per the [report template](REPORT-FORMAT.md). Lead with the **verdict** (ship / block-on-MUSTs / block-on-rejection), the decision needed, PR summary, state by boundary, requirement fit, architectural insight, product/UX impact, verification evidence. Not a chronological log. Append the workspace footer per the [Record section](../code-review/SKILL.md#record) in `code-review`.
7. **Record.** If `wystack-agent-kit:workspace` resolved a root, write finding files + unified pass record per [RECORD-FORMAT.md](../code-review/RECORD-FORMAT.md), with `"skill": "full-review"` and merged `finding_ids` from all lenses. Inner `code-review` and `qa` consults each write their own records when they run — full-review's record sits on top as the unified pass. No workspace → skip; the step 6 report footer carries the single setup-suggestion line. Return the verdict — the caller (`finish-task`, or the user) decides what to do with it.

## Edge cases

- **No ticket** — warn; code review runs at full strength; QA and PM operate reduced (no ACs to check).
- **`--code-only`** — skip QA and PM; a quick mid-implementation read.
- **A lens agent fails** — continue with available results, note the gap.
- **Workspace absent** — inner consults degrade per their own contracts (`code-review` runs with inline specialists, no records); the unified verdict is delivered without persistence; the step 6 footer carries the setup suggestion.
- **No open PR** — include a PR Summary labeled "No open PR found", synthesized from branch/commits/diff.

## Harness portability

Lens agents are shared role briefs in `agents/*.md`, not custom Codex agent types. Claude can consume those files as native agent definitions. Codex uses built-in transports with the role brief injected into the prompt; keep the lens name in the prompt/report instead of claiming a custom transport exists. If engineering skills aren't exposed, say so and run a best-effort equivalent.

## Reference

- [SEVERITY.md](../code-review/SEVERITY.md) — MUST/SUGGEST model. Shared with `wystack-agent-kit:code-review`.
- [REPORT-FORMAT.md](REPORT-FORMAT.md) — unified report template.
- `docs/review-loop.md` — the convergence loop `finish-task` wraps this assessment in.
