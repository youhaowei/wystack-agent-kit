---
name: code-review
description: "Run a multi-angle static code review with parallel lens reviewers, the universal principal and qa roles, and configured work-item/doc context. Tunable effort (low/medium/high/ultra) trades recall vs precision; optional --comment posts findings inline on the PR; optional --fix applies MUSTs to the working tree. Use when the user asks to review code, review a branch, review changes, check regressions, or get feedback before merge. Also invoked by `wystack-agent-kit:full-review` and `wystack-agent-kit:finish-task`."
---

# Code Review

Static review from multiple expert perspectives: a panel of **lenses** (each a scoped *what-question* reviewer) plus the universal `wystack-agent-kit:principal` (architectural read) and `wystack-agent-kit:qa` (correctness) roles, with `perspective` and extensions as advisory reviewers — all grounded by the per-directory + root CLAUDE.md the skill collects. No code written or executed by default — findings only. Optional flags can post findings to the PR or apply MUSTs to the working tree.

`$ARGUMENTS` — positional then flags. Positional: empty (current branch vs the base branch), a PR URL/number, or file paths. Flags:

- `--effort=<low|medium|high|ultra>` — recall vs precision dial; default `medium`. See [Effort dial](#effort-dial).
- `--lens=<list>` — comma-separated lens names to override auto-selection (e.g. `--lens=security,correctness`). See [Lens roster](#lens-roster).
- `--comment` — post each in-diff MUST as an inline PR comment after the report. `--comment=all` also posts in-diff SUGGESTs. **Out-of-diff findings are never posted** — they are observations on lines the PR did not modify, and posting them adds noise on unrelated code. They still appear in the chat-session report and in the durable record. No-op if no open PR.
- `--fix` — after the report, skip the action menu and apply MUSTs to the working tree (test-edits still gated by `docs/testing-philosophy.md`). `--fix=all` also applies SUGGESTs. Findings persist before any edit.

Run the pipeline in order; each stage gates the next.

0. **Eligibility.** Cheap precheck on the **standard** tier before any heavy work (judgment call — see [Model assignment](#model-assignment)). If the target is a PR/MR, bail when it is closed, merged, draft, an automated bot bump (Dependabot, Renovate, version-only), already reviewed by this skill on this `diff_sha` (check the configured record store when present; skip this sub-check when no workspace is loaded), or trivially small with no behavioral change (lockfile-only, copy-only, regenerated-snapshot-only). On bail, surface a one-line reason and stop. The user can override with an explicit re-run. No PR target → skip the gate; local branch reviews always proceed.
1. **Scope.** Resolve the base branch — the PR's base, or the repo default (`git symbolic-ref refs/remotes/origin/HEAD`); never assume `main`. `git diff --name-only $(git merge-base HEAD <base>)..HEAD` to enumerate the touched paths. Best-effort load `wystack-agent-kit:workspace` — its presence gates the [record](#record) write; the review itself never gates on it. Also enumerate **CLAUDE.md paths** — walk *every ancestor directory* of every touched file, deduplicated, up to and including the repo root (`light` tier, paths only — never contents). For `src/a/b/c.ts` that means checking `src/a/b/CLAUDE.md`, `src/a/CLAUDE.md`, `src/CLAUDE.md`, `CLAUDE.md`, including only the ones that exist. This list is the **primary domain-context mechanism** — it passes to reviewers as the local rule source.
2. **PR snapshot.** If a PR/MR URL or number is given, or the branch has an open one, capture metadata via the workspace's `prView` capability — number, url, title, body, head/base refs, changed-files count, additions, deletions, author, review decision, merge-state status, status-check rollup. The capability resolves to the host's CLI (see `docs/storage-contract.md`). When `prView` is unavailable (`cli: manual`, no host CLI, network failure), synthesize the same shape from branch name, commits, diff stats. Feeds the report narrative, not severity.
3. **Context.** Hard gate. Invoke the `wystack-agent-kit:engineering-context` skill (see [Context gathering](#context-gathering)). Skipping this is the #1 cause of false-positive reviews. Pass the returned block **verbatim** to every reviewer — not paraphrased.
4. **Preflight.** Run the project's configured preflight checks from `storage.json` (`quality.preflight`) when a workspace is loaded; otherwise use the smallest obvious read-only baseline for the repo (for example typecheck/lint/test scripts already present). Any fail → stop; reviewing broken code produces findings about breakage, not design.
5. **Parallel reviews.** Single message, all reviewers spawn together per the [review composition](#review-composition):
   - **Lens reviewers** — one per lens selected by [effort](#effort-dial) (or by `--lens` override). Each scoped to its single question per the [Lens roster](#lens-roster).
   - **Universal roles** — `wystack-agent-kit:principal` (architectural read) and `wystack-agent-kit:qa` (correctness) as the [review composition](#review-composition) dictates by change type.
   - **Perspective** — invoke `wystack-agent-kit:perspective` with `review` intent when configured providers are available, unless effort is `low` (which skips it). Same-runtime reviewers can share blind spots.
   - **Extensions** — query enabled extensions that participate in `review` and support `observe.records` for the current diff; normalize per `docs/extension-contract.md`.

   Each reviewer gets the PR snapshot, changed files, branch, base, the verbatim context block, its typed role (a lens name), and the [reviewer brief](#reviewer-brief). At `ultra` effort, lens reviewers run **twice** with cross-comparison (LLM-sampling insurance, see [Effort dial](#effort-dial)). External review output (perspective, extensions) enters triage as claims, not facts. If providers/extensions are unavailable, note the gap and continue.
6. **Dedup + triage.** Orchestrator partitions findings by **Scope** first:
   - **In-diff findings** → re-classified into **MUST** / **SUGGEST** per [SEVERITY.md](SEVERITY.md), applying the effort's **confidence floor** (findings below the floor are dropped or demoted; see [Effort dial](#effort-dial)). These are the merge-gate findings. Each carries a do-now vs. defer recommendation.
   - **Out-of-diff findings** → separate **Out-of-diff** bucket in the report. Not merge-gating for this PR — the user did not modify those lines — but tracked so latent bugs the reviewer noticed in adjacent code aren't lost. Apply the **same effort confidence floor** as in-diff so `ultra` doesn't dump dozens of low-confidence observations into the bucket. The user can file follow-up tickets on explicit pick; the review controller never auto-files. Persist these alongside in-diff findings at step 8 with a `scope: "out-of-diff"` field so retro/audit can see what was deferred.

   Recommendations only: a follow-up ticket is filed at step 9 on the user's explicit pick, never here.
7. **Report.** Deliver per [REPORT-FORMAT.md](REPORT-FORMAT.md). Single message — lead with the recommendation, decision needed, PR read (summary, architecture, risk, verification), then findings. Not a chronological work log. Append the workspace footer per [Record](#record).
8. **Record.** Write durable state if a workspace is loaded — one finding file per triaged item (`.wystack/findings/<findingId>.json`) plus one immutable pass record (`.wystack/reviews/REV-*.json`) linking `finding_ids`. Skip with a one-line setup suggestion in the report footer if not. See [Record](#record).
9. **Execute** based on flags:
   - **Default (no flag).** Surface the choice (Fix inline / Discuss + fix / Discuss only / Skip) and wait for it; never pick on their behalf.
   - **`--comment`.** Before posting, re-run the step-0 eligibility precheck (`standard` tier — same judgment call) — PR state can change during a long review (merged, closed, marked draft). If ineligible now, skip the post with a one-line note in the report footer. Otherwise post each MUST as an inline PR comment per the [Comment format](#comment-format). Today the storage contract only defines read capabilities for PR comments (`prCommentsInline`, `prCommentsTop`); the write side falls back to the host CLI directly (`gh pr review --comment` or `gh api …/pulls/{pr}/comments`). SUGGEST excluded unless `--comment=all`. No-op with a one-line note if no open PR or no host CLI. Doesn't suppress the action menu. A `prReviewCreate`/`prCommentInlineCreate` capability is a future addition to `docs/storage-contract.md`; until then, the skill carries the CLI invocation as a documented exception.
   - **`--fix`.** Skip the menu; apply every MUST as an edit. SUGGEST untouched unless `--fix=all`. Findings must already be recorded (step 8) before any edit — durable audit comes first. Test changes still gate on `docs/testing-philosophy.md` (see below); skip and report any finding that fails the gate. After edits, report which findings were applied vs skipped.
   - Flags compose: `--comment --fix` posts inline first, then applies MUSTs.

   For test changes anywhere in this step, apply the strategic test gate in `docs/testing-philosophy.md` — delegate to `test-writer` or a `tdd` skill only when the test protects a spec contract, regression, hidden edge case, or boundary; pass the anchor explicitly.

Reviewers hunt findings with maximum recall. **The review controller owns triage, severity translation, filing discipline, and round termination** — don't bake scope filters into reviewer prompts.

## Review composition

Composition scales with change type:

| Change type                             | Reviewers                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------- |
| Features, refactors, architectural work | lens panel + `wystack-agent-kit:principal` + `wystack-agent-kit:qa`        |
| Bug fixes (scoped, observed bug)        | lens panel + `wystack-agent-kit:qa`                                        |
| Polish, docs, comments                  | lens panel alone                                                          |
| Security-sensitive                      | Full composition + `ultra` sampling (run reviews twice; LLM sampling insurance) |

The **lens panel** is whichever lenses the [effort dial](#effort-dial) selects (or `--lens` overrides). It replaces what was historically a single generic `code-reviewer` subagent — lenses ask the same code-quality questions, but scoped and parallelized. Don't spawn a separate `code-reviewer` on top of the lens panel; that double-spawns the correctness/simplify questions and contradicts the role-scope clause in the [reviewer brief](#reviewer-brief).

`wystack-agent-kit:principal` carries the architectural read and `wystack-agent-kit:qa` the correctness read; both run as subagents on the compositions above. Domain context they need comes from the CLAUDE.md paths collected at step 1 (per-directory + root) — the primary local-rule source — passed to every reviewer in the [reviewer brief](#reviewer-brief).

### Advisory reviewers

`wystack-agent-kit:perspective` runs as an advisory reviewer on every composition when configured providers are present. It can use internal agents, teammate briefs, external tools, or configured extensions; it does not replace the main reviewer roster. The review controller triages its claims alongside the rest.

Extension participation is explicit: the skill asks which enabled extensions
participate in `review` and can `observe.records` for the diff. No extension
runs as an implicit lifecycle hook. Any extension-proposed action such as
`verify_record` or `apply_fix` is only surfaced as an available action; the main
agent or user decides whether to invoke it later.

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

**Selection** — `--lens=<list>` overrides auto-selection entirely. Otherwise the [effort dial](#effort-dial) sets the baseline; auto-include triggers add lenses on top.

Each lens runs as a general-purpose reviewer spawned with the lens name as its typed role; the [reviewer brief](#reviewer-brief) carries the scope clause.

## Effort dial

`--effort` trades **recall vs precision**, **coverage vs cost**, and **single-pass vs sampling-insurance**. Default `medium`. Affects step 5 (composition) and step 6 (triage threshold) only — pipeline shape and severity model are unchanged.

| Effort           | Lenses                                                       | Perspective | Confidence floor    | Sampling                                  | When                                                                |
| ---------------- | ------------------------------------------------------------ | ----------- | ------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| `low`            | correctness, simplify                                        | off         | ≥ high              | single pass                               | Quick sanity check on a small or low-stakes diff                    |
| `medium` (default) | correctness, simplify, testing + auto-include by diff signal | on if available | ≥ medium       | single pass                               | Standard pre-merge review                                           |
| `high`           | all lenses with any signal + docs                            | on if available | ≥ low (broader recall, may include uncertain) | single pass                | Risky, security-sensitive, or large diffs                           |
| `ultra`          | all lenses unconditionally                                   | on, all configured providers | ≥ low                  | reviewers run **twice**, cross-compared for stability | Pre-release, paid-tier exhaustive review, or LLM-sampling-sensitive verdicts |

**Confidence floor** is applied at step 6: a reviewer-reported `Confidence: low` finding is dropped at `low`/`medium`, surfaced as SUGGEST at `high`, and surfaced normally at `ultra`. The floor never overrides a `Severity: critical` correctness finding — a low-confidence bug claim still surfaces; it's just labeled "needs verification" in the report.

**Sampling at `ultra`** — each reviewer runs twice in parallel; findings that appear in both passes are promoted in confidence, findings in only one pass are demoted one rung. This is the "LLM sampling insurance" from the [review composition](#review-composition) generalized: security-sensitive changes already trigger it implicitly at any effort level, but `ultra` makes it the rule.

**Reviewer tier per effort** — the effort dial also escalates reviewer tier where it pays off. `low` and `medium` run all reviewers (lens panel + `qa`, except `principal`) on `standard`. `high` escalates the `security` and `correctness` lenses to `deep` because false negatives there are most costly; everyone else stays `standard`. `ultra` escalates *all* reviewers to `deep`. `principal` is always `deep` whenever it runs — its job is the architectural read. See [Model assignment](#model-assignment) and [docs/model-tiers.md](../../docs/model-tiers.md).

**Cost note** — surface the effort level in the report header so the user can see what they paid for. If the user passes `--effort=ultra` on a one-file polish diff, propose `medium` first and wait for confirmation; effort should match the diff's stakes.

**Callers in a convergence loop.** `wystack-agent-kit:full-review` and `wystack-agent-kit:finish-task` invoke this skill without args, so they get `medium` by default. The convergence loop (`docs/review-loop.md`) runs *N* rounds — cost multiplies. Callers iterating toward clean may pass `--effort=low` on later rounds once the high-signal findings have converged; the final round before merge can step back up to `medium` or `high` as a precision check.

## Context gathering

Before invoking the skill, extract every ticket ID from the branch name and last ~20 commit messages (case-insensitive): `task-{id}` / `task/{id}` / `task_{id}`; `{PROJECT}-{id}` (2–6 letter prefix + dash + digits); bare leading digits `{id}-{slug}`; path-style `feat/{id}-*`, `fix/{id}-*`, `{user}/{id}-*`.

Pass `"<branch-name> <id1> <id2> ... review"` as the skill arguments. If a ticket ID was found, instruct context that task-manager MUST be dispatched with that ID — title-only freshness is unreliable.

If engineering-context reports gaps (no PRD, unresolved open questions affecting the diff), pause and ask the user before dispatching reviewers. If the skill is unavailable, gather the same block manually from ticket/spec links and label it fallback context — never reach step 5 with no context block.

## Reviewer brief

Each reviewer gets: changed files, branch, base; the PR snapshot; the step-3 context block verbatim; the output format from [REPORT-FORMAT.md](REPORT-FORMAT.md); its **typed role** (a lens name from the [Lens roster](#lens-roster)); and:

- **Role scope** — a lens reviewer only flags findings that fit its single question. Cross-scope observations get a one-line note ("seen but out of scope, defer to <other role>") rather than a full finding, to avoid double-counting at triage.
- **Diff scope** — every finding records `Scope: in-diff | out-of-diff` based on whether the cited line was modified by the PR. **Out-of-diff findings are not dropped** — they go into a separate bucket (see step 6) so we can still capture latent bugs the reviewer noticed in adjacent code. Flag them, mark them, move on.
- **CLAUDE.md grounding** — the review controller passes a list of CLAUDE.md file paths (root + per-directory for touched paths) collected at step 1. Read those files; cite the relevant clause in any finding that depends on them. A finding that contradicts CLAUDE.md is high-signal; a finding that *invokes* CLAUDE.md without quoting it is suspect.
- **False-positive catalog** — do **not** flag any of the following:
  - Pre-existing issues on lines the PR did not modify (these belong to the out-of-diff bucket, not in-diff findings).
  - Issues a linter, typechecker, or compiler would catch (missing imports, type errors, formatting, unused-var). Preflight at step 4 already gates on those; don't double-flag.
  - Pedantic style nits a senior reviewer would not raise, absent a CLAUDE.md rule.
  - Generic "needs more tests" / "needs more docs" without a specific spec-contract, regression, or hidden edge case (testing lens applies the strategic gate; other lenses defer to it).
  - Functional changes that are clearly the *point* of the PR (don't flag "you changed X" as if X is the bug; check whether the change is incorrect).
  - Issues that CLAUDE.md flags but the code explicitly silences (lint-ignore comment, justified deviation noted in spec).
- **Spec-grounding** — check each finding against Non-Goals and Decisions; if the behavior matches a stated Non-Goal or Decision, don't flag it. Only flag divergence from the stated decision.
- **Strategic testing** — apply `docs/testing-philosophy.md`: recommend tests only for hidden edge cases, spec contracts, regressions, or boundaries; flag waste tests that only encode current code shape. Missing-test findings need the same gate. A fix that requires modifying an existing test is a signal — that test may have encoded the bug; check its spec anchor first.
- **Claims vs facts** — reviewer and extension findings are claims until
  triaged. A claim can block only after Agent Kit records a local decision or
  computed fact that accepts it as blocking.
- **Ship verdict** — a required closing section weighing severity × ship-worthiness in the reviewer's own voice. Without it, finding-bias accumulates faster than it converges.
- **Insight** — one short paragraph before findings: what the branch does architecturally, which boundary/contract it touches, the strongest pattern or concern. Raw material for the report's PR narrative, not a substitute for findings.

Reviewers keep their native severity labels (Critical/High/…) as input signal — the review controller re-classifies at step 6. Don't force reviewers to pre-triage; it reduces recall.

## Comment format

When `--comment` posts a finding to the PR, the body is **short**, not the full report. Brevity matters — inline comments live forever in the PR thread; a wall of prose ages badly.

Per-finding body:

```
<one-line description of the issue> (<source>: "<verbatim quote of the rule>")

<permalink to the code with full sha + L-range>

<one-line recommendation>
```

- **Source** is the most specific rule that fires: `<path>/CLAUDE.md`, `spec: <decision-id>`, `lens: <name>`, or `git history`. Always quote the rule verbatim if it came from a file; never paraphrase.
- **Permalink** uses the full git sha (not `HEAD`, not a branch name) and an `L<start>-L<end>` range with at least one line of context above and below the cited line. Bash interpolation like `$(git rev-parse HEAD)` does not work — comments render as static markdown. Format: `https://<host>/<owner>/<repo>/blob/<full-sha>/<path>#L<start>-L<end>`.
- **Recommendation** is the smallest concrete fix in one line. Skip if no actionable fix exists; say "needs discussion" instead.

Aggregate header before the per-finding list:

```
### Code review (<effort> effort, <N> findings)
```

Out-of-diff findings are **never** posted as PR comments — they would land on lines the PR did not touch and read as noise. They stay in the chat-session report and the durable record only.

If zero MUSTs and `--comment` was passed, post a single line: `### Code review — no issues found in the diff (<effort> effort).` Don't post on `--comment` runs with zero findings and zero MUSTs unless the user explicitly opts in — silent success is fine.

The **full report** (per [REPORT-FORMAT.md](REPORT-FORMAT.md)) still goes to the user's chat session; `--comment` posts the short form to the PR. Don't dump the full report inline on the PR.

## Model assignment

Match the tier to the work, not to the step number. Tier vocabulary and per-harness mapping are owned by [docs/model-tiers.md](../../docs/model-tiers.md); skills name tiers, never provider models.

- **`light`** — mechanical, no judgment: CLAUDE.md path enumeration (step 1), PR snapshot synthesis from branch/commits when `prView` is unavailable (step 2 fallback).
- **`standard`** — default for almost everything else: eligibility precheck (step 0) and recheck (step 9 `--comment`), **lens reviewers**, **`qa`**, **`perspective`**. Sonnet-class models handle these well; reaching higher by default burns cost without lifting quality.
- **`deep`** — reserved for architectural reasoning and the highest-effort runs: **`principal`** always, and at `--effort=high` the `security` and `correctness` lenses also escalate (where false negatives are most costly). At `--effort=ultra` all reviewers escalate to `deep` *and* run the double-sampling pass from the [Effort dial](#effort-dial).

The rule: the lowest tier is for *no-judgment* work; `deep` is for work where reasoning is the bottleneck. Most review at `medium` effort is pattern-matching against established norms — `standard` is enough. See [docs/model-tiers.md](../../docs/model-tiers.md) for the sharp tests that decide tier picks.

## Harness portability

Reviewers are shared role briefs, not custom Codex agent types — universal roles live in `agents/*.md`. Claude can consume those files as native agent definitions. Codex uses its built-in transports (`explorer`, `worker`, `default`) with the role brief injected into the prompt; the reviewer name belongs in the prompt/report, not in a claimed custom transport. Don't claim plugin parity unless engineering skills are actually exposed; if `wystack-agent-kit:engineering-context` is unavailable, say so and fall back.

## Record

When `wystack-agent-kit:workspace` resolved a root, write one immutable
`review` run-record per pass through the configured `record.write` binding from
`storage.json`. If no record-store extension is configured, or the write fails,
fall back to `.wystack/reviews/REV-{unix-ts}-{short-sha}.json` and record the
fallback reason per `docs/run-record.md`.

**Default: persist every triaged finding as project state** (clawpatch model) —
one file per finding under `.wystack/findings/`, evidence-backed, individually
triageable; the pass record links `finding_ids` and denormalized counts. Shape,
field definitions, and write rules: [RECORD-FORMAT.md](RECORD-FORMAT.md).

When no workspace resolved, skip the write and append one line to the report footer: _"No workspace record store — review record skipped. Run `wystack-agent-kit:setup-agent-kit` to enable per-pass tracking."_ Once per report, not per finding.

`wystack-agent-kit:full-review` writes its unified verdict to the same configured
record store with `"skill": "full-review"` and merged findings from all lenses.
`wystack-agent-kit:finish-task` resume reads the configured record store first,
then `.wystack/reviews/`, as evidence of a converged pass on this `diff_sha`
(`verdict` + `diff_sha` only — findings are for audit and retro, not the skip gate).

## Reference

- [SEVERITY.md](SEVERITY.md) — MUST/SUGGEST model + near-term-trigger test. Shared with `wystack-agent-kit:full-review`.
- [REPORT-FORMAT.md](REPORT-FORMAT.md) — reviewer output spec + final report template.
- [RECORD-FORMAT.md](RECORD-FORMAT.md) — durable run-record schema (findings, patterns, verdicts).
- [../../docs/extension-contract.md](../../docs/extension-contract.md) — generic extension record/action contract.

## Edge cases

- **No changes / preflight fails** → stop.
- **Eligibility bail (step 0)** → stop with a one-line reason. User can override with an explicit re-run (e.g. "review this draft anyway").
- **Eligibility recheck before `--comment` flips to ineligible** → keep the report; skip the post; note the reason in the report footer.
- **Out-of-diff bucket empty** → omit the section from the report; no need to print an empty heading.
- **Reviewer cites a line as in-diff but it actually isn't** → review controller re-checks against the diff at step 6 and moves the finding to out-of-diff; reviewer self-classification is a hint, not authoritative.
- **CLAUDE.md not found** → continue without it; reviewers fall back to spec/context block. Note absence in the report's PR Read section.
- **Reviewer fails** → continue, note the gap. At `ultra`, if one of the two sampling passes fails, treat the remaining pass as a `high` single-pass result and note the degraded confidence.
- **Perspective unavailable** → continue with configured reviewers; note the missing independent perspective.
- **Workspace absent** → review proceeds without persistence; record skipped with a single setup-suggestion line in the report footer.
- **`--lens` names an unknown lens** → ignore the unknown name with a one-line note, run the recognized lenses; never fail the review.
- **`--fix` on a test edit that fails the strategic test gate** → skip that finding's edit, keep it in the report as a finding the user must decide on. Don't silently apply.
- **`--fix` with no MUSTs** → no-op, report says "no MUSTs to apply" and proceeds as if the flag were absent.
- **`--comment` with no open PR** → skip with a one-line note in the report footer; report itself is unaffected.
- **`--comment` with no host CLI available** → skip with a one-line note recommending the user install `gh`/`glab` (or the configured host CLI).
- **`--effort=ultra` on a trivial diff** → propose `medium` and wait for confirmation before running; effort should match stakes.
- **No open PR** → still include a PR Summary, labeled "No open PR found", from branch/commits/diff.
- **No ticket/PRD/spec** → stop, ask the user for URLs; don't review without spec context.
- **Spec has open questions** → label findings "Spec Open Q" — design input, not bugs.
- **Zero MUST + all reviewers SHIP** → recommend merge; SUGGEST items don't force another round.
- **Mixed verdicts** → lead the report with the BLOCK arguments; the disagreement is the signal.
- **Multi-round / convergence** — when iterating toward clean, follow `docs/review-loop.md`: round structure, the zero-MUST gate, scope-drift signal, round budget, stall handling.
- **100+ findings** → top 10 by severity, offer the full list.
