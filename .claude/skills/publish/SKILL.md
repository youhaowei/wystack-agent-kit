---
name: publish
description: "Publish, version-bump, and distribute a plugin in this wystack-plugins repo. Use when the user says \"publish\", \"release\", \"bump version\", \"deploy plugin\", \"ship engineering/design\", \"cut a new version\", or asks to push plugin changes to Claude Cowork / Codex / the marketplace. Handles synced version bumps across dual manifests, deploy via existing scripts, and verification."
---

# Publish Plugin

Bump the version, deploy to Claude Cowork + Codex caches, verify the install picked it up.

## Input

Plugin to publish: `$ARGUMENTS` — `engineering`, `design`, or omit for all changed plugins.

## Prerequisites

- Run from repo root (`/Users/youhaowei/Projects/wystack-plugins`).
- `bun` available; `fswatch` only needed for the watch flow.
- Working tree clean for the plugin being published, **or** the user explicitly accepts publishing dirty.

## Architecture

| Concern | Where | Why |
|---|---|---|
| Version + manifest edits | Main agent | Two files per plugin must stay in sync |
| Build + deploy | `scripts/deploy.sh` (`bun run deploy`) | Already does Claude + Codex in one shot |
| Verification | Main agent | Confirm caches updated, warn user to reload |

## Workflow

### 1. Pick the plugin(s)

If `$ARGUMENTS` empty: detect which plugins have changes since last commit:

```bash
git diff --name-only HEAD | awk -F/ '{print $1}' | grep -E '^(engineering|design)$' | sort -u
```

If multiple, ask the user which to publish (or all).

### 2. Choose bump

Read current version from `<plugin>/.claude-plugin/plugin.json`.

**Versioning policy in this repo: SemVer with shifted slots while pre-1.0.**

While a plugin is `0.X.Y`, the first digit is locked (semantic identity) and the remaining slots shift down one level:

| Slot | Pre-1.0 (`0.X.Y`) | Post-1.0 (`X.Y.Z`) |
|---|---|---|
| 1st (`0` / `X`) | Locked — only flips on a real 1.0 release | major |
| 2nd (`X` / `Y`) | **major** — breaking changes | minor |
| 3rd (`Y` / `Z`) | **minor** — additive changes & fixes | patch |
| separate patch | none — small fixes ride the next minor | yes |

Bump table (use the slot that matches the plugin's current track):

| Change shape | Pre-1.0 bump | Post-1.0 bump |
|---|---|---|
| New skill / new agent / new capability | 3rd digit | minor |
| New step inside an existing skill | 3rd digit | minor |
| Skill description / trigger wording change | 3rd digit | minor (description **is** the trigger contract) |
| Security or correctness fix | 3rd digit | patch |
| Removed or renamed skill / agent | 2nd digit | major |
| Breaking schema or argument change | 2nd digit | major |
| Marketplace metadata only (`marketplace.json`) | no bump | no bump |
| Repo-internal typo, comment, or doc fix | no bump on its own — rides next release | no bump on its own — rides next release |

**1.0 graduation** is a judgment call, not a mechanical trigger. Promote when:
- The plugin's user-visible surface (skill names, agent names, descriptions) has stabilized
- You'd treat any future skill rename or removal as a contract break worth signalling
- Confirm with the user before flipping `0.X.Y → 1.0.0`

Show the recommendation to the user (`current 0.7.0 → 0.7.1 (3rd digit, pre-1.0 minor: added shepherd step to finish skill)`) and confirm before editing.

### 3. Sync version across both manifests

Each plugin has **two** version fields that must match:

- `<plugin>/.claude-plugin/plugin.json` → `version`
- `<plugin>/.codex-plugin/plugin.json` → `version`

Edit both. Marketplace files (`.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json`) don't carry version — leave them.

### 4. Commit the bump

One commit per plugin, message style:

```
chore(<plugin>): bump version to <new-version>

<one-line summary of what's in this version>
```

Stage only the two manifest files for the bump commit. Other pending changes stay separate (use the `commit` skill if needed).

### 5. Deploy

```bash
bun run deploy <plugin>           # both Claude + Codex
bun run deploy --dry-run <plugin> # preview if user wants to check first
bun run deploy:claude <plugin>    # Cowork only
bun run deploy:codex <plugin>     # Codex cache only
```

Watch the output. Common destinations:

- Claude Cowork → `~/.claude/plugins/marketplaces/local-desktop-app-uploads/wystack-<plugin>/`
- Codex cache → `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`

Codex caches by version, so a bump creates a new versioned dir — old versions stay until manually pruned.

### 6. Verify

Spot-check the deployed copy reflects the bump:

```bash
cat ~/.claude/plugins/marketplaces/local-desktop-app-uploads/wystack-<plugin>/.claude-plugin/plugin.json | grep version
ls ~/.codex/plugins/cache/*/<plugin>/  # confirm new version dir exists
```

Tell the user to reload Cowork / Codex to pick up the new version.

### 7. Push (optional)

If the user wants the bump on the remote: `git push`. Don't push unless asked.

## Rules

- **Never publish dirty silently.** If `git status` is dirty in the plugin dir, surface what's uncommitted and ask before bumping.
- **Both manifests change together.** A version mismatch between `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` is the most common failure mode — verify they match after editing.
- **Edit source, not cache.** `~/.claude/plugins/cache/**` and `~/.codex/plugins/cache/**` are deploy targets; never edit them.
- **Don't tag unless asked.** This repo isn't currently tagging releases. Don't introduce that on your own.

## When NOT to use

- Just iterating on a skill body and want to test → use `./scripts/watch-deploy.sh <plugin>` instead, no version bump needed.
- Editing the marketplace metadata (`marketplace.json`) — that's not a release, it's repo config.

## Output

Report back to the user:

```
Published <plugin> <old> → <new>
- Manifests:   bumped + committed (<short-sha>)
- Cowork:      <path>
- Codex cache: <path>
- Reload:      <claude-cowork-or-codex> to pick up the change
```
