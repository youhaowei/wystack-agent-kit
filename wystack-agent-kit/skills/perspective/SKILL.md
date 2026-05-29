---
name: perspective
description: "Gather independent second opinions from configured agents, teammate briefs, or external tools, then synthesize convergence and divergence. Use to pressure-test a question, decision, artifact, diff, strategy, or open judgment call. Advisory only — never a binding verdict."
---
# Perspective

Bring in independent minds, then synthesize what they reveal. A perspective can be an internal subagent, a teammate role brief, a configured external CLI, a human handoff placeholder, or a project-specific extension. The value is not any one provider — it is independent reasoning that exposes convergence, divergence, and blind spots.

Do not hardcode model brands, paid CLIs, or a fixed number of reviewers. The workspace decides which providers exist.

Perspective is extension-aware. Configured extensions participate through the
generic contract in `docs/extension-contract.md`: `observe.records` for
existing external claims/facts, `execute.action` for bounded review actions,
and `transform.normalize` when native payloads need conversion. The skill
still owns invocation; extensions do not run by implicit hooks.

## 1. Identify target and intent

Decide the intent from context — don't ask if it is obvious.

| Intent | Target | Perspectives look for |
|---|---|---|
| **ask** | Open question or judgment call | Reasoned answer, premise challenges, missing facts |
| **decision** | Proposed approach or competing options | Trade-offs, simpler paths, hidden coupling, reversibility |
| **review** | Diff, doc, PRD, spec, or plan | Bugs, contradictions, regressions, gaps, missing cases |
| **red-team** | Finished design, plan, or strategy | Failure modes, unstated assumptions, scope creep |
| **strategy** | Work plan or orchestration choice | Sequencing risk, dependency shape, cheaper alternatives |
| **product-read** | Product artifact or UX direction | User value, workflow fit, unclear promises, edge cases |

If the caller provides a narrower intent, honor it. If the target is trivial or mechanical, skip perspective; extra minds add noise.

## 2. Resolve providers

Use simple configuration first, then safe fallbacks.

Resolution order:

1. Invocation-specified provider or intent filter.
2. Project perspective config, if present.
3. Global perspective config, if present.
4. Safe internal perspectives available in the current runtime.

Provider kinds:

| Kind | Meaning |
|---|---|
| **internal-agent** | Built-in subagent or local role prompt available in the current agent runtime |
| **agent-teammate** | A named project/team role brief used as an independent reviewer |
| **external-cli** | A configured command such as a model CLI, editor agent, or review tool |
| **configured-tool** | Any project-specific read-only command or connector |
| **extension** | A configured Agent Kit extension with primitive capabilities such as `observe.records` or `execute.action` |
| **human-delegated** | A placeholder for a requested human/teammate read; record as pending, don't fake it |

External commands and extensions must be explicitly configured and enabled.
Never auto-discover and run paid, profile-dependent, or mutating tools just
because they are on PATH.

If no providers are available, return `unavailable` and stop. Do not substitute a single self-review and call it perspective.

## 3. Compose provider prompts

One prompt per provider, shaped to the intent. Each prompt:

- Names the target by path or URL when possible.
- States the intent and the provider's angle.
- Includes the relevant context block verbatim if a caller supplied one.
- Says "be specific and direct; push back if the premise is wrong."
- Bounds length so synthesis stays tractable.

Give providers different angles when it widens coverage. For example, a `review` pass can ask one provider for correctness, another for product/workflow fit, and another for maintainability. Do not force divergence by making up stances that do not match the task.

## 4. Dispatch safely

Run read-only providers in parallel where the environment supports it.

- Internal agents: spawn with a bounded prompt and no write scope unless the caller explicitly asks for implementation later.
- External CLIs/tools/extensions: use only configured capabilities, in
  read-only/advisory mode unless the caller explicitly requested a bounded
  action and the action policy allows it.
- Human-delegated: record the requested perspective as pending and tell the caller what is missing.

If a provider errors or times out, report it and synthesize from what returned. Never silently drop a provider.

## 5. Synthesize

Produce:

- **Convergence** — points multiple perspectives raised independently. High confidence; lead with these.
- **Divergence** — points only one raised, or where providers disagree. Flag as a decision, not a winner-take-all vote.
- **Own read** — add what the perspectives missed; disagree explicitly where warranted.
- **Recommended next step** — what the caller should do with the signal.

Do not average opinions into mush. A sharp minority finding can still be the useful one; a majority view can still rest on the wrong premise.

When invoked directly by the user, deliver the synthesis; as a subroutine, return the findings to the caller.

## 6. Return a state

Always name one of three states:

| State | Meaning |
|---|---|
| **`pass`** | No material concerns from available perspectives. |
| **`findings`** | Material issues or disagreements surfaced. |
| **`unavailable`** | No configured or safe providers were available. |

## Advisory contract

Perspective is advisory, never a gate.

- The caller decides what to do with the signal.
- A caller must handle all three states.
- `pass` is not a guarantee; `findings` is not a veto.
- Every result is overridable. If the user proceeds despite findings, record the override and move on.

## Record the outcome

When invoked inside a workflow that keeps calibration data, append one entry for the perspective run: target, intent, providers used, state, and whether findings were acted on or overridden. Extension output that asserts a problem is recorded as a `claim`, not a `fact`, unless the extension is explicitly authoritative for that fact type. Over time this measures whether configured perspectives are useful or noise. No calibration record → skip silently.

Prefer the generic perspective record namespace (`.wystack/perspective/`) for new records. If an older workspace has `.wystack/ccg/`, treat it as legacy evidence during migration rather than deleting it.

## When not to use

Trivial or mechanical changes — extra perspectives are noise.
