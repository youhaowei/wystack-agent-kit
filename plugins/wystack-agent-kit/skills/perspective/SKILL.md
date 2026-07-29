---
name: perspective
description: "Gather independent second opinions from configured agents, teammate briefs, or external tools, then synthesize convergence and divergence. Use to pressure-test a question, decision, artifact, diff, strategy, or open judgment call. Advisory only — never a binding verdict."
---
# Perspective

Bring in independent minds, then synthesize what they reveal. The value is not any one provider — it's independent reasoning that exposes convergence, divergence, and blind spots. Don't hardcode model brands, paid CLIs, or a fixed reviewer count; the workspace decides which providers exist.

`$ARGUMENTS` — the target (question, decision, artifact, diff, plan) and optionally an intent or provider filter.

Extension-aware: configured extensions participate through `docs/extension-contract.md` (`observe.records`, `execute.action`, `transform.normalize`); the skill owns invocation — extensions never run by implicit hooks.

## Workflow

1. **Identify target and intent** — infer from context; honor a narrower caller-supplied intent. Trivial or mechanical target → skip perspective.

   | Intent | Target | Perspectives look for |
   |---|---|---|
   | **ask** | Open question or judgment call | Reasoned answer, premise challenges, missing facts |
   | **decision** | Proposed approach or competing options | Trade-offs, simpler paths, hidden coupling, reversibility |
   | **review** | Diff, doc, PRD, spec, or plan | Bugs, contradictions, regressions, gaps, missing cases |
   | **red-team** | Finished design, plan, or strategy | Failure modes, unstated assumptions, scope creep |
   | **strategy** | Work plan or orchestration choice | Sequencing risk, dependency shape, cheaper alternatives |
   | **product-read** | Product artifact or UX direction | User value, workflow fit, unclear promises, edge cases |

2. **Resolve providers** — in order: invocation-specified provider or intent filter → project perspective config → global perspective config → safe internal perspectives in the current runtime.

   | Kind | Meaning |
   |---|---|
   | **internal-agent** | Built-in subagent or local role prompt in the current runtime |
   | **agent-teammate** | A named project/team role brief used as an independent reviewer |
   | **external-cli** | A configured command such as a model CLI, editor agent, or review tool |
   | **configured-tool** | Any project-specific read-only command or connector |
   | **extension** | A configured Agent Kit extension with `observe.records` / `execute.action` |
   | **human-delegated** | A placeholder for a requested human read; record as pending, don't fake it |

3. **Compose prompts** — one per provider, shaped to the intent: name the target by path/URL, state the intent and the provider's angle, include caller-supplied context verbatim, ask it to be specific and push back if the premise is wrong, bound length so synthesis stays tractable. Different angles when it widens coverage (correctness / product-fit / maintainability) — never invented stances that don't match the task.

4. **Dispatch safely** — read-only providers in parallel where supported; internal agents get no write scope unless the caller asks for later implementation; external CLIs/tools/extensions run read-only/advisory unless the caller requested a bounded action the policy allows; human-delegated reads are recorded as pending. A provider errors or times out → report it and synthesize from what returned, never silently drop one.

5. **Synthesize** — **Convergence** (raised independently by several — high confidence, lead here) · **Divergence** (one raised, or they disagree — flag as a decision, not a vote) · **Own read** (what the perspectives missed; disagree explicitly where warranted) · **Recommended next step**. Don't average opinions into mush — a sharp minority finding can be the useful one; a majority view can rest on a wrong premise.

6. **Return a state** — `pass` (no material concerns) / `findings` (material issues or disagreements) / `unavailable` (no configured or safe providers). Delivered when invoked directly; returned to the caller as a subroutine.

## Rules

- **Advisory, never a gate** — the caller decides and must handle all three states; `pass` is not a guarantee, `findings` is not a veto. The user proceeds despite findings → record the override and move on.
- **Explicitly configured providers only** — never auto-discover and run paid, profile-dependent, or mutating tools just because they're on PATH. No providers → return `unavailable` and stop; never substitute a single self-review.
- **Record the outcome** — inside a workflow that keeps calibration data, append one entry per run: target, intent, providers, state, and whether findings were acted on or overridden. Extension output asserting a problem is a `claim`, not a `fact`, unless the extension is authoritative for that fact type. Namespace `.wystack/perspective/`; a legacy `.wystack/ccg/` is migration evidence, not a delete. No calibration record → skip silently.
