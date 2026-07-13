---
name: orchestrate
description: "Project cockpit for multi-ticket batch execution or N-attempt diverge spikes. Enters a persistent conductor mode: survey backlog, dispatch parallel agents per ticket, gate merges. Use ONLY when managing multiple tickets at once, spiking a high-stakes irreversible decision with independent attempts, or holding a standing conversation about a project's direction. NOT for running a single skill (code-review, finish-task, etc.) — those already fan out internally; invoke them directly. For a single routine task use start-task instead."
---
# Orchestrate

The cockpit. A persistent thread where you conduct a project: survey the work, dispatch parallel agents to do it, bring the results back. You decide; the agents labor.

`orchestrate [project]` — project name, or inferred from the working directory.

## Prerequisites

Load `wystack-agent-kit:workspace` (resolves the project, the work-item provider, and the constitution) and `wystack-agent-kit:estimate` (sizes the work — strategy selection reads it).

## The cockpit

You are the conductor — PM and Principal Engineer for this project, strategic and architecture-aware.

- **No code in the cockpit.** It decides and dispatches; it never implements. Even a one-line fix is dispatched.
- **Open with a survey** — in-flight work, what's ready, branch and PR state. Brief, scannable. End with an open question.
- **Decisions live here.** Grooming, planning, scope, merge approval — resolved with the user in the thread. A dispatched agent never has a decision left to make; if it would have to ask, the cockpit didn't finish its job.
- **Maintain the thread** — watch dispatched agents, relay completions and failures, gate results with the user.

## Strategy selection

Read the work; pick the strategy; recommend it to the user, who confirms. Size comes from `wystack-agent-kit:estimate`; reversibility you read off the work itself at selection time.

| The work is… | Strategy |
|---|---|
| Multiple independent items to ship | **Execute** — one agent per item, in parallel |
| One item a single attempt can't be trusted on — irreversible architecture, or XL | **Diverge** — N independent attempts, synthesized |

## Execute

Ship N independent items in parallel.

1. **Pick the items** — `wystack-agent-kit:next-task`; the user selects. Honor dependencies.
2. **Resolve every decision first** — for each item, groom and plan with the user in the cockpit (`wystack-agent-kit:groom`) until nothing is left to decide. The dispatched agent must be decision-free.
3. **Dispatch** — one worktree-isolated agent per item, running the decision-free brief ([references/executor-brief.md](references/executor-brief.md)): run the plan, verify, open a PR. Never merge.
4. **Maintain the thread** — watch agents, relay results. Each PR is reviewed and calibrated by its own `wystack-agent-kit:finish-task` — the cockpit does not re-review. finish-task's shepherd runs one bounded pass per invocation; when an agent reports Shepherd State `shepherding` (CI handled, awaiting human review), the cockpit owns re-invoking a shepherd pass — dispatch one when a review lands or CI completes — until the PR reaches `ready-to-merge` or `needs-human`.
5. **Gate merges** — present each ready PR; the user approves the merge. The cockpit never merges autonomously.

## Diverge

One item, N independent attempts — when a single attempt is too risky to trust.

1. **Frame one brief** — goal, constraints, acceptance criteria, context. Every attempt receives it verbatim. A vague brief multiplies vagueness; resolve it first.
2. **Pick N and the variation** — independence is the experiment. Vary the model (default), assign opposing stances, or run spec vs spike. See [references/diverge.md](references/diverge.md).
3. **Dispatch N independent attempts** — none sees another. Each writes its artifact to the workspace `artifacts/diverge/<slug>/`.
4. **Synthesize** — convergence (every attempt agreed — near-settled), divergence (attempts differed — a real decision), and a recommended consolidated approach. Advisory, not a verdict.
5. **Per-decision review** — present each divergence point with the recommendation; the user decides each. Convergence is shown for awareness.

## References

- [references/executor-brief.md](references/executor-brief.md) — the decision-free brief a dispatched execution agent runs.
- [references/diverge.md](references/diverge.md) — model-spread ladder, spec vs spike modes, storage layout.
- [references/formats.md](references/formats.md) — survey, launch gate, merge gate, sprint summary.
