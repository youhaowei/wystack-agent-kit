---
name: push-pr
description: "Commit, push, and open or update a pull request for the current engineering branch. Use when work is ready for review and the user wants a clean handoff to GitHub."
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


# Push PR

Commit, push, and open or update a PR in one controlled workflow.

## Flow

1. **Check repository state** — branch name, staged changes, unstaged changes, untracked files, upstream status.
2. **Protect mainline** — if on `main` or `master`, ask for a branch name and create it before continuing.
3. **Commit intentionally** — if changes are not committed, use the project's commit conventions. Do not bundle unrelated work.
4. **Push safely** — `git push -u origin <branch>` for a new branch, plain `git push` for an existing upstream.
5. **Open or update PR**:
   - If a PR already exists for the branch, report it and push updates into it.
   - If no PR exists, create one with a concise summary, testing notes, and any known follow-ups.
6. **Return outcome** — branch, upstream, PR URL, and any remaining manual follow-up.

## Rules

- Never push directly to `main` or `master` without explicit user approval
- Never force-push without explicit user approval
- If checks or review are still pending, call that out in the report
