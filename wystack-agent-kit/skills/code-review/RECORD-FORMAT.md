# Review Run Record

Durable evidence for one assessment pass. Written by `wystack-agent-kit:code-review`
and `wystack-agent-kit:full-review` when a workspace is loaded.

Portable layout (clawpatch-inspired — findings are **project state**, not chat
history):

```text
.wystack/
  reviews/REV-{unix-ts}-{short-sha}.json   # one immutable pass record
  findings/<findingId>.json                # one triageable finding per file
```

When `storage.json` binds `record.write`, write through that binding first; keep
`.wystack/` as portable fallback/cache. Finding records normalize to
`entity/claim/review.finding` per `docs/extension-contract.md`.

## Principle

Borrowed from [clawpatch](https://github.com/openclaw/clawpatch): **findings are
first-class project state** — evidence-backed, individually addressable, triageable
across sessions. The review pass record is an audit trail that links to them;
each finding file carries enough context to fix, defer, or revalidate one item
without reopening the transcript.

The chat report is ephemeral. `.wystack/findings/` is what `finish-task`, `retro`,
and later sessions query.

## Review pass record

Immutable once written — one file per assessment pass.

Path: `.wystack/reviews/REV-{unix-ts}-{short-sha}.json`

```json
{
  "schemaVersion": 1,
  "id": "REV-{unix-ts}-{short-sha}",
  "type": "review",
  "task": "TASK-{id}",
  "skill": "code-review",
  "branch": "<branch>",
  "base": "<base>",
  "diff_sha": "<HEAD sha at review start>",
  "started_at": "<ISO 8601>",
  "verdict": "ship",
  "must_count": 0,
  "suggest_count": 0,
  "caller": "finish-task",
  "round": 1,
  "finding_ids": [],
  "patterns": [],
  "reviewer_verdicts": []
}
```

| Field | Required | Notes |
|---|---|---|
| `finding_ids` | yes | Stable ids of finding records written this pass. Empty when clean. |
| `must_count`, `suggest_count` | yes | Denormalized from linked findings' `gate` — recompute before write. |

`finish-task` resume checks `diff_sha` + `verdict === "ship"` only. Finding files
and counts are for humans, triage, retro, and extensions — not the skip gate.

## Finding record

One file per finding. **Triage updates the finding file** (status + history);
the review pass record stays immutable.

Path: `.wystack/findings/<findingId>.json`

```json
{
  "schemaVersion": 1,
  "kind": "entity",
  "role": "claim",
  "authority": "computed",
  "type": "review.finding",
  "findingId": "fnd_a1b2c3d4",
  "reviewId": "REV-{unix-ts}-{short-sha}",
  "task": "TASK-{id}",
  "scope": "src/auth",
  "title": "Refresh token rotation does not invalidate the previous token",
  "category": "security",
  "gate": "must",
  "severity": "high",
  "confidence": "high",
  "evidence": [
    {
      "path": "src/auth/session.ts",
      "startLine": 84,
      "endLine": 91,
      "symbol": "rotateRefreshToken",
      "quote": "await store.save(newToken) // previous token not revoked"
    }
  ],
  "reasoning": "An attacker with a captured refresh token can keep exchanging after rotation.",
  "reproduction": "Issue token A, call rotate, exchange token A again — succeeds.",
  "recommendation": "Revoke the prior refresh token id on rotation.",
  "min_fix_scope": "session.ts rotate path only",
  "suggested_regression_tests": ["rotation invalidates prior refresh token"],
  "status": "open",
  "triage_history": [],
  "signature": "sha256:…",
  "sources": ["code-reviewer", "qa"],
  "lens": "code-review",
  "agreement_count": 2,
  "createdAt": "<ISO 8601>",
  "updatedAt": "<ISO 8601>"
}
```

### Field reference

| Field | Required | Notes |
|---|---|---|
| `findingId` | yes | Stable id: `fnd_` + short hash of `category` + normalized evidence + `title`. Same signature across runs → same id (update in place, append history). |
| `reviewId` | yes | Pass that created or last re-surfaced this finding |
| `scope` | no | Module/boundary slice (clawpatch `featureId` analogue) — primary module or package cluster |
| `title` | yes | Short headline |
| `category` | yes | See categories below |
| `gate` | yes | Orchestrator triage: `must` \| `suggest` |
| `severity` | yes | Reviewer native: `critical` \| `high` \| `medium` \| `low` |
| `confidence` | yes | `high` \| `medium` \| `low` — how well evidence supports the claim |
| `evidence` | yes | At least one ref when the finding is code-local; see below |
| `reasoning` | yes | Why this matters — not a restatement of the title |
| `reproduction` | no | Steps to observe the issue, or `null` |
| `recommendation` | yes | Smallest correct fix or defer destination |
| `min_fix_scope` | no | Smallest change surface (clawpatch fix-loop input) |
| `suggested_regression_tests` | no | Test names or scenarios that would catch recurrence |
| `status` | yes | `open` \| `false-positive` \| `fixed` \| `wont-fix` \| `uncertain` |
| `triage_history` | yes | Append-only; never replace — see below |
| `signature` | yes | Dedup key across runs (hash of category + evidence + title) |
| `sources` | yes | Reviewer or lens names |
| `lens` | yes | `code-review` \| `qa` \| `pm` |
| `agreement_count` | no | Independent reviewers flagging the same issue (≥2 = higher signal) |

### Evidence ref

Clawpatch requires path-backed evidence — not vibes. Each ref:

```json
{
  "path": "src/auth/session.ts",
  "startLine": 84,
  "endLine": 91,
  "symbol": "rotateRefreshToken",
  "quote": "verbatim excerpt from the diff/context, ≤240 chars"
}
```

| Field | Required | Notes |
|---|---|---|
| `path` | yes | Repo-relative path |
| `startLine`, `endLine` | no | Inclusive line range when known |
| `symbol` | no | Function, class, route, or export name |
| `quote` | no | Verbatim code excerpt anchoring the claim |

Product/AC findings without a code anchor: `evidence` may be a single ref with
`path` set to the work-item or spec id and `quote` to the violated AC text.

### Categories

Aligned with clawpatch; map report labels to these slugs:

| Slug | Report label |
|---|---|
| `bug` | Bug |
| `security` | Security |
| `performance` | Performance |
| `concurrency` | Concurrency |
| `api-contract` | Design / API |
| `data-loss` | Data loss |
| `test-gap` | Coverage |
| `docs-gap` | Doc |
| `build-release` | Build / release |
| `maintainability` | Maintainability / Style |
| `product` | Product |
| `requirement` | Requirement |

### Triage history

Append-only — status changes never delete prior state (`docs/run-record.md`):

```json
{
  "at": "2026-05-27T10:12:00Z",
  "status": "false-positive",
  "note": "covered by session.test.ts rotation case",
  "by": "user"
}
```

`by`: `user` \| `finish-task` \| `revalidate` \| `orchestrator`

Mark `fixed` only after revalidation or an explicit human confirmation — same
discipline as clawpatch's `revalidate --finding`.

## Pattern shape (optional)

Stored on the review pass record only — propagation-worthy positives, not defects:

```json
{
  "id": "P1",
  "name": "Spec-anchored test names",
  "location": "src/auth/session.test.ts",
  "rationale": "Test titles quote the requirement id",
  "destination": "CLAUDE.md"
}
```

## Reviewer verdict shape (optional)

On the review pass record — per-reviewer ship arguments:

```json
{
  "reviewer": "code-reviewer",
  "verdict": "SHIP-WITH-TICKETS",
  "argument": "One SUGGEST on logging; no blocking correctness issues"
}
```

## Write rules

1. **One finding file per triaged item** under `.wystack/findings/`. Link ids in
   the pass record's `finding_ids`.
2. **Evidence required for code-local claims** — path + quote when possible;
   drop or downgrade to `uncertain` findings with no anchor (clawpatch validation
   rule).
3. **Recompute counts** from finding files' `gate` before writing the pass record.
4. **Dedup by `signature`** — same issue in a later pass updates the existing
   finding (refresh `reviewId`, append triage history) instead of duplicating.
5. **100+ findings** — report may show top 10; still write every finding file.
6. **No workspace** — skip writes; one setup-suggestion line in the report footer.
7. **Extension store** — same shapes through `record.write`; portable JSON remains
   the fallback aggregate.

## Revalidation (manual / extension)

When a finding is fixed or the branch moves on, re-check open findings:

- Evidence still present at cited lines?
- Does `gate` still apply after orchestrator re-triage?
- Append outcome to `triage_history`; set `status` to `fixed`, `false-positive`,
  or `uncertain`.

Extensions such as clawpatch expose this as `execute.action` /
`verify_record`; Agent Kit surfaces the action but does not auto-run it in v1
(`code-review/SKILL.md`).

## Full-review

Inner `code-review` writes its own pass + finding files. `full-review` writes a
top-level pass record with merged `finding_ids` from all lenses (`qa`, `pm`
findings use the same finding shape; `lens` distinguishes them).
