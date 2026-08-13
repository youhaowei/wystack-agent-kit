# Contributing

Local development, deploy, and Codex-migration workflows for WyStack Agent Kit.

## Build and deploy

For the usual local development loop, deploy to every detected tool (Claude Cowork, Claude Code CLI, Codex, Cursor, Grok):

```bash
bun run deploy
```

Variants:

```bash
bun run deploy --dry-run            # preview; shows which tools were detected
bun run deploy --codex-mode copy    # copy instead of symlink (rare)
bun run deploy:claude               # Cowork only
bun run deploy:cc                   # Claude Code CLI install-cache only
bun run deploy:codex                # Codex cache only
bun run deploy:cursor               # Cursor local-plugin only
bun run deploy:grok                 # Grok Build plugin install only
```

Build / upload helpers:

```bash
./scripts/build-dist.sh [plugin ...]
./scripts/build-dist.sh --deploy --no-zip [plugin ...]
./scripts/watch-deploy.sh [plugin ...]
```

After deploy, reload the host to pick up changed plugin metadata. Codex, the Claude Code CLI cache, and Cursor are symlinks to source — they read live files on next launch, but each tool still needs a restart to re-read metadata. Cursor additionally needs Settings → Features → "Include third-party Plugins" enabled. Grok local-path installs keep a `source_path` to the repo, so skill bodies stay live; re-run `bun run deploy:grok` (or `grok plugin install … --trust`) after structural or manifest changes.

## Releasing

Four plugin manifests carry a version and must stay in sync:

- `plugins/wystack-agent-kit/.claude-plugin/plugin.json`
- `plugins/wystack-agent-kit/.codex-plugin/plugin.json`
- `plugins/wystack-agent-kit/.cursor-plugin/plugin.json`
- `plugins/wystack-agent-kit/.grok-plugin/plugin.json`

Bump all four together, commit, then `bun run deploy`. The root `package.json` version is the npm package version — align it on a publish.

## Codex migration

If you already have local skills or older plugins installed, audit overlaps before enabling this plugin in Codex:

```bash
bun scripts/manage_local_skills.js audit-overlaps
```

Recommended rollout (each command is dry-run by default; add `--apply` to act):

```bash
# 1. Remove repo-backed standalone duplicates
bun scripts/manage_local_skills.js cleanup-repo-backed --apply

# 2. Consolidate exact local duplicates across Codex, agents, and Claude
bun scripts/manage_local_skills.js consolidate-exact --apply

# 3. Resolve legacy standalone ambiguity
bun scripts/manage_local_skills.js resolve-ambiguity --apply
```

To make this repo the source of truth for your local Codex setup:

```bash
bun scripts/promote_codex_source_of_truth.js --apply
```

Refresh the Codex plugin cache:

```bash
bun scripts/sync_codex_plugin_cache.js --apply
```

Defaults to symlink mode so edits in this repo reflect in the cache after Codex reloads. Use `--mode copy --apply` to test copied-cache behavior, and `--plugin wystack-agent-kit` to sync only this plugin. The script reads the cache version from `.codex-plugin/plugin.json` and refuses to replace unmarked cache directories without `--force`.
