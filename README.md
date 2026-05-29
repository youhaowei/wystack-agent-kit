# WyStack Agent Kit

**Write your agent workflow once. Run it identically on Claude Code, Codex, Cursor, and Pi.**

[![npm](https://img.shields.io/npm/v/@wystack/agent-kit)](https://www.npmjs.com/package/@wystack/agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Harnesses](https://img.shields.io/badge/runs%20on-Claude%20Code%20·%20Codex%20·%20Cursor%20·%20Pi-black)

Agent skills usually lock you to one harness. This kit gives an LLM agent **one stable working procedure** — how to break down a PRD, start and finish a task, review code, bootstrap a design system, write product copy — and runs the same procedure on every major harness. Switch tools without retraining your agent.

> **Demo:** _(coming at launch — the same task lifecycle driven on Claude Code and Codex, side by side.)_

## The spine: one driven lifecycle

The kit isn't 35 loose skills — it's a software lifecycle an agent can drive end to end, with you supervising the decisions:

```
brainstorm → prd → spec → breakdown → start-task → code-review → verify → finish-task
```

Each step is a skill. Each skill resolves your project's own tools — task tracker, doc store, reviewers — through a fixed contract, so the agent's procedure stays constant while the underlying tools vary per project.

## Why portable matters

Every project plugs its own task tracker (GitHub Issues, Linear, Notion, Jira, local markdown…) and document store into the same workflow contract. The agent's behavior is defined once, in portable skill bodies; only the frontmatter adapter differs per harness:

| Harness | How it reads the kit |
|---|---|
| **Claude Code** | Plugin marketplace; reads top-level frontmatter |
| **Codex** | Plugin marketplace; reads the nested `delegation.codex` block |
| **Cursor** | Local-path plugin |
| **Pi** | `pi install` — skills, agents, and tool extensions |

## Quick install

### Claude Code

```bash
/plugin marketplace add github.com/youhaowei/wystack-agent-kit
/plugin install wystack-agent-kit@wystack-agent-kit
```

Reload the session after install.

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
# { "type": "local", "path": "/abs/path/to/wystack-agent-kit/wystack-agent-kit" }
```

### Pi

```bash
git clone https://github.com/youhaowei/wystack-agent-kit.git
cd wystack-agent-kit
pi install .
```

Loads plugin skills, role agents, the `wystack_agent` subagent tool, and an `agent_browser` tool. If Pi is already running, `/reload`. For MCP-based external tools: `pi install npm:pi-mcp-adapter`.

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

Default storage is local markdown — zero external setup. Map the same contract to GitHub Issues, GitLab, Linear, Jira, or Notion by editing `.wystack/storage.json`.

## What you get

35 skills across the lifecycle. Each self-describes through its frontmatter `description` — that's the trigger contract an LLM matches against, so there's no index to keep in sync.

| Group | Skills |
|-------|--------|
| **Planning** | `brainstorm`, `prd`, `spec`, `breakdown`, `groom`, `estimation`, `reprioritize`, `next-task`, `new-task` |
| **Execution** | `start-task`, `worktree`, `orchestrate`, `finish-task`, `cleanup`, `handoff` |
| **Review + verification** | `code-review`, `full-review`, `critique`, `verify`, `perspective`, `retro`, `improve-codebase` |
| **Design** | `establish`, `frontend`, `polish`, `design-review` |
| **Writing + distribution** | `ux-writing`, `copywriting`, `discoverability`, `competitor-analysis` |
| **Workspace** | `setup-agent-kit`, `workspace`, `architecture-overview`, `identify-specialists`, `engineering-context` |

Plus 10 universal role agents — `pm`, `principal`, `qa`, `devops`, `task-manager`, `wiki-librarian`, `designer`, `ux-writer`, `copywriter`, `marketing-specialist` — with project-configured domain specialists on top.

## How it's built

Every skill and agent inherits shared methodology docs in [`wystack-agent-kit/docs/`](wystack-agent-kit/docs/):

- `constitution.md` — the behavioral charter: the agent carries work; the human owns decisions.
- `communication-contract.md` — output shape and interactive checkpoints.
- `testing-philosophy.md`, `review-loop.md`, `run-record.md` — quality and evidence.
- `storage-contract.md`, `extension-contract.md`, `workspace-model.md`, `doc-model.md` — the project-instance and extension model.

Agent bodies are portable principles. Frontmatter carries selection metadata — `name`, `description`, top-level `model`, and a nested `delegation.<harness>.*` block. Claude Code reads top-level; Codex reads the nested block. That split is what makes one definition run everywhere.

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
   { "type": "local", "path": "~/code/wystack-agent-kit/wystack-agent-kit" }
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

## Credits

Built on open-source skill work, made portable across harnesses:

- [**obra/superpowers**](https://github.com/obra/superpowers) (MIT) — the substrate this kit derives from.
- [**garrytan/gstack**](https://github.com/garrytan/gstack) (MIT) — workflow inspiration.
- [**mattpocock/skills**](https://github.com/mattpocock/skills) (MIT) — skill-authoring patterns.

See [UPSTREAM.md](UPSTREAM.md) for fork lineage and the upstream-tracking process.

## License

MIT — see [LICENSE](LICENSE).
