---
name: code-review
description: "Run a multi-agent static code review with parallel expert reviewers and Notion ticket context. Use when the user asks to review code, review a branch, review changes, check regressions, or get feedback before merge. Also invoked by `engineering:full-review` and `engineering:finish`."
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

Static review from multiple expert perspectives. No code written or executed — findings only.

Run the pipeline in order. Each stage gates the next.

1. **Scope.** `git diff --name-only $(git merge-base HEAD main)..HEAD`. Classify against the [roster](#specialist-roster) to pick specialists.
2. **PR snapshot.** If a PR URL/number is provided or the branch has an open PR, capture `gh pr view --json number,url,title,body,headRefName,baseRefName,changedFiles,additions,deletions,author,reviewDecision,mergeStateStatus,statusCheckRollup`. If no PR exists, synthesize the same shape from branch name, commits, and diff stats. This snapshot feeds the report narrative, not severity.
3. **Context.** Hard gate. Invoke `engineering:engineering-context` (see [Context gathering](#context-gathering) for ticket-ID extraction). Skipping this is the #1 cause of false-positive reviews. Pass the returned block **verbatim** to every reviewer in step 5 — not paraphrased.
4. **Preflight.** Spawn the `preflight` skill. Any fail → stop. Reviewing broken code produces findings about breakage, not design.
5. **Parallel reviews.** Single message, all reviewers. Each gets: PR snapshot, changed files, branch, base, the verbatim context block, and the [reviewer brief](#reviewer-brief) (output format + spec-grounding rule + ship-verdict requirement).
6. **Dedup + triage.** Orchestrator's job — re-classify reviewer severities into **MUST** / **SUGGEST** per [SEVERITY.md](SEVERITY.md). Apply the near-term-trigger test before recommending tickets.
7. **Report** via the `collaborate` skill using the template in [REPORT-FORMAT.md](REPORT-FORMAT.md). Single message — don't drip-feed findings. Lead with the recommendation, decision needed, informative PR read (summary, architecture, risk, verification), then findings. Do not produce a chronological work log.
8. **Execute** per user's chosen action (Fix inline / Discuss + fix / Discuss only / Skip). When a fix needs new or updated tests, apply the strategic test gate in `docs/testing-philosophy.md` first. Only delegate to `test-writer` or invoke `tdd` when the test protects a spec contract, regression, hidden edge case, or system boundary; pass the anchor explicitly.

Reviewers hunt for findings with maximum recall. **This skill (the orchestrator) owns triage, severity translation, filing discipline, and round termination.** Don't bake scope filters into reviewer prompts.

</what-to-do>

<supporting-info>

## Reference

- [SEVERITY.md](SEVERITY.md) — MUST/SUGGEST model and the near-term-trigger test. Shared with `engineering:full-review`.
- [REPORT-FORMAT.md](REPORT-FORMAT.md) — reviewer output spec + final report template.

## Pipeline

```
Scope → PR snapshot → Context → Preflight → Parallel reviews → Dedup → Walk-through
```

## Specialist roster

Composition scales with change type:

| Change type | Reviewers |
|---|---|
| Features, refactors, architectural work | `code-reviewer` + `engineering:principal` + `engineering:qa` + specialists from roster |
| Bug fixes (scoped, observed bug) | `code-reviewer` + `engineering:qa` |
| Polish, docs, comment updates | `code-reviewer` alone |
| Security-sensitive | Full comp + run R1 twice (LLM sampling insurance) |

Specialists by domain:

| Agent | Domain | Triggers |
|---|---|---|
| `engineering:ui-engineer` | Design system, React | `.tsx`, `packages/client/**` |
| `engineering:stack-engineer` | DB, server, reactivity | `packages/server/**`, `packages/client/**` |
| `engineering:dx-engineer` | Runtime, CLI, logging | `packages/runtime/**`, CLI, codegen |
| `engineering:devops` | CI/CD, releases | Dockerfile, `.github/**`, deploy configs |

Multiple specialists join when the diff spans domains. Skip if `principal` already covers the only domain touched.

## Context gathering

Before invoking `engineering:engineering-context`, extract every ticket ID from the branch name and last ~20 commit messages. Match (case-insensitive):

- `task-{id}` / `task/{id}` / `task_{id}`
- `{PROJECT}-{id}` (`WS-123`, `ENG-456`) — any 2–6 letter prefix + dash + digits
- Bare leading digits: `{id}-{slug}` or `{id}_{slug}`
- Path-style prefixes: `feat/{id}-*`, `fix/{id}-*`, `eng/{id}-*`, `{user}/{id}-*`

Pass branch name AND every extracted ID as `$ARGUMENTS` plus the mode:

```
engineering:engineering-context "<branch-name> <id1> <id2> ..." review
```

If a ticket ID was found, instruct context that task-manager MUST be dispatched with that ID even if the freshness check thinks the ticket is already loaded — title-only freshness is unreliable.

If the engineering-context skill reports gaps (no PRD found, unresolved open questions affecting the diff), pause and ask the user before dispatching reviewers. If the skill is unavailable in the harness, gather the same block manually from ticket/spec links and label it as fallback context — never proceed to step 5 with no context block.

## Reviewer brief

Each reviewer gets:

- Changed file list, branch, base.
- PR snapshot: title/body if present, diff stats, review/check state.
- The context block from step 3, verbatim.
- Spec-grounding instruction: _"Before flagging a finding, check it against Non-Goals and Decisions. If the behavior matches a stated Non-Goal or Decision, do not flag it — only flag if the implementation diverges from the stated decision."_
- The output format from [REPORT-FORMAT.md](REPORT-FORMAT.md).
- A required ship-verdict closing section (also in REPORT-FORMAT.md). The argument forces reviewers to weigh severity × ship-worthiness in their own voice — without it, finding-bias accumulates faster than it converges.
- Strategic testing instruction: _"Default to no new tests. Apply `docs/testing-philosophy.md`: recommend tests only for hidden edge cases, spec contracts, regressions, or system boundaries. Flag waste tests that only prove existence, glue, UI rendering details, or implementation shape."_

Reviewers should also return one short **Insight** paragraph before findings: what this branch appears to be doing architecturally, which boundary or contract it touches, and the strongest positive pattern or concern. This is not a substitute for findings; it gives the orchestrator raw material for the report's PR narrative.

**QA strategic-test rule (mandatory).** For every test in the diff, the QA reviewer asks _"does this assert a spec contract, real regression, hidden edge case, or system boundary — or just how the current code happens to be shaped?"_ Tests that only encode current behavior become load-bearing for bugs. Flag any test that would pass a different-but-spec-compliant implementation. Test names should reference the spec anchor or bug class (`"US-5: dedup by name returns existing"`, `"Decision #8: stale = mtime > indexedAt"`, `"regression: empty import does not create phantom table"`).

Missing-test findings need the same gate. Do not ask for tests just because code changed. Ask only when the untested behavior has a concrete bug class that type checking, linting, review, or runtime verification would not catch cheaply.

When a fix requires modifying an existing test, that's a signal — the test may have been encoding the bug. Check the test's spec anchor before assuming the test is correct and the fix is wrong.

**Reviewers keep using their native severity labels (Critical/High/etc.) as input signal.** The orchestrator re-classifies into MUST/SUGGEST during step 6. Don't force reviewers to pre-triage — it reduces recall.

## Codex compatibility

This workflow runs in both Claude-style harnesses and Codex.

- Keep `code-reviewer`, `principal`, `ui-engineer`, `dx-engineer` etc. as canonical reviewer role names — the role name belongs in the prompt, not the transport.
- In Codex, only generic subagent execution types are guaranteed (`default`, `explorer`, `worker`). Spawn a generic subagent and pass the role brief from `engineering/agents/*.md`, or use the closest installed standalone skill (`code-reviewer`, `principal-engineer`, `qa`).
- Prefer `explorer` for read-only analysis. Do not pass unsupported custom `agent_type` strings just to mirror a role name.
- Do not claim plugin parity unless the session actually exposes engineering plugin skills. If `engineering:engineering-context` is unavailable, say so and continue with the best compatible fallback.

## Input

`$ARGUMENTS` — empty (current branch vs main), PR URL, or file paths.

## Edge cases

- **No changes** → stop.
- **Preflight fails** → stop, report.
- **Reviewer fails** → continue, note gap.
- **No open PR** → still include a PR Summary section, labeled "No open PR found"; summarize from branch, commits, and diff.
- **Zero MUST + all reviewers SHIP** → loop terminates; recommend merge. SUGGEST items don't force another round.
- **Mixed verdicts** → lead the report with the BLOCK arguments; the disagreement itself is the signal.
- **Multi-round convergence** — round-agnostic. LLM reviewers sample; a later-round finding is valid on merit, not filtered by round number.
- **Soft round budget** — 2-3 rounds for well-scoped work. If round 5+ still surfaces MUSTs, stop and triage: scope too broad? requirements unclear? reviewer disagreement on "correct"?
- **Scope drift signal** — if round N surfaces MUSTs inside round N-1's fixes, the earlier fix was out of scope. File the finding as a separate ticket, don't pile more fixes onto the branch.
- **100+ findings** → top 10 by severity, offer full list.
- **No ticket/PRD/Spec** → stop, ask user for URLs. Don't proceed without spec.
- **Spec has open questions** → label findings "Spec Open Q", treat as design input not bugs.

</supporting-info>
