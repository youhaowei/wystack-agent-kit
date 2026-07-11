# WyStack Agent Kit

**The agent carries the work. You carry the decisions.**

[![npm](https://img.shields.io/npm/v/@wystack/agent-kit)](https://www.npmjs.com/package/@wystack/agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Harnesses](https://img.shields.io/badge/runs%20on-Claude%20Code%20·%20Codex%20·%20Cursor%20·%20Pi-black)

WyStack Agent Kit takes a coding agent through the whole job — planning a feature, building it, reviewing it, shipping it — as one connected method rather than scattered commands. One rule holds across all of it: the agent does the work, you make the decisions.

It's a synthesis of the best of the agent-skills scene, built on four pillars:

- **Full lifecycle** — brainstorm → PRD → spec → breakdown → build → review → verify → ship, as one continuous method. Not isolated tricks.
- **Human in the loop** — the agent does the work and surfaces the calls that are yours. You decide scope, trade-offs, and what ships.
- **Auditable by design** — decisions, review verdicts, and run evidence become durable project state, not lost chat history. Every claim of success carries proof you can review.
- **Autonomous when you want it** — scale to parallel, multi-ticket execution with `orchestrate`; you still gate what merges. Supervised by default, autonomous by choice.

Runs wherever you do — Claude Code, Codex, Cursor, Pi.

## Install — 30 seconds

### Claude Code

```bash
/plugin marketplace add github.com/youhaowei/wystack-agent-kit
/plugin install wystack-agent-kit@wystack-agent-kit
```

Reload the session after install. Other harnesses (Codex, Cursor, Pi) → [jump to install](#other-harnesses).

## The method, made visible

The kit isn't 35 loose skills — it's one software lifecycle an agent drives end to end. At every stage the split is the same: **the agent does the work; you make the decision.**

```
brainstorm → prd → spec → breakdown → start-task → code-review → verify → finish-task
```

| Stage | The agent does | You decide |
|---|---|---|
| `brainstorm` | Interviews, pressure-tests the idea, proposes approaches | Which direction is right |
| `prd` / `spec` | Drafts the requirements and the technical design | Sign-off on scope and shape |
| `breakdown` | Splits the work into vertical-slice tickets | What's in, what's cut |
| `start-task` | Sets up the worktree, plans the slices, writes the code | Approve the plan; own the scope |
| `code-review` | Runs multi-angle review, flags real findings | Which findings block the merge |
| `verify` | Runs the app, gathers runtime evidence | Whether the behavior is acceptable |
| `finish-task` | Lands the branch, cleans up, updates the tracker | The go/no-go to ship |

That split is enforced, not aspirational. Every skill inherits a [constitution](plugins/wystack-agent-kit/docs/constitution.md): the agent never hands you a checklist of chores, never silently makes a call that's yours, and never claims success it can't show evidence for.

**It leaves a trail.** Decisions, review verdicts, and run evidence are written as durable [run records](plugins/wystack-agent-kit/docs/run-record.md) — typed, queryable project state under `.wystack/`, not chat history that dies with the session. A later `retro` or review reads what an earlier run found instead of forgetting it.

**It scales when you let it.** Running one task is `start-task`. Running many is [`orchestrate`](plugins/wystack-agent-kit/skills/orchestrate/SKILL.md) — a conductor that dispatches parallel agents per ticket and brings the results back for you to gate. Supervised by default; autonomous when you choose.

## First run

Lifecycle skills need a project workspace. Run once per repo:

```text
wystack-agent-kit:setup-agent-kit
```

It creates `.wystack/` at the project root:

```text
.wystack/
  workspace.md       # project identity, conventions, domain doc layout
  storage.json       # task/doc provider and status mappings
  tasks/             # local markdown fallback for work items
  docs/              # local markdown fallback for PRDs/specs/notes
```

Default storage is local markdown — zero external setup. Map the same contract to GitHub Issues, GitLab, Linear, Jira, or Notion by editing `.wystack/storage.json`. The agent's procedure stays constant; only the underlying tools vary per project.

## Start here

Four skills cover the everyday loop. Learn these and you're productive; the rest are there when a task calls for them.

| Skill | When you reach for it |
|---|---|
| `brainstorm` | A rough idea needs shaping into a real design before you build |
| `start-task` | Time to do a piece of work — plan, worktree, write the code |
| `code-review` | A diff or branch needs a thorough, multi-angle review |
| `finish-task` | Work is done — gate it, land it, clean up, update the tracker |

Everything else is depth for when you need it — drafting a PRD, verifying runtime behavior, running parallel work across tickets, bootstrapping a design system, writing product copy. Skills self-describe through their frontmatter `description` (the trigger an LLM matches against), so the agent reaches for the right one without an index to maintain.

<details>
<summary><strong>Full skill reference</strong> — every skill, grouped by lifecycle stage</summary>

| Group | Skills |
|-------|--------|
| **Planning** | `brainstorm`, `prd`, `spec`, `breakdown`, `groom`, `estimation`, `reprioritize`, `next-task`, `new-task` |
| **Execution** | `start-task`, `worktree`, `orchestrate`, `finish-task`, `cleanup`, `handoff` |
| **Review + verification** | `code-review`, `full-review`, `critique`, `verify`, `perspective`, `retro`, `improve-codebase` |
| **Design** | `establish-design`, `frontend-design`, `polish-design` |
| **Writing + distribution** | `ux-writing`, `copywriting`, `discoverability` |
| **Workspace** | `setup-agent-kit`, `workspace`, `engineering-context` |

Plus 10 universal role agents — `pm`, `principal`, `qa`, `devops`, `task-manager`, `wiki-librarian`, `designer`, `ux-writer`, `copywriter`, `marketing-specialist`.

</details>

## Inspired by the best of the scene

The synthesis draws from three sources, all MIT: the methodology discipline of [**obra/superpowers**](https://github.com/obra/superpowers), the lifecycle drive of [**garrytan/gstack**](https://github.com/garrytan/gstack), and the everyday-real-engineering ethos of [**mattpocock/skills**](https://github.com/mattpocock/skills). The contribution here is unifying them under one charter — the agent carries the work, the human carries the decisions — with auditability and optional autonomy built in.

See [UPSTREAM.md](UPSTREAM.md) for fork lineage and the upstream-tracking process.

## Other harnesses

### Codex

```bash
codex plugin marketplace add github.com/youhaowei/wystack-agent-kit \
  --manifest .agents/plugins/marketplace.json
codex plugin install wystack-agent-kit
```

Reload Codex to pick up plugin metadata.

### Cursor / any local-path host

```bash
git clone https://github.com/youhaowei/wystack-agent-kit.git
# point your host's plugin config at the inner plugin directory:
# { "type": "local", "path": "/abs/path/to/wystack-agent-kit/plugins/wystack-agent-kit" }
```

### Pi

```bash
git clone https://github.com/youhaowei/wystack-agent-kit.git
cd wystack-agent-kit
pi install .
```

Loads plugin skills, role agents, the `wystack_agent` subagent tool, and an `agent_browser` tool. If Pi is already running, `/reload`. For MCP-based external tools: `pi install npm:pi-mcp-adapter`.

## How it's built

One skill body runs on every harness because behavior and adapter are separated. Skill and agent bodies are **portable principles** — generic, project-agnostic. Frontmatter carries the per-harness adapter: `name`, `description`, top-level `model`, and a nested `delegation.<harness>.*` block. Claude Code reads top-level; Codex reads the nested block. Porting to a new harness is that harness reading the same frontmatter — never rewriting the method.

Every skill inherits the shared methodology docs in [`plugins/wystack-agent-kit/docs/`](plugins/wystack-agent-kit/docs/):

- `constitution.md` — the behavioral charter: the agent carries work; the human owns decisions.
- `communication-contract.md` — output shape and interactive checkpoints.
- `testing-philosophy.md`, `review-loop.md`, `run-record.md` — quality and evidence.
- `storage-contract.md`, `extension-contract.md`, `workspace-model.md`, `doc-model.md` — the project-instance and extension model.

## Installing this as an agent

If you are an LLM agent reading this README to install the kit into the current project, follow the block matching your host. Each block is self-contained and does not ask the user to make sub-decisions.

<details>
<summary><strong>Agent install instructions</strong> (Claude Code · Codex · Cursor)</summary>

### Host: Claude Code

```bash
/plugin marketplace add github.com/youhaowei/wystack-agent-kit
/plugin install wystack-agent-kit@wystack-agent-kit
```

Verify: `/plugin` should list `wystack-agent-kit` as installed. Tell the user to reload the session. Then, if the project will use lifecycle skills, invoke `/wystack-agent-kit:setup-agent-kit`. Skip if the user only wants design / writing / review skills.

### Host: Codex

```bash
codex plugin marketplace add github.com/youhaowei/wystack-agent-kit \
  --manifest .agents/plugins/marketplace.json
codex plugin install wystack-agent-kit
```

Verify: `codex plugin list` should include `wystack-agent-kit`. Tell the user to reload Codex.

### Host: Cursor / generic local-path host

1. Clone outside the project: `git clone https://github.com/youhaowei/wystack-agent-kit.git ~/code/wystack-agent-kit`
2. Register the plugin source in the host's plugin config:
   ```json
   { "type": "local", "path": "~/code/wystack-agent-kit/plugins/wystack-agent-kit" }
   ```
3. Reload the host.

### After install — workspace bootstrap

Run once per project repo (not per agent session):

```text
wystack-agent-kit:setup-agent-kit
```

This is interactive — surface its prompts to the user, don't auto-answer. Outcome: a `.wystack/` directory with `workspace.md` and `storage.json`, read on every subsequent skill invocation.

### Verifying the install worked

- `wystack-agent-kit:workspace` resolves the project workspace without error.
- Listing skills shows entries prefixed `wystack-agent-kit:` (e.g. `wystack-agent-kit:prd`).
- Spawning an agent (e.g. `principal`) runs on the intended model — sonnet for routine roles, opus for `principal`, `pm`, `designer`. If it inherits the parent's model, the install is using an older cached version; reload or reinstall.

</details>

## Contributing

Build, deploy, and Codex-migration workflows live in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE). Built on the MIT-licensed work credited above.
