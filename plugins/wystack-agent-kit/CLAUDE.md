# Contributing to the plugin

This repository is skill-only. Runtime behavior lives in `skills/`; optional domain material lives in `references/` or beside the skill that uses it.

## Skill standard

Use Matt Pocock's `writing-for-agents` method as the default editing frame:

- Keep a skill only when it owns a distinct judgment or artifact with a recognizable trigger word.
- Make `description` a concise routing signal. Name the real branches; do not pack the procedure into frontmatter.
- Assume a capable model and a capable host. Remove generic advice, tool narration, and duplicated platform rules.
- Spend context only on constraints, traps, and domain knowledge that change the result.
- Put branch-specific detail in a reference and tell the agent exactly when to read it.
- Prefer an outcome and completion criterion over rigid choreography.
- Follow the user's requested format, then project conventions, then a minimal built-in fallback.

Do not add lifecycle conductors, task-provider adapters, workspace setup, generic role agents, or skills that merely rename normal agent behavior.

## Layout

- `skills/<name>/SKILL.md` — portable skill behavior.
- `skills/<name>/agents/openai.yaml` — optional interface metadata; keep it factual and short.
- `skills/<name>/*.md` or `skills/<name>/references/` — material used only by that skill.
- `references/` — material shared by several retained skills.

## Completion bar

A skill change is complete when:

- every retained skill has valid frontmatter and a unique semantic boundary;
- every referenced file exists and every bundled file has a real reader;
- manifests describe the current surface and share one version;
- removed skills are absent from docs, metadata, package entry points, and distribution output;
- validation passes without relying on deleted workspace or agent machinery.
