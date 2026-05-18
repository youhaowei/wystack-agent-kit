---
name: code-review
description: "Run a multi-agent static code review with parallel expert reviewers and configured work-item/doc context. Use when the user asks to review code, review a branch, review changes, check regressions, or get feedback before merge. Also invoked by `engineering:full-review` and `engineering:finish-task`."
---
# Code Review

Static review from multiple expert perspectives. No code written or executed — findings only.

`$ARGUMENTS` — empty (current branch vs the base branch), a PR URL, or file paths.

Run the pipeline in order; each stage gates the next.

1. **Scope.** Resolve the base branch — the PR's base, or the repo default (`git symbolic-ref refs/remotes/origin/HEAD`); never assume `main`. `git diff --name-only $(git merge-base HEAD <base>)..HEAD`, classify against the [roster](#specialist-roster) to pick specialists.
2. **PR snapshot.** If a PR URL/number is given or the branch has an open PR, capture `gh pr view --json number,url,title,body,headRefName,baseRefName,changedFiles,additions,deletions,author,reviewDecision,mergeStateStatus,statusCheckRollup`. No PR → synthesize the same shape from branch name, commits, diff stats. Feeds the report narrative, not severity.
3. **Context.** Hard gate. Invoke `engineering:engineering-context` (see [Context gathering](#context-gathering)). Skipping this is the #1 cause of false-positive reviews. Pass the returned block **verbatim** to every reviewer — not paraphrased.
4. **Preflight.** Spawn the installed `preflight` skill or equivalent (typecheck/lint/test). Any fail → stop; reviewing broken code produces findings about breakage, not design.
5. **Parallel reviews.** Single message, all reviewers — each gets the PR snapshot, changed files, branch, base, the verbatim context block, and the [reviewer brief](#reviewer-brief). Alongside the Claude subagent reviewers, invoke `engineering:ccg` (`diff` type) for alt-model perspective — same-model reviewers share blind spots. ccg is advisory; if alt-model CLIs are unavailable it returns `unavailable` — note the gap, continue.
6. **Dedup + triage.** Orchestrator re-classifies reviewer severities into **MUST** / **SUGGEST** per [SEVERITY.md](SEVERITY.md). Apply the near-term-trigger test before recommending tickets.
7. **Report.** Delegate to `engineering:present` using [REPORT-FORMAT.md](REPORT-FORMAT.md). Single message — lead with the recommendation, decision needed, PR read (summary, architecture, risk, verification), then findings. Not a chronological work log.
8. **Execute** the action the user picks from the report — surface the choice (Fix inline / Discuss + fix / Discuss only / Skip) and wait for it; never pick on their behalf. For test changes, apply the strategic test gate in `docs/testing-philosophy.md` first — delegate to `test-writer` or a `tdd` skill only when the test protects a spec contract, regression, hidden edge case, or boundary; pass the anchor explicitly.

Reviewers hunt findings with maximum recall. **The orchestrator owns triage, severity translation, filing discipline, and round termination** — don't bake scope filters into reviewer prompts.

## Specialist roster

Composition scales with change type:

| Change type | Reviewers |
|---|---|
| Features, refactors, architectural work | `code-reviewer` + `engineering:principal` + `engineering:qa` + domain specialists |
| Bug fixes (scoped, observed bug) | `code-reviewer` + `engineering:qa` |
| Polish, docs, comments | `code-reviewer` alone |
| Security-sensitive | Full composition + run reviews twice (LLM sampling insurance) |

**Domain specialists** are project-configured. Read the workspace's `agents.specialists` from `storage.json` — each entry declares a `name`, a `domain`, and a `brief` path. Pick the specialists whose `domain` matches the changed files; multiple join when the diff spans domains, none if `principal` already covers the only domain touched. A specialist runs as a general-purpose reviewer spawned with its brief as the role prompt — the universal roles (`principal`, `qa`) are subagents, specialists are brief-driven. With no specialists configured, `principal` carries the domain perspective alone.

`engineering:ccg` runs as an alt-model reviewer on every composition (when alt-model CLIs are present) — not a Claude subagent, doesn't replace one. The orchestrator triages its Codex + Gemini findings alongside the rest.

## Context gathering

Before invoking `engineering:engineering-context`, extract every ticket ID from the branch name and last ~20 commit messages (case-insensitive): `task-{id}` / `task/{id}` / `task_{id}`; `{PROJECT}-{id}` (2–6 letter prefix + dash + digits); bare leading digits `{id}-{slug}`; path-style `feat/{id}-*`, `fix/{id}-*`, `{user}/{id}-*`.

Invoke: `engineering:engineering-context "<branch-name> <id1> <id2> ..." review`. If a ticket ID was found, instruct context that task-manager MUST be dispatched with that ID — title-only freshness is unreliable.

If engineering-context reports gaps (no PRD, unresolved open questions affecting the diff), pause and ask the user before dispatching reviewers. If the skill is unavailable, gather the same block manually from ticket/spec links and label it fallback context — never reach step 5 with no context block.

## Reviewer brief

Each reviewer gets: changed files, branch, base; the PR snapshot; the step-3 context block verbatim; the output format from [REPORT-FORMAT.md](REPORT-FORMAT.md); and:

- **Spec-grounding** — check each finding against Non-Goals and Decisions; if the behavior matches a stated Non-Goal or Decision, don't flag it. Only flag divergence from the stated decision.
- **Strategic testing** — apply `docs/testing-philosophy.md`: recommend tests only for hidden edge cases, spec contracts, regressions, or boundaries; flag waste tests that only encode current code shape. Missing-test findings need the same gate. A fix that requires modifying an existing test is a signal — that test may have encoded the bug; check its spec anchor first.
- **Ship verdict** — a required closing section weighing severity × ship-worthiness in the reviewer's own voice. Without it, finding-bias accumulates faster than it converges.
- **Insight** — one short paragraph before findings: what the branch does architecturally, which boundary/contract it touches, the strongest pattern or concern. Raw material for the report's PR narrative, not a substitute for findings.

Reviewers keep their native severity labels (Critical/High/…) as input signal — the orchestrator re-classifies at step 6. Don't force reviewers to pre-triage; it reduces recall.

## Codex compatibility

Reviewer role names (`code-reviewer`, `principal`, a domain specialist, …) belong in the prompt, not the transport. In Codex, spawn a generic subagent (`explorer` for read-only analysis) with the role brief — universal roles from `engineering/agents/*.md`, specialists from their configured `agents.specialists` brief path — or the nearest installed standalone skill. Don't claim plugin parity unless engineering skills are actually exposed; if `engineering:engineering-context` is unavailable, say so and fall back.

## Reference

- [SEVERITY.md](SEVERITY.md) — MUST/SUGGEST model + near-term-trigger test. Shared with `engineering:full-review`.
- [REPORT-FORMAT.md](REPORT-FORMAT.md) — reviewer output spec + final report template.

## Edge cases

- **No changes / preflight fails** → stop.
- **Reviewer fails** → continue, note the gap.
- **ccg unavailable** → continue with Claude reviewers; note the missing alt-model perspective.
- **No open PR** → still include a PR Summary, labeled "No open PR found", from branch/commits/diff.
- **No ticket/PRD/spec** → stop, ask the user for URLs; don't review without spec context.
- **Spec has open questions** → label findings "Spec Open Q" — design input, not bugs.
- **Zero MUST + all reviewers SHIP** → recommend merge; SUGGEST items don't force another round.
- **Mixed verdicts** → lead the report with the BLOCK arguments; the disagreement is the signal.
- **Multi-round / convergence** — when iterating toward clean, follow `docs/review-loop.md`: round structure, the zero-MUST gate, scope-drift signal, round budget, stall handling.
- **100+ findings** → top 10 by severity, offer the full list.
