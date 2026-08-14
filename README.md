# WyStack Agent Kit

A small set of high-signal skills for software product work.

[![npm](https://img.shields.io/npm/v/@wystack/agent-kit)](https://www.npmjs.com/package/@wystack/agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Harnesses](https://img.shields.io/badge/runs%20on-Claude%20Code%20·%20Codex%20·%20Cursor%20·%20Grok%20·%20Pi-black)

WyStack Agent Kit adds judgment where a capable coding agent benefits from a specialized frame. It does not impose a lifecycle, task tracker, workspace format, role hierarchy, or orchestration system.

## Skills

| Area | Skills |
|---|---|
| Product definition | `brainstorm`, `prd`, `story`, `glossary` |
| Technical decisions | `spec`, `adr`, `breakdown`, `estimate` |
| Engineering quality | `cross-review`, `verify`, `retro`, `improve-codebase` |
| Product experience | `frontend-design`, `ux-writing`, `copywriting`, `discoverability` |

Each skill owns a distinct transformation:

- `brainstorm` turns an unclear idea into a reasoned direction.
- `prd` defines product outcomes, scope, and success.
- `story` expresses a user need as testable behavior.
- `glossary` gives a domain term one canonical meaning.
- `spec` turns requirements into an implementable technical design.
- `adr` records a consequential architectural decision and its tradeoffs.
- `breakdown` creates independently valuable work slices.
- `estimate` sizes work from scope, risk, and uncertainty.
- `cross-review` runs independent, evidence-grounded review angles and returns an explicit gate result.
- `verify` tests runtime claims with proportionate evidence.
- `retro` turns completed work into actionable learning.
- `improve-codebase` finds high-leverage structural improvements.
- `frontend-design` explores distinct static directions, then implements the chosen interface.
- `ux-writing` clarifies interface actions, states, and recovery.
- `copywriting` writes persuasive product and marketing copy.
- `discoverability` improves how a product is found by people and agents.

Use one skill or compose several naturally. The agent should follow the user's instructions and the project's existing conventions; a skill's built-in format is only a fallback.

`cross-review` is the one host-specific skill: it uses the Workflow runtime shared with `pr-gate`. On hosts without that runtime, use the host's native review.

## Design principles

- One skill earns its place by owning a distinct judgment or artifact.
- Descriptions are short routing signals, not compressed manuals.
- Skill bodies add only constraints and knowledge that materially improve the result.
- References load only when their branch is relevant.
- Completion criteria describe the outcome without scripting every move.
- Project and user templates override bundled defaults.

The writing approach is influenced by Matt Pocock's [`writing-for-agents`](https://github.com/mattpocock/skills): minimize always-loaded context, expose real decision branches, and remove instructions a capable model already follows.

## Install

### Claude Code

```bash
/plugin marketplace add github.com/youhaowei/wystack-agent-kit
/plugin install wystack-agent-kit@wystack-agent-kit
```

Reload the session after installation.

### Codex

```bash
codex plugin marketplace add github.com/youhaowei/wystack-agent-kit \
  --manifest .agents/plugins/marketplace.json
codex plugin install wystack-agent-kit
```

Reload Codex after installation.

### Cursor or another local-path host

```bash
git clone https://github.com/youhaowei/wystack-agent-kit.git
```

Point the host at `plugins/wystack-agent-kit` in the checkout.

### Grok Build

```bash
grok plugin install github.com/youhaowei/wystack-agent-kit#plugins/wystack-agent-kit --trust
grok plugin enable wystack-agent-kit
```

### Pi

```bash
git clone https://github.com/youhaowei/wystack-agent-kit.git
cd wystack-agent-kit
pi install .
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for local deployment and validation. See [UPSTREAM.md](UPSTREAM.md) for source lineage and the concept-port policy.

## License

MIT
