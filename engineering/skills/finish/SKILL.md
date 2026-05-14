---
name: finish
description: "Finish an engineering task by running the final quality gate, landing the branch, cleaning up, and updating the configured work item. Use when implementation is done and the user wants to merge, open a PR, keep the branch, or discard the work."
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


# Finish Task

Own the final engineering lifecycle directly: verify, decide landing strategy, execute the git path, clean up, then update the configured work item.

## Input

Task reference: `$ARGUMENTS`

- **Work-item URL/path** → Use directly
- **Empty** → Detect from current branch name (expects `task-{id}-*` pattern)

## Prerequisites

Load workspace context:

```
Load `engineering:workspace`. If `.wystack/storage.json` is missing, run `engineering:setup-agent-kit` before updating work-item status.
```

## Workflow

### 1. Resolve Task

**If URL/path provided**: Keep it for later work-item updates.

**If empty**: Detect from current branch:
```bash
git branch --show-current
```

If branch matches `task-{id}-*` pattern, extract the task ID and search the configured work-item store by ID. If no match, ask the user for the work-item URL/path.

Fetch task details (title, status, URL/path) via the configured provider adapter if not already known.

### 2. Final Quality Gate

Before any landing action:

1. **Check repository state**
   - If there are uncommitted changes, offer to commit them first
   - If the user declines, warn that landing from a dirty tree is risky
2. **Verify tests**
   - Run the relevant tests or checks for the touched area
   - If tests fail, stop and fix before continuing
3. **Run a review pass**
   - Use `engineering:code-review` or an equivalent review pass for correctness, regressions, and strategic coverage gaps
   - Critical/High findings block landing — fix or escalate. Medium/Low may defer, but require an explicit ticket (not just a note); hygiene in touched code defaults to fix.
4. **Record summary inputs**
   - Capture why the change exists, what changed, testing evidence, and any known follow-ups

### 3. Choose Landing Strategy

Present these options:

- **Merge locally** — integrate into the base branch now
- **Open or update PR** — use `engineering:push-pr`
- **Keep branch** — preserve the branch and stop after status/report updates
- **Discard work** — only with explicit typed confirmation

After execution, produce a structured outcome:

```
## Outcome
Action: {merged | pr-created | kept | discarded}
Branch: {branch-name}
Base: {base-branch}
PR: {url or N/A}
Worktree: {cleaned | preserved | N/A}
```

### 4. Execute

**If merge locally**:
- Update the base branch first
- Merge the working branch
- Re-run the relevant tests on the merged result
- Use `engineering:git-cleanup` to safely remove merged local branches afterward

**If PR**:
- Invoke `engineering:push-pr`
- Return the PR URL in the outcome
- Continue to **Step 5: Shepherd PR** before status updates

**If keep branch**:
- Preserve the current branch or worktree as-is

**If discard**:
- Require explicit confirmation
- Preserve a brief note about why the work was discarded
- Clean up the branch or worktree only after confirmation

### 5. Shepherd PR (PR path only)

Goal: drive the PR to **green CI + all comments resolved + approved**, then hand off to a human for merge. Never auto-merge.

Loop until **ready-to-merge** or **human-needed**:

**a) Watch CI**

```bash
gh pr checks {pr-number} --watch --fail-fast
```

On failure, classify:

| Class | Action |
|---|---|
| Mechanical (lint, format, type, deterministic test) | Fix locally, commit, push, restart loop |
| Flaky (known intermittent, passes on rerun) | `gh run rerun <run-id> --failed`, note in handoff |
| Logic / behavior failure | Read logs, attempt fix only if cause is clear and in-scope |
| Infra / external (timeout, registry, env) | Surface to human — do not silently rerun |
| Cause unclear after one investigation pass | Surface to human |

**b) Pull PR review state**

```bash
gh pr view {pr-number} --json reviews,reviewDecision,mergeable,mergeStateStatus
gh api repos/{owner}/{repo}/pulls/{pr-number}/comments        # inline
gh api repos/{owner}/{repo}/issues/{pr-number}/comments       # top-level
```

**c) Triage every unresolved comment**

| Class | Action |
|---|---|
| Actionable + clear + in-scope | Fix, commit referencing the comment, push |
| Nit / style in touched code | Fix unless trivially low-value |
| Question requiring product / scope decision | Surface to human, do not guess |
| Requests scope expansion beyond ticket | Surface to human; recommend a follow-up ticket |
| Speculative ("could this race?", no observed bug) | Reply with rationale, recommend follow-up ticket |
| Conflicting reviewer opinions | Surface to human |

After addressing actionable comments, reply on each thread with a one-line note pointing at the fix commit, then re-request review:

```bash
gh pr ready {pr-number}                               # if draft
gh pr edit {pr-number} --add-reviewer {reviewer}      # re-request if needed
```

**d) Check merge state**

| `mergeStateStatus` | Action |
|---|---|
| `CLEAN` + approved + green | **Ready** — exit loop, hand off |
| `BLOCKED` (missing approvals / required checks) | Continue waiting / addressing |
| `BEHIND` | Update branch from base (`gh pr update-branch`), re-loop |
| `DIRTY` (merge conflict) | Surface to human — do not resolve conflicts unilaterally on a published branch |
| `UNSTABLE` | Treat as CI failure path |

**e) Stall detection**

Surface to human when any of:
- No reviewer activity for >24h after re-request
- Same CI check failed twice with the same root cause after a fix attempt
- More than 3 fix-push cycles without convergence
- Any change required would expand scope beyond the ticket

**f) Handoff**

When **ready-to-merge** or **human-needed**, post a single status block:

```
### PR Shepherd Status

PR: {url}
State: {ready-to-merge | needs-human}
CI: {green | failing: <check-names>}
Reviews: {approved by X | changes requested by Y | pending}
Unresolved threads: {count} ({list with links})
Cycles: {n fix-push iterations}

{If needs-human:}
Action needed: {one line per blocker, with link}
```

Do **not** run `gh pr merge`. Human merges.

### 6. Map Git Outcome to Work-Item Status

Based on the final outcome:

| Git Outcome | Work-item status | Rationale |
|---|---|---|
| `merged` | **Done** | Local merge already on base branch |
| `pr-created` (ready-to-merge) | **In Review** | Green + approved, awaiting human merge |
| `pr-created` (needs-human) | **In Review** | Blocked on human input — note blockers in summary |
| `kept` | **In Progress** | Branch preserved, not finished |
| `discarded` | **Not Started** | Work was thrown away |

### 7. Update Work Item

Use the configured provider adapter to:

**a) Update task status** to the mapped value from Step 3.

**b) Append completion summary** to the task page:

```
## Completion Summary

**Date**: {today}
**Action**: {merged locally | PR created | kept for later | discarded}
**Branch**: `{branch-name}`
**Base**: `{base-branch}`
{**PR**: [{pr-url}]({pr-url}) — if applicable}

### Changes
{summary of commits — use `git log --oneline {base}..HEAD` output}

### Files Changed
{list from `git diff --stat {base}..HEAD`}
```

**If discarded**: Write a brief note explaining why the work was abandoned.

### 8. Report and Suggest Next

```
### Task Finished

TASK-{id}: {title}
Status: {old} → {new}
{PR: {url} — if applicable}

Work item updated with completion summary.
```

Use the harness's native question UI:
- **Question**: "What's next?"
- **Header**: "Next"
- **Options**:
  - **Next task** — "Invoke `engineering:next` to pick another task"
  - **Retro** — "Invoke `retro` to review this session's workflow"
  - **Done** — "I'm done for now"

## Edge Cases

- **No branch name match**: Ask the user for the work-item URL/path directly
- **Multiple tasks in branch name**: Use the first ID found, confirm with user
- **Task already Done**: Warn and ask if they still want to finish it again
- **PR already exists**: Reuse it rather than opening a duplicate
- **Discarded work on a Not Started task**: Don't change status (already Not Started)
- **Shepherd loop divergence**: Reviewer requests scope expansion — propose a follow-up ticket instead of expanding the branch (per "ship through review" / scope discipline)
- **CI green but no reviewer**: After 24h, surface to human; do not self-merge even if all checks pass
- **Force-push during shepherd**: Avoid unless reviewer explicitly asks — preserves review history

## Notes

- This skill is the counterpart to `engineering:start` — one starts the lifecycle, this one finishes it
- `engineering:push-pr` and `engineering:git-cleanup` are supporting tools, but this skill owns the overall finish flow
- The completion summary in the work-item store creates a permanent record of what was done
- Branch name convention `task-{id}-*` enables automatic task detection
