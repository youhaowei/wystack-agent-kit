---
name: perspective
description: "Gather independent second opinions from configured agents, teammate briefs, or external tools, then synthesize convergence and divergence. Use to pressure-test a question, decision, artifact, diff, strategy, or open judgment call. Advisory only — never a binding verdict."
---
# Perspective

Bring in independent minds, then synthesize what they reveal. The value is not any one provider — it's independent reasoning that exposes convergence, divergence, and blind spots. Don't hardcode model brands, paid CLIs, or a fixed reviewer count; the workspace decides which providers exist.

Perspective is extension-aware: configured extensions participate through `docs/extension-contract.md` (`observe.records` for existing external claims, `execute.action` for bounded review actions, `transform.normalize` for native-payload conversion). The skill owns invocation — extensions never run by implicit hooks.

## 1. Identify target and intent

Infer the intent from context; honor a narrower one if the caller gives it. If the target is trivial or mechanical, skip perspective.

| Intent | Target | Perspectives look for |
|---|---|---|
| **ask** | Open question or judgment call | Reasoned answer, premise challenges, missing facts |
| **decision** | Proposed approach or competing options | Trade-offs, simpler paths, hidden coupling, reversibility |
| **review** | Diff, doc, PRD, spec, or plan | Bugs, contradictions, regressions, gaps, missing cases |
| **red-team** | Finished design, plan, or strategy | Failure modes, unstated assumptions, scope creep |
| **strategy** | Work plan or orchestration choice | Sequencing risk, dependency shape, cheaper alternatives |
| **product-read** | Product artifact or UX direction | User value, workflow fit, unclear promises, edge cases |

## 2. Resolve providers

Resolution order: (1) invocation-specified provider or intent filter; (2) project perspective config; (3) global perspective config; (4) safe internal perspectives in the current runtime.

| Kind | Meaning |
|---|---|
| **internal-agent** | Built-in subagent or local role prompt in the current runtime |
| **agent-teammate** | A named project/team role brief used as an independent reviewer |
| **external-cli** | A configured command such as a model CLI, editor agent, or review tool |
| **configured-tool** | Any project-specific read-only command or connector |
| **extension** | A configured Agent Kit extension with `observe.records` / `execute.action` |
| **human-delegated** | A placeholder for a requested human read; record as pending, don't fake it |

External commands and extensions must be explicitly configured and enabled. Never auto-discover and run paid, profile-dependent, or mutating tools just because they're on PATH. If no providers are available, return `unavailable` and stop — never substitute a single self-review.

## 3. Compose provider prompts

One prompt per provider, shaped to the intent: name the target by path/URL, state the intent and the provider's angle, include any caller-supplied context block verbatim, ask it to be specific and push back if the premise is wrong, and bound length so synthesis stays tractable. Give providers different angles when it widens coverage (correctness / product-fit / maintainability) — but don't invent stances that don't match the task.

## 4. Dispatch safely

Run read-only providers in parallel where supported. Internal agents get no write scope unless the caller explicitly asks for later implementation; external CLIs/tools/extensions run in read-only/advisory mode unless the caller requested a bounded action the policy allows; human-delegated perspectives are recorded as pending. If a provider errors or times out, report it and synthesize from what returned — never silently drop one.

## 5. Synthesize

- **Convergence** — points multiple perspectives raised independently. High confidence; lead here.
- **Divergence** — points only one raised, or where they disagree. Flag as a decision, not a vote.
- **Own read** — add what the perspectives missed; disagree explicitly where warranted.
- **Recommended next step** — what the caller should do with the signal.

Don't average opinions into mush. A sharp minority finding can be the useful one; a majority view can rest on the wrong premise. Delivered when invoked directly; returned to the caller as a subroutine.

## 6. Return a state

| State | Meaning |
|---|---|
| **`pass`** | No material concerns from available perspectives. |
| **`findings`** | Material issues or disagreements surfaced. |
| **`unavailable`** | No configured or safe providers were available. |

## Advisory contract

Perspective is advisory, never a gate. The caller decides what to do with the signal and must handle all three states. `pass` is not a guarantee; `findings` is not a veto. If the user proceeds despite findings, record the override and move on.

## Record the outcome

Inside a workflow that keeps calibration data, append one entry per run: target, intent, providers used, state, and whether findings were acted on or overridden. Extension output asserting a problem is recorded as a `claim`, not a `fact`, unless the extension is authoritative for that fact type. Prefer the record namespace `.wystack/perspective/`; treat a legacy `.wystack/ccg/` as migration evidence, not a delete. No calibration record → skip silently.
