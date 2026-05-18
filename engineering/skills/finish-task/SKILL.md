---
name: finish-task
description: "Finish an engineering task by running the final quality gate, landing the branch, cleaning up, and updating the configured work item. Use when implementation is done and the user wants to merge, open a PR, keep the branch, or discard the work."
---
# Finish Task

Own the final lifecycle: verify, apply the landing strategy, execute the git path, shepherd the PR, update the work item.

`$ARGUMENTS` — a work-item URL/path (or empty — detect from the current branch name, expects `task-{id}-*`), and optionally a landing strategy (`merge` | `pr` | `keep`). A caller that has already decided how to land — the orchestrate executor-brief supplies `pr` — passes it here so Step 3 never asks.

**Context-blind.** finish-task never introspects who runs it — an interactive user or a dispatched agent. It consumes inputs and emits a report; whoever holds the user channel (the orchestrate cockpit, or the user's own thread) supplies the inputs and consumes the report. The only thing finish-task asks is a required input that was not supplied — never "who are you".

**Prerequisites.** Load `engineering:workspace`. If the workspace isn't set up, run `engineering:setup-agent-kit` before updating work-item status.

## Workflow

### 1. Resolve task

URL/path given → keep it for later updates. Empty → `git branch --show-current`; if it matches `task-{id}-*`, extract the ID and search the work-item store, else ask the user. Fetch title/status/path via the provider adapter if not known.

### 2. Quality gate — staged convergence

Two fix loops, both run per `docs/review-loop.md` (assess → fix → re-assess until zero MUST). Cheap loop first, so expensive rounds aren't spent on code that still fails basic review. On a resume pass (the branch already has a PR) this gate does not blanket re-run — see Edge cases.

1. **Repo state** — commit any uncommitted changes via the installed `commit` skill before landing; a clean tree is always required, so this is done, not offered.
2. **Loop 1 — code review.** Converge `engineering:code-review` over the diff: review → fix MUSTs and cheap in-scope SUGGESTs → re-review, until zero MUST. Gets the code clean fast.
3. **Loop 2 — full review.** Converge `engineering:full-review` (code review + QA against ACs + PM acceptance + runtime verification): review → fix → re-review, until full-review's verdict is ship. This subsumes runtime verification — no separate `engineering:verify` step.
4. **Create follow-up tickets.** For every SUGGEST either loop deferred (expensive, out-of-scope, or speculative), file a follow-up ticket via `engineering:task-manager` — title, the finding, where it lives, why deferred. Deferred findings never just evaporate.
5. **Record summary inputs** — why the change exists, what changed, verification evidence, the follow-up ticket links.

### 3. Landing strategy

The landing strategy is an **input**, not a question. If `$ARGUMENTS` carried one — a dispatched agent's brief supplies `pr` — use it. If none was supplied, ask the user to pick; this is the one prompt finish-task makes, and only because a required input is absent.

- **Merge locally** — integrate into the base branch now.
- **Open or update PR** — commit, push, open/update the PR.
- **Keep branch** — preserve as-is, stop after status/report.
- **Discard work** — interactive only: requires explicit typed confirmation, so it is never a supplied input — a dispatched brief never carries `discard`.

### 4. Execute

**Merge locally** — update the base branch, merge, re-run tests on the result, then `engineering:cleanup` to remove merged local branches.

**PR** — commit pending work via the installed `commit` skill (don't bundle unrelated changes); push (`git push -u origin <branch>`; if on `main`/`master`, branch first); `gh pr create` with a concise summary, testing notes, follow-ups — or push into the existing PR. Then **Step 5** before status updates.

**Keep branch** — preserve the branch/worktree as-is.

**Discard** — explicit confirmation; preserve a brief note on why; clean up the branch/worktree only after.

Track the outcome as `{merged | pr-created | kept | discarded}` plus branch, base, PR url, and worktree state — Steps 6–8 consume it.

### 5. Shepherd PR — one bounded pass (PR path only)

Drive the PR toward **green CI + comments resolved + approved**. Never `gh pr merge` — humans merge.

This is **one bounded pass**, not a blocking loop. Block on machine latency — CI runs in minutes, so await it. Never block on human latency — reviewers take hours to days. The moment only human-paced waiting remains, exit with the status block. The loop lives in the caller: re-invoking finish-task on a branch that already has a PR resumes straight into another pass (see Edge cases) — dispatched, the orchestrate cockpit re-invokes; interactive, the user does, optionally via `/loop`.

**a) Watch CI** — `gh pr checks {pr} --watch --fail-fast` (machine-paced — fine to await). On failure, classify:

| Class | Action |
|---|---|
| Mechanical (lint, format, type, deterministic test) | Fix, commit, push, await the re-run |
| Flaky (known intermittent) | `gh run rerun <id> --failed`, note in the status block; a *recurring* flake is a setup gap — report it with a fix (quarantine the test, fix the CI config), don't just rerun |
| Logic / behavior failure | Read logs; fix only if the cause is clear and in-scope |
| Infra / external, or cause unclear after one pass | A `needs-human` exit — don't silently rerun |

**b) Pull review state** — `gh pr view {pr} --json reviews,reviewDecision,mergeable,mergeStateStatus`; `gh api .../pulls/{pr}/comments` (inline) and `.../issues/{pr}/comments` (top-level).

**c) Triage every unresolved comment:**

| Class | Action |
|---|---|
| Actionable, clear, in-scope | Fix, commit referencing the comment, push |
| Nit / style in touched code | Fix unless trivially low-value |
| Needs a product/scope decision, or expands scope | A `needs-human` exit; recommend a follow-up ticket |
| Speculative (no observed bug) | Reply with rationale, recommend a follow-up ticket |
| Conflicting reviewer opinions | A `needs-human` exit |

Reply on each addressed thread with a one-line pointer to the fix commit, then re-request review (`gh pr ready {pr}` if draft; `gh pr edit {pr} --add-reviewer`).

**d) Pick the exit** — the pass ends at exactly one, read from `mergeStateStatus` and review state:

| Exit | Condition |
|---|---|
| `ready-to-merge` | `CLEAN` + approved + green |
| `needs-human` | a genuine blocker — `DIRTY` conflict (don't resolve conflicts on a published branch); infra/external CI failure unclear after one pass; a comment needing a product/scope decision; conflicting reviewers; or >3 fix-push commits accumulated on the branch without reaching green + approved |
| `shepherding` | CI handled and comments triaged, but human-paced waiting remains — review pending, or a re-request just sent. Exit now; never wait for a reviewer |

`BEHIND` — run `gh pr update-branch`, await the re-triggered CI, then pick the exit. `UNSTABLE` — treat as a CI failure (step a).

**e) Emit the status block** — always, at whichever exit:

```
### PR Shepherd Status
PR: {url}   State: {ready-to-merge | shepherding | needs-human}
CI: {green | failing: <checks>}
Reviews: {approved by X | changes requested by Y | pending}
Unresolved threads: {count} ({links})   Pass: {n}
{needs-human → Action needed: one line per blocker, with link}
{shepherding → Waiting on: what, and what triggers the next pass}
```

### 6. Map outcome to work-item status

| Outcome | Status role |
|---|---|
| `merged` | **done** |
| `pr-created` (ready-to-merge, shepherding, or needs-human) | **in-review** |
| `kept` | **in-progress** |
| `discarded` | **backlog / not-started** |

Map each role onto the project's configured status vocabulary — never write a literal status the project doesn't use.

### 7. Update work item

Via the provider adapter:

**a) Status** — set to the Step 6 role.

**b) Completion summary** — append to the task page: date, action, branch, base, PR url (if any); a `Changes` section from `git log --oneline {base}..HEAD`; a `Files Changed` section from `git diff --stat {base}..HEAD`. If discarded, instead write a brief note on why.

**c) Calibration record** — write `TASK-{id}.json` to the workspace `calibration/` directory (create it if absent) — the oracle `engineering:retro` reads:

```json
{ "task": "TASK-{id}", "size": "{predicted size}", "source": "live",
  "review_rounds": {count}, "outcome": "{merged|pr-created|kept|discarded}" }
```

`review_rounds` = shepherd passes summed across every finish-task invocation for this task, or the Step 2 gate's rounds for a local merge. If a prior pass already wrote the record, update it in place — accumulate `review_rounds`, set `outcome` to the latest. A `shepherding` exit leaves the record open; a later pass closes it.

### 8. Report

Emit the report and stop — finish-task does not ask what to do next. Report `TASK-{id}: {title}`, status `{old} → {new}`, the PR url and Shepherd State if any. Close with a plain-text recommendation — `Recommended next: next-task` (`engineering:next-task`), `retro` (`engineering:retro`), or, on a `shepherding` state, another shepherd pass. Whoever holds the user channel — the orchestrate cockpit, or the user in this thread — reads the report and drives the next step. No question UI: a recommendation in text routes to a dispatched caller and an interactive user alike.

## Edge cases

- **No branch match** — ask for the work-item URL/path.
- **Task already done** — warn, confirm before finishing again.
- **PR already exists — resume the shepherd.** Re-invoking finish-task on a branch that already has a PR is a resume: skip Step 4's PR creation, run one more Step 5 pass. Step 2's review loops do not blanket re-run — the code was reviewed when the PR was created (Step 2.1 still runs: commit any pending work). New commits since are shepherd fixes: CI fixes are gated by CI, comment fixes are re-reviewed by the human reviewer. Re-run Step 2's code-review only on a shepherd fix judged substantive (altered logic, a shared signature, control flow); escalate to a whole-PR review if it ripples beyond its own scope, or if the branch state is unclear (force-push, unattributable commits). Uncertainty defaults to the safe whole-PR review.
- **Discard on a not-started task** — leave status unchanged.
- **Force-push during shepherd** — avoid unless a reviewer asks; it loses review history.
