---
name: full-review
description: "Run a comprehensive pre-merge review that combines code review, QA verification, and product assessment. Use when the user asks for a ship check, merge readiness review, full review, or thorough pre-PR validation. Also invoked by `engineering:finish` as the final gate."
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

The complete pre-merge assessment. Three lenses, run together, that catch the gap between _"code works"_ and _"feature ships correctly"_:

- **Code review** — is the code well-written? (`engineering:code-review`)
- **QA** — does it meet requirements? (`qa`)
- **Product** — does it deliver user value? (`engineering:pm`)

Code review and QA run in parallel. PM runs after — it benefits from knowing what was already found.

`$ARGUMENTS` —

- **Empty** — full review of current branch vs base.
- **Work-item URL/path** — full review against a specific task.
- **`--code-only`** — skip QA and PM, just run `engineering:code-review`.

## Pipeline

1. **Resolve ticket.** Detect from branch name (`task-{id}-*`) or use the provided work-item URL/path. Use the configured provider adapter to fetch title, ACs, scope, plan, user stories. If no ticket found, ask the user for a URL/path or requirements description — full review without requirements context is too weak (QA can't verify ACs, PM can't assess user value).

2. **Build review context.** Invoke `engineering:engineering-context` with mode `review`. Pass the returned block **verbatim** to all three lenses so they evaluate the same requirements, decisions, non-goals, and edge cases. If the skill is unavailable, assemble the equivalent block manually and label it as fallback context.

3. **PR snapshot.** If a PR URL/number is provided or the branch has an open PR, capture title/body/URL, base/head, diff stats, review decision, merge state, and check state. If no PR exists, synthesize this from branch, commits, and diff. The unified report must compare PR intent to actual diff and requirements.

4. **Code review + QA (parallel).** Launch both in a single message:
   - `engineering:code-review` — pass PR snapshot, ticket context, review-context block, changed files. Returns PR summary, architectural insight, deduplicated findings, and severity.
   - `qa` — pass ticket context, the same context block, and `docs/testing-philosophy.md`. Returns requirements checklist (PASS/FAIL/UNTESTED), strategic test gaps or waste tests, edge cases by severity, runtime verification results.

5. **PM review (sequential).** Spawn `engineering:pm` with:
   - PR snapshot.
   - Ticket context (ACs, user stories, scope).
   - Review-context block from step 2.
   - Changed files list.
   - Summary of code-review and QA findings (so PM doesn't re-flag code issues).
   PM focuses on: does the implementation deliver the user value? Would a user understand this feature? Scope creep / scope gaps. Product edge cases engineers wouldn't think of (permissions, onboarding, empty states, error messaging). PM returns findings in the same severity format.

6. **Unified report.** Merge all findings into one report, triaged using [SEVERITY.md](../code-review/SEVERITY.md) — MUST / SUGGEST / PATTERNS. Use the [unified report template](REPORT-FORMAT.md) — single message, copy/paste-able into another session. Lead with the recommendation, decision needed, PR summary, current state by boundary, requirement fit, architectural insight, product/UX impact, and verification evidence. Do not produce a chronological work log.

7. **Action selection.** Present options after the report only when the best next action is not obvious or the user asked for options. Otherwise, make one recommendation and ask one concrete approval question if approval is required.

   - **Fix inline** — auto-fix all MUSTs in this session; SUGGESTs go to inline comments / KB.
   - **Fix MUSTs only** — fix MUST findings + failed ACs only, then merge.
   - **Discuss + fix** — walk through one-by-one, fix as we go.
   - **Discuss only** — review findings, decide what to do later.
   - **Skip + merge** — acknowledge findings, proceed to merge.

8. **Execute the chosen action.**
   - **Fix inline / Fix MUSTs only**: generate fixes → apply via Edit → re-run preflight → show diff for user review → on green, proceed to `engineering:finish`.
   - **Discuss + fix**: walk findings one at a time (same shape as `engineering:code-review` discuss mode); after walkthrough, proceed to `engineering:finish`.
   - **Discuss only**: walk findings without fixing.
   - **Skip + merge**: proceed to `engineering:finish`; include acknowledged findings in the PR description.

</what-to-do>

<supporting-info>

## Reference

- [SEVERITY.md](../code-review/SEVERITY.md) — MUST/SUGGEST model. Shared with `engineering:code-review`.
- [REPORT-FORMAT.md](REPORT-FORMAT.md) — unified report template.

## Integration with `engineering:finish`

When `engineering:finish` calls this skill:

- Any MUST finding or failed AC blocks the merge by default.
- User can override with acknowledgment.
- The finish skill uses merge readiness from the unified report to decide whether to proceed.

## Codex compatibility

- `engineering:code-review` is a workflow, not proof that named reviewer agent types exist in the current session.
- In Codex, use generic subagents plus role briefs from `engineering/agents/*.md`, or the nearest installed standalone skills. Don't assume direct support for names like `principal` or `pm`.
- Preserve Claude-facing role names in prompts and reports. The Codex compatibility layer changes execution mechanics, not the engineering reviewer roster.
- If the engineering plugin is not actually loaded in the current session, say so explicitly and run a best-effort equivalent pipeline.

## Edge cases

- **No ticket** — warn; run code review at full strength; QA and PM operate in reduced mode (no ACs to check against).
- **`--code-only`** — skip QA and PM. Useful for quick feedback mid-implementation.
- **All passing** — skip triage; report clean and offer to proceed to `engineering:finish`.
- **QA or PM agent fails** — continue with available results, note the gap.
- **No open PR** — include a PR Summary section anyway, labeled "No open PR found"; summarize from branch, commits, diff, and ticket.

</supporting-info>
