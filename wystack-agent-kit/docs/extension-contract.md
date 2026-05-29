# Extension Contract

WyStack Agent Kit is a workflow core. Extensions are capability providers.
The core owns meaning, lifecycle, policy, and computed workflow truth.
Extensions translate external systems into normalized records and perform
bounded actions only when invoked by a skill.

This contract is intentionally small. It covers local CLIs, app connectors,
model reviewers, graph stores, browser tools, CI systems, and document/task
stores without making any one of them special.

## Boundary

| Layer | Owns |
|---|---|
| Agent Kit core | Workflow concepts, record schema, relation vocabulary, authority rules, risk policy, computed state |
| Skills | When to observe, when to ask for action, how to sequence workflow steps |
| Extensions | Source-system translation, native command/tool execution, raw payload pointers, provider-specific state |
| Project bindings | Which extensions are enabled, authoritative, contributory, or allowed to act in this repo |

Extensions advertise options; they do not mandate workflow behavior. There are
no implicit lifecycle hooks in v1. A skill explicitly queries configured
extensions and invokes the capability it needs.

Record-producing skills must write through the configured `record.write`
binding when one is available. Local `.wystack/` JSON remains the portable
fallback and may also act as a cache, but a project that binds records to a
graph-store extension should see review verdicts, architecture map runs, and
other durable workflow records appear in that store.

## Primitive capabilities

| Capability | Meaning |
|---|---|
| `observe.records` | Read external state and emit normalized records or native payloads to normalize |
| `execute.action` | Perform a bounded operation such as comment, apply fix, verify record, update status, or run review |
| `transform.normalize` | Convert native payloads into Agent Kit records |
| `record.read` / `record.write` / `record.query` | Read, write, and query normalized records |
| `relation.read` / `relation.write` / `relation.query` | Read, write, and query normalized edge records |
| `subscribe.changes` | Watch or poll an external source for changes |

Domain nouns are data, not capability families. A review tool does not need a
`finding.read` capability; it can expose `observe.records` and emit
`entity/claim/review.finding` records. Portable finding shape for Agent Kit
code-review: `skills/code-review/RECORD-FORMAT.md` (clawpatch-aligned evidence,
triage status, and per-finding files). A patch tool does not need
`fix.apply`; it can expose `execute.action` with an `apply_fix` action.

## Record axes

Every normalized record has three independent axes.

| Axis | Values | Meaning |
|---|---|---|
| `kind` | `entity`, `relation`, `event`, `snapshot` | Structural shape |
| `role` | `fact`, `claim`, `decision` | Truth posture |
| `authority` | `external`, `local`, `computed` | Who owns or derives the truth |

Authority means different things per role:

- For `fact`, authority owns truth.
- For `claim`, authority owns provenance/existence, not correctness.
- For `decision`, authority owns judgment.

Common lifecycles:

| Kind | Default lifecycle |
|---|---|
| `entity` | Reconciled current state |
| `relation` | Reconciled current edge, unless marked historical |
| `event` | Append-only |
| `snapshot` | Append-only, with compaction allowed by retention policy |

## Identity

Agent Kit IDs are local, stable, and never equal to external IDs.

```json
{
  "id": "rec_abc123",
  "kind": "entity",
  "role": "fact",
  "authority": "external",
  "type": "github.pull_request",
  "source": {
    "extension": "github",
    "externalId": "pull/42",
    "externalUrl": "https://github.com/org/repo/pull/42"
  }
}
```

External IDs locate source truth. Agent Kit IDs preserve normalized graph
identity across extensions and re-observation.

## Relations

Relations are separate records. Objects may cache relation IDs for convenience,
but the canonical edge is its own record.

Core relation types:

| Relation | Meaning |
|---|---|
| `references` | Weak/general link |
| `depends_on` | One record requires another |
| `implements` | Code, action, or PR realizes a work item, spec, or decision |
| `affects` | One record impacts another |
| `blocks` | Prevents progress or completion |
| `resolves` | Closes a claim or work item |
| `supersedes` | Newer record replaces older record |
| `derived_from` | Computed fact came from source records |
| `contradicts` | Records disagree |
| `duplicates` | Records describe the same underlying thing |

Extensions may emit namespaced relations, but when workflow semantics matter
they must map to a core relation type.

## Freshness

External records are not assumed current. Imported records carry source scope
and freshness metadata.

```json
{
  "observedAt": "2026-05-20T10:12:00Z",
  "scope": {
    "gitHead": "abc123",
    "base": "main",
    "changedFilesHash": "sha256:..."
  },
  "freshness": {
    "state": "current",
    "checkedAt": "2026-05-20T10:12:00Z"
  }
}
```

Freshness states:

| State | Meaning |
|---|---|
| `current` | Verified against the current source state |
| `stale` | Known not to match current source state |
| `unknown` | Imported but not checked |
| `superseded` | Replaced by a newer record |
| `unavailable` | Source could not be checked |

If an extension supports `execute.action` with `verify_record`, prefer
verification over discard/re-import for existing claims. Stale records remain
historical context, not live workflow evidence.

## Actions and control

The main agent or invoking skill owns discretion. Extensions expose possible
actions, but never decide whether they should run.

Every action descriptor declares risk and constraints:

```json
{
  "name": "apply_fix",
  "risk": "writes_worktree",
  "accepts": ["entity/claim"],
  "emits": ["event/fact", "snapshot/fact"],
  "requiresCleanWorktree": true,
  "constraints": {
    "maxFiles": 3,
    "allowedPaths": ["src/**", "test/**"],
    "noCommit": true
  }
}
```

Risk levels:

| Risk | Meaning |
|---|---|
| `read_only` | Observes or transforms only |
| `writes_local_state` | Writes `.wystack`, graph store, cache, or artifacts |
| `writes_worktree` | Edits source files |
| `external_mutation` | Comments, task updates, PR changes, status changes |
| `destructive` | Deletes, force-pushes, closes, overwrites, or irreversible actions |

Extensions declare risk. Agent Kit policy decides whether the main agent may
invoke them.

## Capability resolution

Capability discovery returns both whether an action is available and why not.

```json
{
  "extension": "clawpatch",
  "capability": "execute.action",
  "action": "apply_fix",
  "state": "blocked",
  "reason": "dirty_worktree",
  "requirements": ["clean_worktree"],
  "suggestedRecovery": "commit unrelated changes or choose main-agent fix"
}
```

States: `available`, `blocked`, `unconfigured`, `unsupported`, `stale`,
`denied`, `errored`.

Fallbacks must be explicit and recorded. A fallback may keep the workflow
moving, but computed truth must know when it rests on weaker evidence.

## Retention

Agent Kit stores enough to reason. Extensions and raw stores keep enough to
audit.

- Keep thin normalized records by default.
- Store raw payloads by pointer and hash when possible.
- Coalesce repeated unchanged snapshots.
- Preserve decision-bearing evidence.
- Compact noise into rollups after active workflow use.

Decision-bearing records are records used to change workflow state, justify a
decision, mark something fixed/blocked/ready, mutate external state, contradict
another record, or appear in a final report.

## Presentation

Workflow skills produce structured truth — verdicts, computed facts, primary
reasons, available actions, and provenance — and deliver it under the
communication contract (`docs/communication-contract.md`). Provider details
stay secondary unless they affect the decision.
