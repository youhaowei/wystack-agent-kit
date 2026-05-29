# WyStack Agent Kit

Portable agent workflows for planning, implementing, reviewing, verifying, designing, writing, and distributing software — packaged as a single plugin that runs on Claude Code, Codex, Cursor, and Pi.

The kit gives an LLM agent a stable working procedure across projects: how to break down a PRD, how to start and finish a task, how to review code, how to bootstrap a design system, how to write product copy. Every project plugs its own task tracker (GitHub Issues, Linear, Notion, Jira, local markdown…) and document store into the same workflow contract, so the agent's procedure stays constant while the underlying tools vary.

This repo ships one plugin:

| Plugin | Purpose |
|--------|---------|
| `wystack-agent-kit/` | Planning, implementation, review, verification, frontend design, UX writing, copywriting, discoverability |

Public package identity: `@wystack/agent-kit`. Plugin namespace: `wystack-agent-kit`.

## Workflow groups

| Group | Skills |
|-------|--------|
| Planning | `brainstorm`, `prd`, `spec`, `breakdown`, `groom`, `estimation`, `next-task`, `new-task` |
| Execution | `start-task`, `worktree`, `orchestrate`, `finish-task`, `cleanup`, `handoff` |
| Review + verification | `code-review`, `full-review`, `critique`, `verify`, `perspective`, `retro` |
| Design | `establish`, `frontend`, `polish`, `design-review` |
| Writing + distribution | `ux-writing`, `copywriting`, `discoverability`, `competitor-analysis` |
| Workspace | `setup-agent-kit`, `workspace`, `glossary`, `architecture-overview`, `identify-specialists` |

Every skill self-describes through its frontmatter `description` — that's the trigger contract an LLM matches against. There is no separate skill index to maintain.

## Quick install

### Claude Code

```bash
/plugin marketplace add github.com/youhaowei/wystack-agent-kit
/plugin install wystack-agent-kit@wystack-agent-kit
```

After install, reload the Claude Code session.

### Codex

Register this repo as a marketplace (one-time):

```bash
codex plugin marketplace add github.com/youhaowei/wystack-agent-kit \
  --manifest .agents/plugins/marketplace.json
codex plugin install wystack-agent-kit
```

Reload Codex to pick up plugin metadata.

### Cursor / any host that takes a local path

Clone the repo and point your host at the plugin directory:

```bash
git clone https://github.com/youhaowei/wystack-agent-kit.git
# host config — example shape:
# { "type": "local", "path": "/abs/path/to/wystack-agent-kit/wystack-agent-kit" }
```

### Pi

```bash
git clone https://github.com/youhaowei/wystack-agent-kit.git
cd wystack-agent-kit
pi install .
```

Loads: plugin skills, role agents, the `wystack_agent` subagent tool, and an `agent_browser` tool wrapping `agent-browser`. If Pi is already running, use `/reload`.

For MCP-based external tools: `pi install npm:pi-mcp-adapter`.

## Project setup

Lifecycle skills (`next-task`, `new-task`, `start-task`, `groom`, `breakdown`, `orchestrate`, `finish-task`) need a project workspace. Run `wystack-agent-kit:setup-agent-kit` once per repo. It creates:

```text
.wystack/
  workspace.md       # project identity, conventions, domain doc layout
  storage.json       # task/doc provider and status mappings
  tasks/             # local markdown fallback for work items
  docs/              # local markdown fallback for PRDs/specs/notes
```

Default storage is local markdown under `.wystack/`. Map the same contract to GitHub Issues, GitLab Issues, Linear, Jira, Notion, or anything else by editing `.wystack/storage.json`. Generic extensions (graph stores, model reviewers, browser tools, CI hooks) attach through the same contract without becoming core concepts.

## Authoring model

Every skill and agent inherits the shared methodology docs in `wystack-agent-kit/docs/`:

- `constitution.md` — behavioral charter: the agent carries work; the human owns decisions.
- `communication-contract.md` — output shape and interactive checkpoints.
- `testing-philosophy.md`, `review-loop.md`, `run-record.md` — quality and evidence.
- `storage-contract.md`, `extension-contract.md`, `workspace-model.md`, `doc-model.md` — project instance and extension model.

Agent bodies are portable principles. Frontmatter carries selection metadata — `name`, `description`, top-level `model`, and a nested `delegation.<harness>.*` block with harness-specific runtime settings (Claude Code reads top-level; Codex reads the nested block).

## Installing this as an agent

If you are an LLM agent reading this README to install the kit into the current project, follow the block matching your host. Each block is self-contained and does not ask the user to make sub-decisions.

### Host: Claude Code

```bash
/plugin marketplace add github.com/youhaowei/wystack-agent-kit
/plugin install wystack-agent-kit@wystack-agent-kit
```

Verify: `/plugin` should list `wystack-agent-kit` as installed. Tell the user to reload the session.

Next, if the project will use lifecycle skills, invoke `/wystack-agent-kit:setup-agent-kit` to create `.wystack/`. Skip if the user only wants design / writing / review skills.

### Host: Codex

```bash
codex plugin marketplace add github.com/youhaowei/wystack-agent-kit \
  --manifest .agents/plugins/marketplace.json
codex plugin install wystack-agent-kit
```

Verify: `codex plugin list` should include `wystack-agent-kit`. Tell the user to reload Codex.

### Host: Cursor / generic local-path host

1. Clone outside the project: `git clone https://github.com/youhaowei/wystack-agent-kit.git ~/code/wystack-agent-kit` (or any path the user prefers).
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

This is interactive. Don't auto-answer — surface its prompts to the user. Outcome: `.wystack/` directory at the project root with `workspace.md` and `storage.json`. The agent reads these on every subsequent skill invocation.

### Verifying the install worked

- `wystack-agent-kit:workspace` should resolve the project workspace without error.
- Listing skills should show entries prefixed `wystack-agent-kit:` (e.g. `wystack-agent-kit:prd`, `wystack-agent-kit:start-task`).
- Spawning a wystack-agent-kit agent (e.g. `principal`) should run on the intended model — sonnet for routine roles, opus for `principal`, `pm`, `designer`. If it inherits the parent's model instead, the install is using an older cached version; reload the host or reinstall.

### Common failures

- **Skills don't appear after install.** The host hasn't reloaded plugin metadata. Reload the session.
- **Lifecycle skill complains there is no workspace.** Run `wystack-agent-kit:setup-agent-kit` first.
- **Agent spawns at the wrong model tier.** Plugin version is `< 0.9.6`. Reinstall to pick up the top-level `model:` fix; older versions only set the nested field and Claude Code's Task tool ignored it.

## Build and deploy (contributors)

For the usual local development loop, deploy to both Claude Cowork and the Codex plugin cache:

```bash
bun run deploy
```

Variants:

```bash
bun run deploy --dry-run
bun run deploy wystack-agent-kit
bun run deploy --codex-mode copy
bun run deploy:claude
bun run deploy:codex
```

Build / upload helpers:

```bash
./scripts/build-dist.sh [plugin ...]
./scripts/build-dist.sh --deploy --no-zip [plugin ...]
./scripts/watch-deploy.sh [plugin ...]
```

After deploy, reload Claude / Codex to pick up changed plugin metadata.

## Codex migration

If you already have local skills or older plugins installed, audit overlaps before enabling this plugin in Codex:

```bash
bun scripts/manage_local_skills.js audit-overlaps
```

Recommended rollout:

1. Remove repo-backed standalone duplicates:
   ```bash
   bun scripts/manage_local_skills.js cleanup-repo-backed
   bun scripts/manage_local_skills.js cleanup-repo-backed --apply
   ```
2. Consolidate exact local duplicates across Codex, agents, and Claude:
   ```bash
   bun scripts/manage_local_skills.js consolidate-exact
   bun scripts/manage_local_skills.js consolidate-exact --apply
   ```
3. Resolve legacy standalone ambiguity:
   ```bash
   bun scripts/manage_local_skills.js resolve-ambiguity
   bun scripts/manage_local_skills.js resolve-ambiguity --apply
   ```

To make this repo the source of truth for your local Codex setup:

```bash
bun scripts/promote_codex_source_of_truth.js
bun scripts/promote_codex_source_of_truth.js --apply
```

Refresh the Codex plugin cache:

```bash
bun scripts/sync_codex_plugin_cache.js
bun scripts/sync_codex_plugin_cache.js --apply
```

Defaults to symlink mode so edits in this repo are reflected in the cache after Codex reloads. To test copied cache behavior:

```bash
bun scripts/sync_codex_plugin_cache.js --mode copy --apply
```

Use `--plugin wystack-agent-kit` to sync only this plugin. The script defaults to dry-run, reads the cache version from `.codex-plugin/plugin.json`, and refuses to replace unmarked cache directories without `--force`.
