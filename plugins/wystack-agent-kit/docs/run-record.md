# Run Record

How the WyStack Agent Kit makes its operational evidence durable. When a skill
runs it often produces evidence that is not the deliverable — a calibration
outcome, a review verdict, a summary of what a map-run found. A **run record**
is that evidence written down so it survives the session.

## Principle

The evidence a run produces is *project state, not chat history*. Left in the
transcript it is lost the moment the session ends. Written as a run record it
outlives the run, so a later consumer — `retro`, a future review — can learn
from it instead of forgetting it.

> "Record" / "run record", never "log" — a run record is durable, queryable
> state, not ephemeral runtime output; "log" connotes the opposite. Legacy
> skill prose that says "calibration log" means a run record.

## Shape

A run record is a **typed JSON record**: one JSON file per record, keyed by id,
validated against a schema for its type. Records of one type live in their own
directory directly under `.wystack/` — `.wystack/calibration/`, `.wystack/perspective/`.
A new record type gets a new directory. The path is resolved through
`wystack-agent-kit:workspace`, not hardcoded.

When `storage.json` binds `records.store` to an extension that supports
`record.write`, producers write the run record there first. The `.wystack/`
directory is the fallback and may keep a cache copy for portability, but it is
not the only sink once a graph-store extension is configured.

JSON because run records are machine evidence — existing calibration data is
JSON and `retro` already parses it. Markdown stays the format for *deliverables*
(`doc-model.md`); a run record is not a deliverable.

Run records and extension records share the same conceptual axes from
[extension-contract.md](extension-contract.md):

| Axis | Values | Meaning |
|---|---|---|
| `kind` | `entity`, `relation`, `event`, `snapshot` | Structural shape |
| `role` | `fact`, `claim`, `decision` | Truth posture |
| `authority` | `external`, `local`, `computed` | Who owns or derives the truth |

Existing run-record types may keep their historical schema names, but new
record-producing work should state these axes explicitly. A computed workflow
verdict is a `fact` with `authority: "computed"` and `derivedFrom` references
to the records that justified it.

Whether a record type mutates in place or is written once-per-run is a property
of that type, stated where the type is defined:

- **Calibration** — one record per task, updated in place across shepherd
  passes. A task has one true outcome, refined as the work progresses.
- **A review verdict** — one record per consult, immutable once written. Each
  review stands on its own.

## The claim model — why review results become trustworthy

The point of recording review evidence is trust. A review verdict — from
`perspective`, from `code-review`, from a model, or from an external tool —
recorded only in the transcript is taken on faith and gone by next session.
Recorded as a run record it becomes durable, auditable, and triageable.

External review output starts as a **claim**, not a fact, unless the source is
explicitly authoritative for that exact fact type. A claim carries status and
triage history:

- **Status** — `open`, `false-positive`, `fixed`, `wont-fix`, `uncertain`.
  A verdict you disagree with is not deleted; its status is set to
  `false-positive`.
- **Triage history** — triage appends a history entry, never replaces. Ids
  stay stable, so the record shows how a verdict was handled over time, not
  just its final state.

A status you can set and a history you can audit are what turn a review result
into trustworthy project evidence rather than an unaccountable claim.

## Freshness and preservation

External records can be stale. Every imported external record should carry
`observedAt`, source scope, and freshness state: `current`, `stale`, `unknown`,
`superseded`, or `unavailable`. Stale records remain historical context, but
they do not drive computed workflow truth until refreshed.

Decision-bearing evidence is preserved more strongly than repetitive noise.
A record is decision-bearing when it changed workflow state, justified a
decision, marked something fixed/blocked/ready, mutated external state,
contradicted another record, or was cited in a final report. Repeated unchanged
snapshots may be coalesced; decision-bearing records are kept or rolled up with
their source pointers and hashes.

Fallbacks are also records. If a preferred extension is unavailable and a skill
uses a fallback, write an event record such as `fallback.used` so later computed
truth can disclose weaker evidence.

## Record types

- **Calibration** — `.wystack/calibration/`, one record per task. Holds
  `size`, outcome, and `review_rounds` (a count, derivable from the
  `reviews/` records when those are present).
- **Review verdicts** — one record per assessment pass, immutable once written.
  `wystack-agent-kit:code-review` and `wystack-agent-kit:full-review` each emit
  one when a workspace is loaded. They write through the configured
  `record.write` binding, with `.wystack/reviews/` as portable fallback/cache.
  Each pass record carries the verdict, branch/sha scope, and `finding_ids`.
  **Finding detail lives in separate triageable files** under `.wystack/findings/`
  (clawpatch-inspired): evidence refs, confidence, reasoning, reproduction,
  recommendation, status, and append-only triage history — not counts alone.
  Schema: `skills/code-review/RECORD-FORMAT.md`. `wystack-agent-kit:finish-task`
  reads the configured record store, then the local fallback, to skip the
  convergence loop when HEAD already carries a `ship` verdict (`diff_sha` +
  `verdict` only).
- **Perspective verdicts** — `.wystack/perspective/`, one record per advisory consult. Planned.
- **Retro syntheses** — `.wystack/retro/`, one record per retrospective, immutable.
  Computed findings (`authority: "computed"`, `derivedFrom` the records analyzed)
  plus the accept/reject outcome per proposal — the next retro reads it to avoid
  re-litigating settled findings.
- **Extension records** — normalized facts, claims, decisions, events,
  snapshots, and relations from configured extensions. May live in `.wystack/`
  local JSON or in a graph-store extension such as Knowledgebase.
- **Computed workflow facts** — readiness, verification state, freshness state,
  risk summary, or task state derived by Agent Kit from source records. These
  carry `authority: "computed"` and `derivedFrom`.

Estimation is *not* a separate record — `retro` derives estimation accuracy
from the `size` field on the calibration record.

## Lifecycle

Run records accrue, but not all evidence deserves full-fidelity retention
forever. Preserve decision-bearing records. Compact duplicate polling snapshots,
unchanged observations, and verbose raw payloads according to `storage.json`
retention policy. Pruning or compaction is a deliberate action with its own
record; it is never a silent side effect of a producing skill.
