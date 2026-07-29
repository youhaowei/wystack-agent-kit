# Model Tiers

WyStack Agent Kit skills run on multiple harnesses (Claude Code, Codex, Grok Build, and any harness that loads agent definitions from `agents/*.md` frontmatter). Provider model classes are equivalent capability labels, not a shared portable vocabulary: Claude uses `haiku` / `sonnet` / `opus`, Codex 5.6 uses `luna` / `terra` / `sol`, and Grok Build currently exposes a smaller ladder (`grok-composer-2.5-fast` / `grok-4.5`). Skills reference **tiers**; this contract owns the mapping to model classes per harness.

Two axes that are easy to confuse but live separately:

- **Tier** — capability of the model spawned for a piece of work. Owned by this document. Three values: `light`, `standard`, `deep`.
- **Effort** — how much review/work runs (number of reviewers, recall vs precision, sampling depth). Owned by individual skills (e.g. `code-review`'s `--effort=low|medium|high|ultra`). A high-effort review still spawns its scaffolding on `light`; a low-effort review still uses `standard` reviewers.

## Tier semantics

| Tier       | When it applies                                                                                     | Cost   |
| ---------- | --------------------------------------------------------------------------------------------------- | ------ |
| `light`    | Mechanical, no judgment required: file/path enumeration, single-grep symbol lookups, format/lint checks, "does X exist", reading one known file, regenerated-output detection, lockfile scans. | Lowest |
| `standard` | Default. Judgment calls that aren't deep reasoning: eligibility checks, classification, codebase exploration, multi-file edits, test writing, log triage, routine implementation, doc updates, PR summary synthesis. | Mid    |
| `deep`     | Reasoning is the bottleneck: architecture decisions, ambiguous design with real trade-offs, principal-level review, debugging where the cause is genuinely unclear, security-sensitive code paths. Not the default for everyday review — see "Reviewer-style agents" below. | Highest |

**Sharp tests** for picking a tier:

- _"Could a regex/grep do this?"_ → `light`.
- _"Does this require weighing options against each other?"_ → `standard` minimum.
- _"Would a senior engineer pause to think for more than 30 seconds?"_ → `deep`.

Reviewer-style agents (read code, write findings) default to `standard` — Sonnet/Terra-class models handle most review well. Bump to `deep` for architectural/principal-level review, security-sensitive diffs, or when an effort dial on the calling skill escalates. QA/verify agents (checking observable behavior against a spec) stay `standard`.

## Per-harness mapping

| Harness            | `light`            | `standard`           | `deep`             |
| ------------------ | ------------------ | -------------------- | ------------------ |
| Claude Code        | `haiku` (e.g. `claude-haiku-4-5`) | `sonnet` (e.g. `claude-sonnet-4-6`) | `opus` (e.g. `claude-opus-4-7`) |
| Codex 5.6          | `luna`             | `terra`              | `sol`              |
| Grok Build         | `grok-composer-2.5-fast` | `grok-4.5` (or inherit parent) | `grok-4.5` |
| Generic (any other LLM API harness) | provider's cheapest reasonable | provider's default | provider's strongest |

The class equivalences are `haiku` = `luna` ≈ `grok-composer-2.5-fast`, `sonnet` = `terra` ≈ `grok-4.5` (standard band), and `opus` = `sol` with `grok-4.5` covering bounded deep work. They express the same three capability bands; one provider's names do not replace another's.

Agent frontmatter records Grok preferences under `delegation.grok.model` (`inherit` for standard role agents, `grok-4.5` for deep ones). Grok itself inherits the parent session model when the field is omitted or unset.

Some models sit between those anchor classes:

| Model and runtime            | Capability placement       | Three-tier routing guidance |
| ---------------------------- | -------------------------- | --------------------------- |
| Composer 2.5                 | Haiku/Luna–Sonnet/Terra    | Upper `light`; use for bounded `standard` work when the task is well specified. |
| Grok 4.5 through Grok Build  | Sonnet/Terra–Opus/Sol      | Upper `standard` and bounded `deep`; keep highest-assurance deep reasoning on Opus/Sol when available via a multi-provider setup. |

These intermediate placements do not add portable tier values such as `light+` or `standard+`. Skills still request `light`, `standard`, or `deep`; a harness adapter may choose an intermediate model when its capability is sufficient for the bounded task.

Versioned model IDs (`claude-haiku-4-5`, `claude-sonnet-4-6`, `claude-opus-4-7`, or the concrete models behind Codex 5.6 classes) drift over time. The harness adapter resolves the tier to the current class for that harness; skills never bake in a versioned ID.

## How skills reference tiers

In SKILL prose:

> Eligibility precheck runs on `standard` (judgment call — see [docs/model-tiers.md](../../docs/model-tiers.md)).

In agent frontmatter, where the harness adapter reads it:

```yaml
---
name: code-review-eligibility
tier: standard
description: Decide whether a PR is worth reviewing.
---
```

The `tier` field is portable. Each harness adapter reads the same frontmatter and resolves the tier to its concrete model per the table above. No skill names `claude-haiku-4-5` directly — that's the adapter's job.

## Sub-agent tier selection (Claude Code)

This section reflects the Claude Code convention from the user's `CLAUDE.md`, mapped to tier vocabulary.

Parents do the hard thinking; sub-agents do bounded work. Default down. Most sub-agents run on `standard` — including reviewer-style sub-agents at the default review effort. `deep` is reserved for sub-agents where reasoning *is* the bottleneck: architectural review (e.g. `principal`), ambiguous design with real trade-offs, debugging where the cause is genuinely unclear.

When a skill spawns a sub-agent without an explicit tier, the adapter uses `standard`. Skills override with the `tier` field on the agent definition or on the spawn call. Effort dials on a skill (where they exist) may bump specific sub-agent tiers up — e.g. a high-effort code review escalates reviewers from `standard` to `deep`.

## Why not just "effort"?

Effort is a workload knob — "how much review runs." Tier is a capability knob — "how smart is the worker." They correlate (high-effort reviews tend to spawn more `deep` reviewers), but they're independent levers:

- A small, mechanical task at `--effort=high` still uses `light` agents for the mechanical sub-steps; `high` just means more of them or more parallel.
- A judgment-heavy task at `--effort=low` still uses `standard` agents — fewer of them, but each still needs to think.

Collapsing the two would force every skill to re-derive the mapping; keeping them separate means the tier vocabulary is shared and the effort dial stays skill-specific.
