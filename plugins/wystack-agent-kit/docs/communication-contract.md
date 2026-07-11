# Communication Contract

How every agent and skill in this plugin shapes its output and picks the format it's delivered in.

## Principle

Every output should reduce the user's cognitive load while preserving the information they need to learn from the work and make important decisions.

## Rules

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and the decisions needed from the user.
- Explain the *why* behind non-obvious work; keep process logs out of the main narrative.
- Group by workflow meaning — by ownership boundary (repo, package, submodule, feature, user impact), not by which tool or extension produced the record, and not by the order commands happened.
- Ask one concrete question when a user decision is required, and mark the recommended option. Don't dump a loose option list — every choice the agent surfaces names a default.
- Prefer compact state/evidence/next-action tables for handoffs.

## Format selection

A result is either a **summary** (informational) or a **question** (a decision the reader owes back). Each has its own ladder. Pick by stakes × size × user preference (read from this thread's expressed wishes). Climb only as far as the result earns — a heavier format than it needs is itself cognitive load.

**Summaries** — deliver an informational result.

| Rung | Use when | Cost to reader |
|---|---|---|
| **Inline** | Fits in a few screens, won't be revisited | Lowest — it's the reply |
| **Markdown doc** | Substantial, will be revisited or edited, lives in the repo | Medium — a file to open |
| **HTML report** | Many sections, comparisons, navigation carries the content | Medium — but scannable, sticky TOC |

**Questions** — deliver a decision the reader must make.

| Rung | Use when | Cost to reader |
|---|---|---|
| **Inline question** | One quick decision, conversational, no enumeration needed | Lowest — just reply |
| **`AskUserQuestion`** | 1–4 discrete mutually-exclusive options, structured pick | Low — labelled options, recommendation first |
| **Interactive HTML** | Decision space too rich for 1–4 options: many parameters, branching, exploration | Medium — open and manipulate |

**Name the format and why.** State which rung you picked and why — the choice is the work, the walk is not optional. Inline is the lightest option in either kind, not the default landing: a substantial, decision-bearing result earns a doc, a tool question, or an interactive page — never an inline wall.

- MD vs HTML is per-artifact judgment: HTML when navigation / scanning / comparison tables carry the content; MD when it's prose that will be edited.
- `AskUserQuestion` vs Interactive HTML is per-decision judgment: the tool when the choice reduces cleanly to ≤4 mutually-exclusive options; an interactive page when it doesn't.

## Markdown doc

Decision-first: a one-line status + headline at the top, then sections. Tables over prose for any comparison. Keep it the canonical copy; if an HTML render also exists, the MD is the source of truth.

## HTML report

There is **no bundled template** — the style belongs to the project and the person, and it evolves by example. Don't impose a house look.

1. **Match what exists.** Look for an earlier HTML report in this project (the workspace, `docs/`, prior renders). If one exists, mirror its style — the project already has a voice.
2. **Otherwise build to the principles**, and that render becomes the project's reference for next time:
   - Lead with the decision — a status line and a one-sentence headline above the fold.
   - Scannable — sections, comparison tables, callouts for what matters most.
   - Navigable when long — a table of contents; drop it when the report is short.
   - Comfortable — respects `prefers-color-scheme`, readable measure, restrained color.
3. **One source of truth.** When an HTML report renders a markdown doc, the MD is canonical — regenerate the HTML when the MD changes; never let them silently diverge.

The reader's experience is the point, not a fixed skin. A person's and a project's taste accrues across reports — let it.

## Interactive HTML

A self-contained HTML file the reader opens and manipulates to compose their answer — forms, toggles, branching paths, sliders. Used when the decision space exceeds what `AskUserQuestion`'s discrete options can carry.

- One file, no build step, no external services.
- The interface poses the decision; the reader returns their answer through the conversation.
- Same principles as the HTML report: match what exists, lead with the decision, scannable, comfortable.

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
