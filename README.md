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
python3 scripts/manage_local_skills.py audit-overlaps
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
   python3 scripts/manage_local_skills.py cleanup-repo-backed
   python3 scripts/manage_local_skills.py cleanup-repo-backed --apply
   ```

3. If you also have exact local duplicates across Codex, agents, and Claude, consolidate them:

   ```bash
   python3 scripts/manage_local_skills.py consolidate-exact
   python3 scripts/manage_local_skills.py consolidate-exact --apply
   ```

4. If you are adopting the current target state for shared globals and engineering-owned skills:

   ```bash
   python3 scripts/manage_local_skills.py resolve-ambiguity
   python3 scripts/manage_local_skills.py resolve-ambiguity --apply
   ```

5. Enable `engineering`, `marketing`, and `design` only after the overlap set is
   understood.

If this repo should become the source of truth for your local Codex setup, use:

```bash
python3 scripts/promote_codex_source_of_truth.py
python3 scripts/promote_codex_source_of_truth.py --apply
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
