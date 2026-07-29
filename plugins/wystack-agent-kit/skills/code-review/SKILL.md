---
name: code-review
description: "Run a multi-angle static code review with parallel lens reviewers, the universal principal and qa roles, and configured work-item/doc context. Tunable effort (low/medium/high/ultra) trades recall vs precision; optional --comment posts findings inline on the PR; optional --fix applies MUSTs to the working tree. Use when the user asks to review code, review a branch, review changes, check regressions, or get feedback before merge. Also invoked by `wystack-agent-kit:full-review` and `wystack-agent-kit:finish-task`."
---

# Code Review

Static review from multiple perspectives: a panel of **lenses** (each a scoped *what-question* reviewer) plus the universal `wystack-agent-kit:principal` (architectural read) and `wystack-agent-kit:qa` (correctness) roles, with `perspective` and extensions as advisory reviewers — all grounded by the per-directory + root CLAUDE.md the skill collects. Findings only by default; optional flags post findings to the PR or apply MUSTs to the working tree.

`$ARGUMENTS` — positional then flags. Positional: empty (current branch vs the base branch), a PR URL/number, or file paths. Flags:

- `--effort=<low|medium|high|ultra>` — recall vs precision dial; default `medium`. See [Effort dial](#effort-dial).
- `--lens=<list>` — comma-separated lens names to override auto-selection (e.g. `--lens=security,correctness`). See [Lens roster](#lens-roster).
- `--comment` — post each in-diff MUST as an inline PR comment after the report. `--comment=all` also posts in-diff SUGGESTs. **Out-of-diff findings are never posted** — they land on lines the PR did not modify and read as noise; they stay in the chat report and durable record. No-op if no open PR.
- `--fix` — after the report, skip the action menu and apply MUSTs to the working tree (test-edits still gated by `docs/testing-philosophy.md`). `--fix=all` also applies SUGGESTs. Findings persist before any edit.

Run the pipeline in order; each stage gates the next.

0. **Eligibility.** Cheap precheck on the **standard** tier before any heavy work. If the target is a PR/MR, bail when it is closed, merged, draft, an automated bot bump (Dependabot, Renovate, version-only), already reviewed by this skill on this `diff_sha` (check the configured record store when present), or trivially small with no behavioral change (lockfile-only, copy-only, regenerated-snapshot-only). On bail, surface a one-line reason and stop; the user can override with an explicit re-run. No PR target → skip the gate; local branch reviews always proceed.
1. **Scope.** Resolve the base branch — the PR's base, or the repo default (`git symbolic-ref refs/remotes/origin/HEAD`); never assume `main`. `git diff --name-only $(git merge-base HEAD <base>)..HEAD` to enumerate touched paths. Best-effort load `wystack-agent-kit:workspace` — its presence gates the [record](#record) write, never the review. Also enumerate **CLAUDE.md paths** — walk every ancestor directory of every touched file, deduplicated, up to and including the repo root (`light` tier, paths only, existing ones only). This list is the **primary domain-context mechanism** passed to reviewers as the local rule source.
2. **PR snapshot.** If a PR/MR URL or number is given, or the branch has an open one, capture metadata via the workspace's `prView` capability — number, url, title, body, head/base refs, changed-files count, additions, deletions, author, review decision, merge-state status, status-check rollup. The capability resolves to the host's CLI (`docs/storage-contract.md`). When `prView` is unavailable (`cli: manual`, no host CLI, network failure), synthesize the same shape from branch name, commits, diff stats. Feeds the report narrative, not severity.
3. **Context.** Hard gate. Invoke `wystack-agent-kit:engineering-context` (see [Context gathering](#context-gathering)); skipping it is the #1 cause of false-positive reviews. Pass the returned block **verbatim** to every reviewer.
4. **Preflight.** Run the configured preflight checks from `storage.json` (`quality.preflight`) when a workspace is loaded; otherwise the smallest read-only baseline the repo already has (typecheck/lint/test). Any fail → stop; reviewing broken code produces findings about breakage, not design.
5. **Parallel reviews.** Single message, all reviewers spawn together per the [review composition](#review-composition):
   - **Lens reviewers** — one per lens selected by [effort](#effort-dial) or `--lens`, each scoped to its single question per the [Lens roster](#lens-roster).
   - **Universal roles** — `wystack-agent-kit:principal` (architectural read) and `wystack-agent-kit:qa` (correctness) as the [composition](#review-composition) dictates by change type.
   - **Perspective** — `wystack-agent-kit:perspective` with `review` intent when configured providers exist, unless effort is `low`.
   - **Extensions** — query enabled extensions that participate in `review` and support `observe.records` for the diff; normalize per `docs/extension-contract.md`.

   Each reviewer gets the PR snapshot, changed files, branch, base, the verbatim context block, its typed role, and the [reviewer brief](#reviewer-brief). At `ultra`, lens reviewers run **twice** with cross-comparison (see [Effort dial](#effort-dial)). External output (perspective, extensions) enters triage as claims, not facts. If providers/extensions are unavailable, note the gap and continue.
6. **Dedup + triage.** Orchestrator partitions findings by **Scope** first, applying the effort's **confidence floor** to both buckets (see [Effort dial](#effort-dial)):
   - **In-diff findings** → re-classified into **MUST** / **SUGGEST** per [SEVERITY.md](SEVERITY.md). These are the merge-gate findings; each carries a do-now vs. defer recommendation.
   - **Out-of-diff findings** → separate **Out-of-diff** bucket. Not merge-gating (the user did not modify those lines) but tracked so latent bugs in adjacent code aren't lost. Persist at step 8 with `scope: "out-of-diff"` so retro/audit can see what was deferred.

   Recommendations only: a follow-up ticket is filed at step 9 on the user's explicit pick, never here.
7. **Report.** Deliver per [REPORT-FORMAT.md](REPORT-FORMAT.md). Single message — lead with the recommendation, decision needed, PR read (summary, architecture, risk, verification), then findings. Append the workspace footer per [Record](#record).
8. **Record.** Write durable state if a workspace is loaded — one finding file per triaged item (`.wystack/findings/<findingId>.json`) plus one immutable pass record (`.wystack/reviews/REV-*.json`) linking `finding_ids`. Skip with a one-line setup suggestion in the report footer if not. See [Record](#record).
9. **Execute** based on flags:
   - **Default (no flag).** Surface the choice (Fix inline / Discuss + fix / Discuss only / Skip) and wait for it; never pick on their behalf.
   - **`--comment`.** Re-run the step-0 eligibility precheck first — PR state can change during a long review. If ineligible now, skip the post with a one-line footer note. Otherwise post each MUST as an inline PR comment per the [Comment format](#comment-format); SUGGEST excluded unless `--comment=all`. The storage contract defines only read capabilities for PR comments (`prCommentsInline`, `prCommentsTop`); the write side falls back to the host CLI directly (`gh pr review --comment` or `gh api …/pulls/{pr}/comments`) as a documented exception until a `prCommentInlineCreate` capability lands in `docs/storage-contract.md`. No-op with a one-line note if no open PR or no host CLI. Doesn't suppress the action menu.
   - **`--fix`.** Skip the menu; apply every MUST as an edit. SUGGEST untouched unless `--fix=all`. Findings must already be recorded (step 8) before any edit. After edits, report which findings were applied vs skipped.
   - Flags compose: `--comment --fix` posts inline first, then applies MUSTs.

   For test changes anywhere in this step, apply the strategic test gate in `docs/testing-philosophy.md` — delegate to `test-writer` or a `tdd` skill only when the test protects a spec contract, regression, hidden edge case, or boundary; pass the anchor explicitly. Skip and report any finding that fails the gate.

Reviewers hunt findings with maximum recall. **The review controller owns triage, severity translation, filing discipline, and round termination** — don't bake scope filters into reviewer prompts.

## Review composition

Composition scales with change type:

| Change type                             | Reviewers                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------- |
| Features, refactors, architectural work | lens panel + `wystack-agent-kit:principal` + `wystack-agent-kit:qa`        |
| Bug fixes (scoped, observed bug)        | lens panel + `wystack-agent-kit:qa`                                        |
| Polish, docs, comments                  | lens panel alone                                                          |
| Security-sensitive                      | Full composition + `ultra` sampling (run reviews twice; LLM sampling insurance) |

The **lens panel** is whichever lenses the [effort dial](#effort-dial) selects (or `--lens` overrides). Don't spawn a separate generic `code-reviewer` on top of the panel — that double-spawns the correctness/simplify questions and contradicts the role-scope clause in the [reviewer brief](#reviewer-brief).

**Advisory reviewers.** `wystack-agent-kit:perspective` and extensions augment the roster, never replace it. Extension participation is explicit — ask which enabled extensions participate in `review` and can `observe.records` for the diff; none runs as an implicit lifecycle hook, and any extension-proposed action (`verify_record`, `apply_fix`) is surfaced as an available action, not auto-invoked. All such output enters triage as claims.

## Lens roster

Lenses are the *what-question* axis. Each lens is a scoped reviewer — one question, high recall on that question, no cross-commentary. Run in parallel with the universal roles at step 5; the review controller triages all output together at step 6.

| Lens          | The question                                                                 | Auto-include trigger                                              |
| ------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| correctness   | Bugs, AC violations, broken invariants, off-by-ones                          | Always (every effort level)                                       |
| simplify      | Dead code, over-abstraction, duplicated logic, premature generality          | Always at medium+                                                 |
| testing       | Spec-grounded test gaps, waste tests encoding current shape, missing regressions | Diff touches test files or shipped behavior at medium+         |
| security      | Auth/authz, injection, secret handling, unsafe deserialization, SSRF/XXE     | Diff touches auth, network, parsing, crypto, env, or user input   |
| performance   | Hot paths, N+1, unnecessary allocations, sync work that should be async      | Diff touches request handlers, loops over collections, DB queries |
| api-contract  | Breaking changes, boundary leaks, undocumented surface changes               | Diff touches public exports, route handlers, schemas, types       |
| docs          | Comments-as-code drift, stale docs, missing rationale on non-obvious calls   | Always at high+                                                   |

**Selection** — `--lens=<list>` overrides entirely. Otherwise the [effort dial](#effort-dial) sets the baseline and auto-include triggers add lenses on top. Each lens runs as a general-purpose reviewer spawned with the lens name as its typed role; the [reviewer brief](#reviewer-brief) carries the scope clause.

## Effort dial

`--effort` trades recall vs precision, coverage vs cost, and single-pass vs sampling-insurance. Default `medium`. Affects step 5 (composition) and step 6 (triage threshold) only.

| Effort           | Lenses                                                       | Perspective | Confidence floor    | Sampling                                  | When                                                                |
| ---------------- | ------------------------------------------------------------ | ----------- | ------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| `low`            | correctness, simplify                                        | off         | ≥ high              | single pass                               | Quick sanity check on a small or low-stakes diff                    |
| `medium` (default) | correctness, simplify, testing + auto-include by diff signal | on if available | ≥ medium       | single pass                               | Standard pre-merge review                                           |
| `high`           | all lenses with any signal + docs                            | on if available | ≥ low (broader recall, may include uncertain) | single pass                | Risky, security-sensitive, or large diffs                           |
| `ultra`          | all lenses unconditionally                                   | on, all configured providers | ≥ low                  | reviewers run **twice**, cross-compared for stability | Pre-release, paid-tier exhaustive review, or LLM-sampling-sensitive verdicts |

**Confidence floor** (step 6): a reviewer-reported `Confidence: low` finding is dropped at `low`/`medium`, surfaced as SUGGEST at `high`, normally at `ultra`. The floor never overrides a `Severity: critical` correctness finding — the low-confidence bug claim still surfaces, labeled "needs verification".

**Sampling at `ultra`** — each reviewer runs twice in parallel; findings in both passes are promoted in confidence, findings in one pass demoted a rung. Security-sensitive changes trigger this implicitly at any effort; `ultra` makes it the rule.

**Reviewer tier per effort** — `low`/`medium` run all reviewers (lens panel + `qa`, not `principal`) on `standard`. `high` escalates `security` and `correctness` lenses to `deep` (false negatives there are most costly); everyone else stays `standard`. `ultra` escalates *all* reviewers to `deep`. `principal` is always `deep` when it runs. See [Model assignment](#model-assignment) and [docs/model-tiers.md](../../docs/model-tiers.md).

**Cost** — surface the effort level in the report header. On `--effort=ultra` for a one-file polish diff, propose `medium` first and wait; effort should match stakes.

**Callers in a convergence loop.** `full-review` and `finish-task` invoke without args → `medium`. The loop (`docs/review-loop.md`) runs *N* rounds, so cost multiplies; callers may drop to `--effort=low` on later rounds once high-signal findings converged, stepping back up to `medium`/`high` for the final pre-merge precision check.

## Context gathering

Before invoking the skill, extract every ticket ID from the branch name and the branch's commit messages (case-insensitive): `task-{id}` / `task/{id}` / `task_{id}`; `{PROJECT}-{id}` (2–6 letter prefix + dash + digits); bare leading digits `{id}-{slug}`; path-style `feat/{id}-*`, `fix/{id}-*`, `{user}/{id}-*`.

Pass `"<branch-name> <id1> <id2> ... review"` as the skill arguments. If a ticket ID was found, instruct context that task-manager MUST be dispatched with that ID — title-only freshness is unreliable.

If engineering-context reports gaps (no PRD, unresolved open questions affecting the diff), pause and ask the user before dispatching reviewers. If the skill is unavailable, gather the same block manually and label it fallback context — never reach step 5 with no context block.

## Reviewer brief

Each reviewer gets: changed files, branch, base; the PR snapshot; the step-3 context block verbatim; the output format from [REPORT-FORMAT.md](REPORT-FORMAT.md); its **typed role** (a lens name from the [Lens roster](#lens-roster)); and:

- **Role scope** — a lens reviewer only flags findings that fit its single question. Cross-scope observations get a one-line note ("seen but out of scope, defer to <other role>"), not a full finding, to avoid double-counting at triage.
- **Diff scope** — every finding records `Scope: in-diff | out-of-diff` per whether the cited line was modified by the PR. Out-of-diff findings are not dropped — they go into a separate bucket (step 6) to capture latent bugs in adjacent code.
- **CLAUDE.md grounding** — read the CLAUDE.md paths passed from step 1; cite the relevant clause in any finding that depends on them. A finding that contradicts CLAUDE.md is high-signal; one that *invokes* CLAUDE.md without quoting it is suspect.
- **False-positive catalog** — do **not** flag any of the following:
  - Pre-existing issues on lines the PR did not modify (these belong to the out-of-diff bucket, not in-diff findings).
  - Issues a linter, typechecker, or compiler would catch (missing imports, type errors, formatting, unused-var). Preflight at step 4 already gates on those; don't double-flag.
  - Pedantic style nits a senior reviewer would not raise, absent a CLAUDE.md rule.
  - Generic "needs more tests" / "needs more docs" without a specific spec-contract, regression, or hidden edge case (testing lens applies the strategic gate; other lenses defer to it).
  - Functional changes that are clearly the *point* of the PR (don't flag "you changed X" as if X is the bug; check whether the change is incorrect).
  - Issues that CLAUDE.md flags but the code explicitly silences (lint-ignore comment, justified deviation noted in spec).
- **Spec-grounding** — check each finding against Non-Goals and Decisions; if the behavior matches a stated Non-Goal or Decision, don't flag it. Only flag divergence.
- **Strategic testing** — apply `docs/testing-philosophy.md`: recommend tests only for hidden edge cases, spec contracts, regressions, or boundaries; flag waste tests that only encode current shape. A fix requiring an existing-test edit is a signal — that test may have encoded the bug; check its spec anchor first.
- **Claims vs facts** — findings are claims until triaged; a claim blocks only after Agent Kit records a local decision or computed fact accepting it as blocking.
- **Ship verdict** — a required closing section weighing severity × ship-worthiness in the reviewer's own voice. Without it, finding-bias accumulates faster than it converges.
- **Insight** — one short paragraph before findings: what the branch does architecturally, which boundary it touches, the strongest pattern or concern. Raw material for the report's PR narrative.

Reviewers keep their native severity labels (Critical/High/…) as input signal — the controller re-classifies at step 6. Don't force reviewers to pre-triage; it reduces recall.

## Comment format

When `--comment` posts a finding to the PR, the body is **short**, not the full report — inline comments live forever in the thread. Per-finding body:

```
<one-line description of the issue> (<source>: "<verbatim quote of the rule>")

<permalink to the code with full sha + L-range>

<one-line recommendation>
```

- **Source** — the most specific rule that fires: `<path>/CLAUDE.md`, `spec: <decision-id>`, `lens: <name>`, or `git history`. Quote a file rule verbatim; never paraphrase.
- **Permalink** — full git sha (not `HEAD`/branch — comments render as static markdown, so `$(git rev-parse HEAD)` won't interpolate) and an `L<start>-L<end>` range with ≥1 line of context each side. Format: `https://<host>/<owner>/<repo>/blob/<full-sha>/<path>#L<start>-L<end>`.
- **Recommendation** — smallest concrete fix in one line, or "needs discussion".

Aggregate header before the per-finding list:

```
### Code review (<effort> effort, <N> findings)
```

Out-of-diff findings are **never** posted as PR comments. On zero MUSTs, post a single line `### Code review — no issues found in the diff (<effort> effort).` — but on zero findings entirely, silent success is fine unless the user opted in. The **full report** ([REPORT-FORMAT.md](REPORT-FORMAT.md)) goes to the chat session, not inline on the PR.

## Model assignment

Match the tier to the work, not to the step number. Tier vocabulary and per-harness mapping are owned by [docs/model-tiers.md](../../docs/model-tiers.md); skills name tiers, never provider models.

- **`light`** — mechanical, no judgment: CLAUDE.md path enumeration (step 1), PR snapshot synthesis from branch/commits when `prView` is unavailable (step 2 fallback).
- **`standard`** — default for everything else: eligibility precheck (step 0) and recheck (step 9 `--comment`), **lens reviewers**, **`qa`**, **`perspective`**.
- **`deep`** — where reasoning is the bottleneck: **`principal`** always; at `--effort=high` the `security` and `correctness` lenses escalate (false negatives most costly there); at `--effort=ultra` all reviewers escalate *and* run the double-sampling pass.

## Harness portability

Reviewers are shared role briefs in `agents/*.md`, not custom Codex agent types. Claude consumes them as native agent definitions; Codex uses its built-in transports (`explorer`, `worker`, `default`) with the role brief injected into the prompt — the reviewer name belongs in the prompt/report, not a claimed custom transport. If `wystack-agent-kit:engineering-context` is unavailable, say so and fall back.

## Record

When `wystack-agent-kit:workspace` resolved a root, write one immutable `review` run-record per pass through the configured `record.write` binding from `storage.json`. If no record-store extension is configured or the write fails, fall back to `.wystack/reviews/REV-{unix-ts}-{short-sha}.json` and record the fallback reason per `docs/run-record.md`.

**Default: persist every triaged finding as project state** — one file per finding under `.wystack/findings/`, evidence-backed and individually triageable; the pass record links `finding_ids` and denormalized counts. Shape, field definitions, write rules: [RECORD-FORMAT.md](RECORD-FORMAT.md).

No workspace → skip the write and append one line to the report footer: _"No workspace record store — review record skipped. Run `wystack-agent-kit:setup-agent-kit` to enable per-pass tracking."_ Once per report.

`wystack-agent-kit:full-review` writes its unified verdict to the same store with `"skill": "full-review"` and merged findings from all lenses. `wystack-agent-kit:finish-task` resume reads the store first, then `.wystack/reviews/`, as evidence of a converged pass on this `diff_sha` (`verdict` + `diff_sha` only — findings are for audit and retro, not the skip gate).

## Edge cases

- **No ticket/PRD/spec** → stop, ask the user for URLs; don't review without spec context.
- **Spec has open questions** → label findings "Spec Open Q" — design input, not bugs.
- **Out-of-diff bucket empty** → omit the section; don't print an empty heading.
- **Reviewer cites a line as in-diff but it isn't** → the controller re-checks against the diff at step 6 and moves it out-of-diff; self-classification is a hint, not authoritative.
- **CLAUDE.md not found** → continue; note absence in the PR Read section.
- **Reviewer fails** → continue, note the gap. At `ultra`, if one sampling pass fails, treat the remaining pass as a `high` single-pass result with degraded confidence.
- **`--lens` names an unknown lens** → ignore it with a one-line note, run the recognized lenses; never fail the review.
- **`--fix` with no MUSTs** → no-op, report says "no MUSTs to apply".
- **No open PR** → still include a PR Summary labeled "No open PR found", from branch/commits/diff.
- **Zero MUST + all reviewers SHIP** → recommend merge; SUGGEST items don't force another round.
- **Mixed verdicts** → lead the report with the BLOCK arguments; the disagreement is the signal.
- **Multi-round / convergence** → follow `docs/review-loop.md`: round structure, zero-MUST gate, scope-drift signal, round budget, stall handling.
- **Overwhelming finding count** → lead with the most severe few, offer the full list.
