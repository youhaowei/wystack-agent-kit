# Swarm Formats

Templates for the launch gate, teammate brief, merge gate, and sprint summary. Kept separate from `SKILL.md` to keep the orchestration loop tight.

## Launch gate

Before spawning an implementer, present the user:

```
## TASK-{id}: {title}
{spec summary — scope, ACs, estimate}
→ [Launch] [Refine spec] [Skip]
```

## Teammate brief

The prompt sent to each implementer teammate:

````markdown
You are a teammate on {project}-sprint. Implement this task, open a PR, report back.

## TASK-{id} — {title}
Work item: {url_or_path}

### Spec
{full work-item content}

### Acceptance Criteria
{ACs}

### Codebase Context
{key files, existing patterns, relevant types}

### Process
1. Read project CLAUDE.md for conventions.
2. Implement. Add tests only after the strategic test gate: hidden edge case, spec contract, regression, or system boundary. Co-locate tests when they are warranted.
3. Run: bun run type-check && bun run lint && bun run test
4. Commit on your worktree branch.
5. Open a PR against master. Do not merge.
6. Message the orchestrator with the PR URL.

### Rules
- Never merge to master — PR only.
- Never mark the work item Done — the orchestrator handles status.
- Don't touch files outside your ticket's scope.
- Don't kill processes on ports 19675, 19676.
- If stuck >10 min, message the orchestrator.

### Visual changes (UI tickets only)
- Prefer E2E/Playwright for user-visible behavior; do not add unit tests for rendering details.
- Before/after screenshots of affected areas, added to PR body under "Visual Changes".
Screenshots are required for reviewer confidence. E2E tests are required only when they protect a real user-flow contract or regression.
````

## Merge gate

Presented after the review loop converges:

```
## PR #{n}: {title}  —  {branch} → master
Review: {code} | QA: {pass/total} ACs | PM: {product}
Merge readiness: READY / BLOCKED
→ [Approve & merge] [Request changes] [Defer]
```

## Sprint summary

Presented when the user calls a wrap:

```
## Sprint Summary
| Task | PR | Status |
|---|---|---|
| TASK-{id}: {title} | #{n} | Done |
| TASK-{id}: {title} | #{n} | Deferred |
```
