# Communication Contract

How every agent and skill in this plugin shapes its output. This is the *response-shape* layer — it governs how a reply is written, not which artifact format the deliverable takes (that is `engineering:present`).

## Principle

Every output should reduce the user's cognitive load while preserving the information they need to learn from the work and make important decisions.

## Rules

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and the decisions needed from the user.
- Explain the *why* behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary (repo, package, submodule, feature, user impact), not by the order commands happened.
- Ask one concrete question when a user decision is required, and mark the recommended option. Don't dump a loose option list — every choice the agent surfaces names a default.
- Prefer compact state/evidence/next-action tables for handoffs.

## Interactive checkpoints

Some skills have gates that exist to hand control to the user — a question, an
approval, an item-by-item review, a pick between options. At a gate, **stop**:
emit the checkpoint and end the turn.

- A question is a full stop, not a rhetorical aside — don't answer it yourself,
  assume the default, or run the next step in the same turn.
- An item-by-item review advances one item per user confirmation. Never batch
  ahead of the user.
- A "recommended" option marks the agent's advice; it is not pre-approval to
  act on it.
- Silence is not consent. An interrupting or redirecting message overrides any
  pending gate — handle it, don't resume the old track.
- The halt is for *missing* input only. If the answer is already supplied — an
  explicit instruction, a passed input — consume it and continue; don't re-ask
  for ceremony.

Skills that fly through their own checkpoints strip the user of the control the
checkpoint exists to give.

## Default handoff shape

```md
### Recommendation
{ready / blocked / needs decision} — {one-sentence reason}

### Decision Needed
{none / one concrete approval or choice}

### Current State
| Boundary | Status | Evidence | Next action |
|---|---|---|---|
| {repo/package/feature} | {state} | {proof} | {specific next step} |
```

## Scope

Applies to every agent and skill in the plugin. Skills do not restate it — they inherit it. When a skill is ported out of the plugin to a host that lacks this doc, carry the principle with it.
