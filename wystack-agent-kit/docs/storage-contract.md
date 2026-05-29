# Storage Contract

WyStack Agent Kit workflows are storage-agnostic and tool-agnostic. Skills
operate on project concepts; adapters and extensions explain how a specific
repo stores those concepts and which external systems can observe or mutate
them.

## Setup Files

Every repo that wants lifecycle workflows should have:

```text
.wystack.json                    repo root, tracked — pointer to the workspace
~/.wystack/<project>/            global workspace (default), outside every worktree
  workspace.md
  storage.json
  tasks/
  docs/
```

`wystack-agent-kit:setup-agent-kit` creates these files. Users may edit them directly.

## Location and resolution

The workspace location is project-configured, not fixed. One tracked file at the repo root — `.wystack.json` — names where it lives:

```json
{"root": ".wystack"}
```

`.wystack.json` is the **only committed workspace file** — a pointer, not state. Everything under `root` is gitignored local state.

**Location modes** (chosen at init):

| Mode                  | `root`                 | Notes                                           |
| --------------------- | ---------------------- | ----------------------------------------------- |
| Global (default)      | `~/.wystack/<project>` | Outside every repo and worktree — no gitignore, no path ambiguity |
| Per-project (legacy)  | `.wystack`             | Gitignored workspace in the repo — requires repo-root resolution |
| Custom                | any path               | Escape hatch                                    |

**Resolving the workspace** — a skill, from any directory including a worktree:

1. **Primary** — run `git rev-parse --show-toplevel` to get the repo root. Read `.wystack.json` there. Resolve `root` **relative to the repo root** for relative paths, or expand `~` for home-relative paths. Never resolve `root` relative to `cwd` — in a worktree, `cwd` is the worktree directory and a relative `.wystack` would resolve to an empty path.
2. **Fallback** — if `.wystack.json` is absent, resolve the main worktree with `git rev-parse --path-format=absolute --git-common-dir` and look for `.wystack/` beside it.

Because `.wystack.json` is committed, every worktree carries it — skill-created or harness-created (`orchestrate` execution agents run in harness worktrees). With global mode the workspace path is absolute and unambiguous; the per-project `.wystack` symlink the `worktree` skill drops is a defense-in-depth ergonomic for legacy setups only.

## Structure, providers, and extensions

The framework names the **concepts** — task store, doc store, calibration, tuning, artifacts, decisions. The project configures **where each lives** in `storage.json`. Skills ask the config for a location; they never hardcode `.wystack/docs/` or `.wystack/tasks/`.

Stores are **provider-driven** — the task store and doc store are not necessarily filesystem. Providers: `local-markdown`, `notion`, `github`, `kb`, etc. `storage.json` selects the provider and its config (path for filesystem, database ID for Notion, namespace for `kb`). Only operational local data — config, `calibration/`, `artifacts/`, `tuning.json` — is always filesystem under the workspace root.

Extensions are the broader capability layer. A provider backs a specific store;
an extension can also observe records, execute bounded actions, normalize
external payloads, store graph records, or subscribe to changes. The extension
contract lives in [extension-contract.md](extension-contract.md). Core skills
reason over concepts and primitive capabilities, not over tool names.

## Canonical Concepts

| Concept     | Meaning                                                               |
| ----------- | --------------------------------------------------------------------- |
| Project     | The product/repo/work area the agent is helping with.                 |
| Work item   | A tracked unit of work: task, bug, feature, research item, or epic.   |
| Work doc    | A planning or design artifact: PRD, spec, or note.   |
| Requirement | User-facing behavior or acceptance condition that should be verified. |
| Trace link  | A relationship between work items, docs, requirements, code, and PRs. |

Avoid provider names in core workflow instructions. Say "work item", not
"Notion task" or "GitHub issue", unless describing a specific adapter.

## Required Adapter Capabilities

An adapter can be prose-only. It must tell agents what is available and how to
act safely.

```json
{
    "version": 1,
    "project": {
        "name": "Example",
        "root": "."
    },
    "tasks": {
        "provider": "local-markdown",
        "path": ".wystack/tasks",
        "idPrefix": "TASK",
        "statuses": {
            "backlog": "Backlog",
            "ready": "Ready",
            "inProgress": "In Progress",
            "inReview": "In Review",
            "done": "Done",
            "deferred": "Later",
            "cancelled": "Won't Do"
        },
        "capabilities": {
            "search": true,
            "create": true,
            "updateStatus": true,
            "relations": "body-links"
        }
    },
    "docs": {
        "provider": "local-markdown",
        "path": ".wystack/docs",
        "statuses": {
            "draft": "Draft",
            "active": "Active",
            "superseded": "Superseded",
            "archived": "Archived"
        },
        "capabilities": {
            "search": true,
            "create": true,
            "update": true,
            "crossLink": true
        }
    },
    "conventions": {
        "requirementIdFormat": "{PRD-KEY}-US-{group}.{item}"
    },
    "worktree": {
        "preference": "ask"
    },
    "quality": {
        "preflight": [
            {
                "id": "typecheck",
                "command": "bun run typecheck",
                "purpose": "TypeScript type safety before review",
                "required": true
            },
            {
                "id": "test",
                "command": "bun test",
                "purpose": "Project regression suite",
                "required": true
            }
        ]
    },
    "extensions": {
        "enabled": ["wystack-local"],
        "registry": {
            "wystack-local": {
                "kind": "local-state",
                "capabilities": [
                    "record.read",
                    "record.write",
                    "record.query",
                    "relation.read",
                    "relation.write",
                    "relation.query"
                ]
            }
        }
    },
    "bindings": {
        "records.store": "wystack-local",
        "relations.store": "wystack-local",
        "workItems.authority": "tasks",
        "workDocs.authority": "docs",
        "review.sources": [],
        "review.actions.allowed": [],
        "fix.actions.allowed": []
    },
    "actionPolicy": {
        "read_only": "allow",
        "writes_local_state": "allow",
        "writes_worktree": "agent_discretion",
        "external_mutation": "confirm_or_skill_policy",
        "destructive": "explicit_user_confirm"
    },
    "retention": {
        "activeUntil": "workflow.closed",
        "recentDays": 14,
        "coalesceSnapshots": true,
        "archiveRawAfterDays": 30,
        "expireDuplicatePolls": true
    },
    "agents": {
        "specialists": [
            {
                "name": "backend-specialist",
                "domain": "server, data layer, APIs",
                "brief": ".wystack/agents/backend-specialist.md"
            }
        ]
    },
    "vcs": {
        "host": "github",
        "cli": "gh",
        "stacked": false,
        "commands": {}
    }
}
```

## Workflow Conventions

Beyond provider wiring, `storage.json` records project-wide conventions that
lifecycle skills read instead of hardcoding:

| Field                             | Read by                                     | Meaning                                                                                                                                                                                                                                                                                                              |
| --------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tasks.statuses`                  | every status-aware skill                    | The **work-item status vocabulary** — maps the seven lifecycle roles (`backlog`, `ready`, `inProgress`, `inReview`, `done`, `deferred`, `cancelled`) to this project's status names. Skills resolve roles through it; they never write a literal status.                                                            |
| `docs.statuses`                   | `prd`, `spec`, `doc-model` | The **doc status vocabulary** — one shared workflow for every doc type (PRD/Spec), since they share a store. Maps roles (`draft`, `active`, `superseded`, `archived`) to this project's status names. `superseded` is how a whole-doc supersession is recorded (alongside a `supersedes:` link); skills resolve roles, never write a literal status. |
| `docs.path`                       | `wiki-librarian`, doc skills                | Canonical home for docs (the store is canonical — no promote-to-repo). Default `.wystack/docs`; local layout is `<path>/{prds,specs}/`. Remote providers hold the same artifacts as native pages.                                                                                              |
| `docs.specTemplate`               | `spec`                                      | Optional ordered list of section names a spec should follow, e.g. `["Purpose","Component boundaries","Data flow","Decisions"]`. When set, the `spec` skill uses it as the section skeleton; when unset, the skill chooses sections per spec (agent judgment). The cite-in-context and level-of-detail rules apply either way — the template governs structure only.                                                                                              |
| `conventions.requirementIdFormat` | `prd`, `breakdown`, `spec`, `code-review`   | Template for PRD requirement IDs — `{PRD-KEY}-US-{group}.{item}` yields `MEM-US-1.2`; short form `US-1.2` inside its own PRD. Keeps IDs unique across PRDs.                                                                                                                                                          |
| `worktree.preference`             | `start-task`, `orchestrate`, `worktree`     | Whether task work is isolated in a git worktree: `worktree` (always), `cwd` (never), `ask` (decide per task).                                                                                                                                                                                                        |
| `worktree.directory`              | `worktree`                                  | Optional override for where worktree directories are created. When unset, falls back to `~/worktrees/<project>/<branch>` — outside the working tree, so file watchers, editor pickers, and `node_modules` resolution don't recurse into them. Set this field only to override the global default with a custom path. |
| `quality.preflight`               | `code-review`, `finish-task`, `full-review` | Project-defined commands that must pass before review/finish flows treat the branch as ready for judgment. Empty means "no configured preflight", not "invent a broad test sweep".                                                                                                                                   |
| `extensions`                      | extension-aware skills                      | Enabled capability providers and their descriptors. Registry entries say what a tool can do; bindings say what this repo allows it to do.                                                                                                                                                                            |
| `bindings`                        | extension-aware skills                      | Project routing for authority and contribution: record store, relation store, work-item authority, PR authority, review sources, allowed actions.                                                                                                                                                                    |
| `actionPolicy`                    | every skill that invokes `execute.action`   | Risk gates for read-only observation, local writes, worktree edits, external mutation, and destructive actions.                                                                                                                                                                                                      |
| `retention`                       | record-producing skills and graph stores    | How long operational evidence stays full fidelity before coalescing, archiving, or expiring duplicate noise.                                                                                                                                                                                                         |
| `agents.specialists`              | `code-review`, `full-review`                | The project's domain reviewer roster — see below.                                                                                                                                                                                                                                                                    |
| `vcs`                             | `finish-task`, `code-review`, `engineering-context` | The repo's git host and CLI — picks which commands lifecycle skills run to open PRs, watch CI, read review state. See "VCS configuration" below.                                                                                                                                                                     |

### Extensions and bindings

Extensions are configured in two layers:

1. **Registry** — what each extension can do: primitive capabilities, action
   descriptors, risk, state requirements, and participation hints.
2. **Bindings** — how this project uses those extensions: who stores records,
   who stores relations, which systems are authoritative, which sources
   contribute review evidence, and which actions are allowed.

Registry answers "can this extension do the thing?" Bindings answer "may this
repo use it for this concept?" Skill policy answers "should we invoke it now?"

The primitive capabilities are:

- `observe.records`
- `execute.action`
- `transform.normalize`
- `record.read` / `record.write` / `record.query`
- `relation.read` / `relation.write` / `relation.query`
- `subscribe.changes`

Domain nouns belong in record `type`, action descriptors, and binding scopes,
not in capability names. For example, a review tool can emit
`entity/claim/review.finding` through `observe.records`; it does not need a
special `finding.read` capability.

The default portable setup can use `wystack-local` as a local JSON record and
relation store. A richer project may bind these capabilities to a Knowledgebase
extension without making Knowledgebase a hard Agent Kit dependency.

### Quality gates

Preflight is project policy, not a global command list. A frontend app might use
`pnpm run lint` and `pnpm run typecheck`; a Rust crate might use `cargo test`;
a docs-only repo may have no preflight. Store only commands the project actually
owns.

Each preflight entry has:

| Field      | Meaning                                                                       |
| ---------- | ----------------------------------------------------------------------------- |
| `id`       | Stable short name for reports.                                                |
| `command`  | Command to run from the repo root or documented working directory.            |
| `purpose`  | Why this check gates review.                                                  |
| `required` | `true` blocks review/finish on failure; `false` is reported but not blocking. |

Skills may infer obvious checks when no workspace exists, but once a workspace
is configured they read `quality.preflight` instead of guessing. Do not add
expensive, paid, network-dependent, destructive, or deploy commands to
preflight.

### VCS configuration

`vcs` tells lifecycle skills which git host this repo lives on and which CLI
to drive. Two axes, kept orthogonal:

- **`host`** — the platform the remote is on: `github`, `gitlab`, `bitbucket`,
  `gitea`, or `none`. Determines pull-request terminology (PR vs MR) and
  whose API a skill expects to read.
- **`cli`** — the command-line tool driving operations against that host:
  `gh` (GitHub CLI), `gt` (Graphite, on top of GitHub), `glab` (GitLab CLI),
  `manual` (skills print commands for a human to run). The CLI is what
  expands into actual shell verbs.

A third flag captures workflow shape:

- **`stacked`** — `true` for graphite-style stacked PRs. When set, shepherd
  skips `gh pr update-branch` (use `gt restack`) and uses the CLI's submit
  verb instead of `gh pr create`.

`commands` is the escape hatch — a project can override any resolved command
without changing the host/cli pair. Keys read by skills today:

Skills reference these capabilities by name. They do **not** name `gh`, `gt`,
`glab`, or any other CLI in their procedural text. The contract owns the
defaults table below; skills own the workflow.

| Capability         | Purpose                                            | Default (`cli: gh`)                                  |
| ------------------ | -------------------------------------------------- | ---------------------------------------------------- |
| `prCreate`         | Open a PR/MR from the current branch              | `gh pr create`                                       |
| `prView`           | Read PR/MR metadata for review and reporting      | `gh pr view --json …`                                |
| `prChecks`         | Watch CI; await machine-paced result              | `gh pr checks {pr} --watch --fail-fast`              |
| `prUpdateBranch`   | Sync the PR/MR branch with its base               | `gh pr update-branch`                                |
| `prReady`          | Mark a draft PR/MR ready for review               | `gh pr ready {pr}`                                   |
| `prRequestReview`  | Re-request review from a reviewer                 | `gh pr edit {pr} --add-reviewer …`                   |
| `prCommentsInline` | Read inline review comments                       | `gh api repos/{owner}/{repo}/pulls/{pr}/comments`    |
| `prCommentsTop`    | Read top-level PR/MR comments                     | `gh api repos/{owner}/{repo}/issues/{pr}/comments`   |
| `prThreadReply`    | Reply on a specific review thread                 | `gh api …/pulls/{pr}/comments/{id}/replies`          |
| `ciRerunFailed`    | Rerun only failed CI jobs (flake recovery)        | `gh run rerun <id> --failed`                         |

Sensible defaults by `cli`. Skills resolve capabilities through this table;
they never spell the verb in their own prose.

| `cli`    | `prCreate`           | `prChecks`             | `prUpdateBranch` | `prRequestReview` |
| -------- | -------------------- | ---------------------- | ---------------- | ----------------- |
| `gh`     | `gh pr create`       | `gh pr checks`         | `gh pr update-branch` | `gh pr edit --add-reviewer` |
| `gt`     | `gt submit --stack`  | `gh pr checks`         | `gt restack`     | `gh pr edit --add-reviewer` |
| `glab`   | `glab mr create`     | `glab mr ci view`      | `glab mr update` | `glab mr update --reviewer` |
| `manual` | _print command, ask user to run_ | _print, ask_ | _print, ask_ | _print, ask_ |

For graphite specifically, also drop a stub `adapters/graphite.md` recording
the stacked-PR workflow nuances (one PR at a time, never `--force-push`,
restack instead of rebase). Adapters own provider quirks the contract is too
generic to encode.

For `cli: manual`, the PR path emits the would-be commands as text and exits
in a `needs-human` state — useful for Bitbucket, internal Gerrit-style hosts,
or any case where the agent should never run the verb itself.

### Agent roster

The framework ships **universal roles** every project shares — `pm`,
`principal`, `qa`, `devops`, `task-manager`, `wiki-librarian`. These are fixed
plugin assets; they are not configured.

**Specialists** are domain reviewers a project adds for its own stack — a
backend reviewer, a UI reviewer, a data-layer reviewer. They are project
instance, not framework: `agents.specialists` declares each one with a `name`,
a one-line `domain`, and a `brief` path to its persona. Specialist briefs live
in the workspace (`.wystack/agents/` by default), so a published plugin carries
no project-specific reviewers. `code-review` assembles its panel from the
universal roles plus the configured specialists.

## Local Markdown Defaults

Local markdown is the portable floor. It should work without network access,
private APIs, or extra authentication.

Recommended work item frontmatter:

```yaml
---
id: TASK-0001
title: Example task
status: Backlog
type: Feature
priority: Medium
estimate: M
created: 2026-05-13
---
```

Body sections:

```md
## Description

## Acceptance Criteria

## Scope

## Links
```

## Provider Adapters

Provider-specific adapters should live outside the core contract:

```text
.wystack/
  storage.json              # selected provider and mappings
  adapters/
    notion.md               # optional private provider instructions
    github.md               # optional repo-specific issue instructions
```

Adapters own provider quirks: API names, schema IDs, label mappings, relation
limits, auth requirements, and verification steps.

## Runtime Adapters

Agent definitions are runtime assets. A single `<name>.md` per agent is the
shared source, but harnesses consume it differently:

- Claude can load the file as a native agent definition.
- Codex keeps using its built-in transports (`explorer`, `worker`, `default`)
  and injects the file as role-brief prompt context. Plugin agents do not
  become new custom Codex agent types.

The repo layout is one `<name>.md` per agent under `agents/`:
body = portable principles, frontmatter = identity plus harness-scoped runtime
preferences.

Agent frontmatter has a small vocabulary:

| Group                 | Meaning                                                                            |
| --------------------- | ---------------------------------------------------------------------------------- |
| `name`, `description` | Identity and discovery.                                                            |
| `applies`             | Optional applicability hints: domains, intents, avoid-list.                        |
| `capabilities`        | Optional safety/context boundaries: can write, can run commands, required context. |
| `delegation`          | How to run the agent in each harness and situation.                                |

Runtime settings live under `delegation`.

```yaml
delegation:
    default:
        mode: subagent
        reasoning: high
        write_scope: none
    claude-code:
        model: opus
        thinking: max
    codex:
        transport: explorer
        reasoning_effort: high
```

Do not use a top-level `model`: it is harness-specific and misleading when a
different harness consumes the same file. Do not hardcode `tools:` lists or MCP
tool IDs in these shared files; capability comes from the executing harness and
the workspace's provider adapter. No separate per-harness source file is
required.
