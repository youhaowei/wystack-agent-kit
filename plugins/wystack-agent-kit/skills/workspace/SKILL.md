---
name: workspace
description: "Load the WyStack Agent Kit workspace context — storage mappings, project identity, provider capabilities, and local conventions. Use before planning, prioritization, task creation, or documentation workflows."
---

# Workspace Context

This skill owns the resolved-workspace *contract*: other lifecycle skills load it rather than re-deriving conventions. `setup-agent-kit` (creates the workspace) and `worktree` (its `.wystack` is gitignored) self-resolve because they run before the workspace is loadable — but through the same canonical procedure, never a private variant.

## Load the constitution

Read `docs/constitution.md` (plugin root) once — it stays in effect for the session. This is its runtime delivery point; no skill restates it.

## Resolve the workspace

Run the resolver block in `docs/storage-contract.md` § Location and resolution. It returns `{ root, mode, storageJson, exists }`. On `mode: unconfigured` or `none`, recommend `wystack-agent-kit:setup-agent-kit`. Every path below is relative to the resolved `root` — never assume `./.wystack`.

## Load and return

Read `storage.json` at `root` for providers, status vocabularies, and doc/task locations — `docs/storage-contract.md` carries the concepts and provider model, `docs/doc-model.md` the doc conventions and status ladder. Prefer that config over any assumption; never assume Notion unless `storage.json` or the user selects it. With `storage.json` absent: continue without work-item writes when the user is only brainstorming, reviewing, or reading code; recommend `setup-agent-kit` when they ask for a task or doc operation.

Return a compact setup summary:

```md
## Workspace

Project: {name}
Task provider: {provider} ({path_or_tool})
Doc provider: {provider} ({path_or_tool})
Domain docs: {single-context | multi-context | none}

Capabilities:

- search work items: {yes/no}
- create work items: {yes/no}
- update status: {yes/no}
- relations: {native/body-links/manual}
```

If setup is missing, return instead:

```md
Blocked: the workspace's `storage.json` is missing.
Recommendation: run `wystack-agent-kit:setup-agent-kit` and use local markdown unless this repo already has a tracker.
```
