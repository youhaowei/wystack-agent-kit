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
