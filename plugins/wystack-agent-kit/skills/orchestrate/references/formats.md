# Orchestrate — Formats

Templates for the cockpit's recurring outputs. Kept out of `SKILL.md` to keep the workflow tight.

## Survey — cockpit open

Brief, scannable, under ~12 lines. End with an open question.

```
## {Project} — Cockpit

In flight:
- TASK-{id}: {title} — {status} (PR #{n})

Next up:
- TASK-{id}: {title} ({priority}, {size}) — {dependency note}

Branch: {branch} ({clean/dirty})
{one-line note on anything notable}

What's the focus?
```

## Dispatch gate — Execute

Before dispatching an execution agent, confirm with the user:

```
## TASK-{id}: {title} — {size}
Plan: {one-line plan summary}
Scope: {declared file globs}
PR must carry: {verification — red→green, gates}
→ [Dispatch] [Refine plan] [Skip]
```

## Merge gate — Execute

When an agent's PR is reviewed (by its own `finish-task`) and ready:

```
## PR #{n}: {title} — {branch} → {base}  ({size})
Scope: {declared globs — diff stayed inside? yes/no}
Review: {finish-task verdict — clean / findings fixed}
Verification: red→green {present/missing}
Merge readiness: READY / BLOCKED
→ [Approve & merge] [Request changes] [Defer]
```

The user approves every merge — the cockpit never merges autonomously.

## Session summary — wrap-up

```
## Session Summary
| Task | Size | PR | Status |
|---|---|---|---|
| TASK-{id}: {title} | M | #{n} | Merged |
| TASK-{id}: {title} | S | #{n} | Deferred |
```
