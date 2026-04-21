---
name: finish
description: "Finish an engineering task by running the final quality gate, landing the branch, cleaning up, and updating Notion. Use when implementation is done and the user wants to merge, open a PR, keep the branch, or discard the work."
---

# Finish Task

Own the final engineering lifecycle directly: verify, decide landing strategy, execute the git path, clean up, then update Notion.

## Input

Task reference: `$ARGUMENTS`

- **Notion URL** → Use directly
- **Empty** → Detect from current branch name (expects `task-{id}-*` pattern)

## Prerequisites

Load workspace context:

```
Load the installed `notion-workspace` skill or equivalent workspace context for the current harness.
```

## Workflow

### 1. Resolve Task

**If URL provided**: Extract task URL for later Notion updates.

**If empty**: Detect from current branch:
```bash
git branch --show-current
```

If branch matches `task-{id}-*` pattern, extract the task ID and spawn **`notion-researcher`** on a lightweight model tier (for example, Haiku) to search for the task by ID. If no match, ask the user for the Notion URL.

Fetch task details (title, status, URL) via `notion-researcher` if not already known.

### 2. Final Quality Gate

Before any landing action:

1. **Check repository state**
   - If there are uncommitted changes, offer to commit them first
   - If the user declines, warn that landing from a dirty tree is risky
2. **Verify tests**
   - Run the relevant tests or checks for the touched area
   - If tests fail, stop and fix before continuing
3. **Run a review pass**
   - Use `engineering:code-review` or an equivalent review pass for correctness, regressions, and coverage gaps
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

**If keep branch**:
- Preserve the current branch or worktree as-is

**If discard**:
- Require explicit confirmation
- Preserve a brief note about why the work was discarded
- Clean up the branch or worktree only after confirmation

### 5. Map Git Outcome to Notion Status

Based on the final outcome:

| Git Outcome | Notion Status | Rationale |
|---|---|---|
| `merged` | **Done** | Work is on the base branch |
| `pr-created` | **In Review** | Awaiting review |
| `kept` | **In Progress** | Branch preserved, not finished |
| `discarded` | **Not Started** | Work was thrown away |

### 6. Update Notion

Spawn **`notion-writer`** on a lightweight model tier (for example, Haiku) to:

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

### 7. Report and Suggest Next

```
### Task Finished

TASK-{id}: {title}
Status: {old} → {new}
{PR: {url} — if applicable}

Notion updated with completion summary.
```

Use the harness's native question UI:
- **Question**: "What's next?"
- **Header**: "Next"
- **Options**:
  - **Next task** — "Invoke `engineering:next` to pick another task"
  - **Retro** — "Invoke `retro` to review this session's workflow"
  - **Done** — "I'm done for now"

## Edge Cases

- **No branch name match**: Ask the user for the Notion URL directly
- **Multiple tasks in branch name**: Use the first ID found, confirm with user
- **Task already Done**: Warn and ask if they still want to finish it again
- **PR already exists**: Reuse it rather than opening a duplicate
- **Discarded work on a Not Started task**: Don't change status (already Not Started)

## Notes

- This skill is the counterpart to `engineering:start` — one starts the lifecycle, this one finishes it
- `engineering:push-pr` and `engineering:git-cleanup` are supporting tools, but this skill owns the overall finish flow
- The completion summary in Notion creates a permanent record of what was done
- Branch name convention `task-{id}-*` enables automatic task detection
