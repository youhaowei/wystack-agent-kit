# WyStack Plugins

Private marketplace of agent role definitions, skills, and tools.

Each subdirectory is an independently installable plugin containing domain-specific
agent roles and the knowledge they need. The repo now ships dual packaging for
both Claude and Codex:

- Claude manifests live under `.claude-plugin/`
- Codex manifests live under `.codex-plugin/`
- Codex marketplace metadata lives at `.agents/plugins/marketplace.json`

## Plugins

| Plugin | Purpose |
|--------|---------|
| `engineering/` | Development lifecycle — PM, principal, tech lead, QA, devops |
| `marketing/` | Growth & content — strategy, copy, SEO, CRO, acquisition, analytics |
| `design/` | UI design direction, review, polish, and Figma iteration |

## Install

### Pi

This repo is a local Pi package. From the repo root:

```bash
pi install .
```

Loaded resources:

- Plugin skills from `engineering/skills`, `marketing/skills`, and `design/skills`
- WyStack role commands from `engineering/agents`, `marketing/agents`, and `design/agents`
- A `wystack_agent` read-only subagent tool that runs a role brief in a separate `pi -p` process
- An `agent_browser` tool and `/browser` command wrapping the `agent-browser` CLI

For MCP/Notion, install `pi-mcp-adapter` separately:

```bash
pi install npm:pi-mcp-adapter
```

Useful commands after install/reload:

```text
/wystack-agents                 # list loaded role briefs
/engineering-principal <task>   # run a role brief in the current session
/marketing-strategist <task>
/design-designer <task>
/skill:code-review <args>       # invoke a plugin skill
/browser open https://example.com
/browser snapshot -i
```

For Notion via MCP OAuth, add the official Notion MCP server to your shared MCP config and authenticate with `/mcp-auth notion` inside Pi.

If Pi is already running, use `/reload` after changing this package.

### Claude Code

Add as a local plugin source pointing to the specific plugin directory:

```json
{
  "type": "local",
  "path": "/path/to/wystack/plugins/marketing"
}
```

Or register the repo as a Claude marketplace via `./.claude-plugin/marketplace.json`.

### Codex

Install a plugin directly from one of the plugin directories:

```json
{
  "type": "local",
  "path": "/path/to/wystack-plugins/engineering"
}
```

Or register the repo as a Codex marketplace using:

```text
/path/to/wystack-plugins/.agents/plugins/marketplace.json
```

Codex's plugin marketplace spec expects repo entries to resolve through
`./plugins/<plugin-name>`. This repo includes `plugins/engineering`,
`plugins/marketing`, and `plugins/design` as symlinks to the real plugin
directories, and the marketplace points at those shim paths.

## Cowork Distribution

Claude Cowork loads plugins from `~/.claude/plugins/marketplaces/local-desktop-app-uploads/wystack-<plugin>/`. Because Cowork's marketplace namespace collides with Anthropic's built-in plugins, each Cowork-deployed plugin is renamed with a `wystack-` prefix:

- `plugin.json` `name` → `wystack-<plugin>`
- Every `<plugin>:X` agent/skill reference in `*.md` → `wystack-<plugin>:X`

Source files are untouched; the rewrite is applied to a staged copy. The CLI install keeps using the bare names.

### Build + deploy

```bash
# Build zips into dist/ (for manual Cowork upload via the desktop app)
./scripts/build-dist.sh [plugin ...]

# Deploy directly to the Cowork marketplace dir (skip the upload step)
./scripts/build-dist.sh --deploy --no-zip [plugin ...]

# Watch sources and auto-deploy on change (requires: brew install fswatch)
./scripts/watch-deploy.sh [plugin ...]
```

After a deploy, reload Cowork to pick up the new content.

### Deploy to Claude and Codex

For the usual local development loop, deploy to both Claude Cowork and the Codex
plugin cache with:

```bash
bun run deploy
```

This runs `build-dist.sh --deploy --no-zip` for Claude and
`sync_codex_plugin_cache.js --force --apply` for Codex. It defaults Codex to
symlink mode so this repo remains the active source of truth.

Useful variants:

```bash
bun run deploy --dry-run
bun run deploy engineering
bun run deploy --codex-mode copy
bun run deploy:claude
bun run deploy:codex
```

## Notes

- The skill content is shared across both harnesses.
- Codex compatibility does not require a separate copy of every skill. The
  packaging is Codex-specific; the skill bodies stay shared unless the harness
  behavior actually differs.
- A few workflow docs still use historical slash-command labels like `/prd` or
  `/spec`. In Codex, treat those as workflow names, not a requirement for a
  slash-command UI surface.

## Codex Migration

If you already have local skills or older plugins installed, audit overlaps
before enabling these plugins in Codex:

```bash
bun scripts/manage_local_skills.js audit-overlaps
```

This checks the repo plugin skills against:

- `~/.codex/skills`
- `~/.agents/skills`
- `~/plugins/*`

The most likely collision surface is an older local plugin or a standalone skill
with the same name. In practice:

- `engineering` is likely to overlap with an older `work` plugin
- `marketing` is likely to overlap with standalone marketing skills already
  installed in `~/.agents/skills`

Recommended rollout:

1. Run the overlap audit.
2. Remove repo-backed standalone duplicates first:

   ```bash
   bun scripts/manage_local_skills.js cleanup-repo-backed
   bun scripts/manage_local_skills.js cleanup-repo-backed --apply
   ```

3. If you also have exact local duplicates across Codex, agents, and Claude, consolidate them:

   ```bash
   bun scripts/manage_local_skills.js consolidate-exact
   bun scripts/manage_local_skills.js consolidate-exact --apply
   ```

4. If you are adopting the current target state for shared globals and engineering-owned skills:

   ```bash
   bun scripts/manage_local_skills.js resolve-ambiguity
   bun scripts/manage_local_skills.js resolve-ambiguity --apply
   ```

5. Enable `engineering`, `marketing`, and `design` only after the overlap set is
   understood.

If this repo should become the source of truth for your local Codex setup, use:

```bash
bun scripts/promote_codex_source_of_truth.js
bun scripts/promote_codex_source_of_truth.js --apply
```

What it does:

- backs up overlapping standalone skills from `~/.codex/skills` and
  `~/.agents/skills`
- replaces them with symlinks back to this repo
- updates the legacy `~/plugins/work/skills/*` overlap set to point at the
  `engineering` plugin skills in this repo

Current behavior is source-of-truth oriented:

- it syncs all standalone skill overlaps by actual skill name
- it syncs `work` -> `engineering`
- the design review skill is exposed as `design-review`, so it no longer collides
  with the standalone code review skill named `review`

### Refresh the Codex plugin cache

Codex installs local plugins into a versioned cache under
`~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`. To make this repo the
active local development source for installed Codex plugins, refresh that cache:

```bash
bun scripts/sync_codex_plugin_cache.js
bun scripts/sync_codex_plugin_cache.js --apply
```

By default this uses symlinks, so edits in this repo are reflected in the cache
after Codex reloads plugin metadata. To test copied cache behavior instead:

```bash
bun scripts/sync_codex_plugin_cache.js --mode copy --apply
```

Use `--plugin engineering` to sync one plugin. The script defaults to dry-run,
reads each cache version from `.codex-plugin/plugin.json`, and refuses to replace
unmarked cache directories unless `--force` is passed.
