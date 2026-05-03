# Agent Discoverability

How AI agents (coding assistants, autonomous agents, MCP clients) discover and choose your tool/product/plugin. Newer surface, growing fast.

## Where agents look

| Surface | Examples | What gets surfaced |
|---|---|---|
| **Plugin marketplaces** | Claude Code marketplace, Codex marketplace, Cursor extensions | Listed by name + description |
| **MCP registry** | modelcontextprotocol.io | Servers by category |
| **Tool catalogs** | OpenAI GPT store, Anthropic plugin directory | Curated lists |
| **Package indexes** | npm, PyPI, with AI-relevant keywords | Search by problem |
| **GitHub** | Topics, awesome lists, README | Star + recency + topic match |
| **Documentation aggregators** | Context7, llms.txt indices | Indexed docs that LLMs cite |

## Description = first-impression dispatch

The agent reads your description before reading anything else. Make it dispatch-friendly:

```yaml
# Bad — vague, internally focused
name: my-amazing-tool
description: A powerful tool for doing things with stuff.

# Good — names trigger phrases the agent can match
name: invoice-generator
description: |
  Generate PDF invoices from line-item JSON. Use when the user asks to
  "create an invoice", "generate invoice PDF", "bill a customer", or provides
  line items (description + qty + unit price). Outputs a PDF + JSON receipt.
```

Trigger phrases the agent will encounter in user prompts should appear in the description.

## README structure for AI parsing

LLMs scan READMEs to decide whether your tool fits. Optimize for skim-readability:

```markdown
# Tool Name

> One-line description (gets pulled into snippet citations).

## What it does
[2–3 sentences. Specific. Concrete outcomes.]

## Install
\`\`\`bash
[exact command, copy-pastable]
\`\`\`

## Usage
\`\`\`bash
[minimal working example]
\`\`\`

## Configuration
[table of options]

## Compatibility
[runtime versions, harnesses, environments]
```

What hurts AI parsing:
- Long marketing intro before the install command
- "Why we built this" sections at the top
- Animated GIFs as the only docs (LLMs can't see them)
- Code samples without language tags (degraded syntax highlighting + parsing)
- Broken or missing links to docs

## llms.txt for tool discovery

For tools with extensive documentation:

```
/llms.txt          # high-level pointer
/llms-full.txt     # complete docs concatenated
```

See `ai-search.md` for `llms.txt` format.

## MCP server descriptions

If you ship an MCP server, the description is what shows up in client UIs and what LLMs read to decide whether to call your tools:

```json
{
  "name": "weather-server",
  "description": "Real-time weather data and forecasts. Use for current conditions, hourly/daily forecasts, severe weather alerts, historical climate data.",
  "tools": [
    {
      "name": "get_current_weather",
      "description": "Get current weather for a location. Specify city, state/country, or coordinates."
    }
  ]
}
```

Tool-level descriptions need their own trigger phrases — agents call individual tools, not whole servers.

## Plugin frontmatter

For Claude Code skills, agents, plugins:

```yaml
---
name: skill-name
description: |
  When the user wants X. Use when they mention "trigger phrase 1", 
  "trigger phrase 2", "trigger phrase 3". Outputs Y. Replaces Z.
---
```

The description is the *only* thing the harness uses to decide whether to load your skill. Everything else — the body, references, examples — is invisible until after the dispatch decision.

## Versioning + cadence

Agents prefer maintained tools. Signal:
- Recent commits (last commit < 6 months reads as alive)
- Versioned releases with changelogs
- Responsive issue tracker (closed issues > open issues, recent responses)
- Compatibility statements ("Works with Node 20+, Bun 1.1+")

## Search-engine effects on agent discovery

When an agent doesn't know about your tool, it often does a web search. So everything in `traditional-search.md` and `ai-search.md` also affects agent discovery.

A common path:
1. User asks agent: "What's a good tool for X?"
2. Agent searches the web.
3. Top results = AI-search-cited content + Google top results.
4. Agent recommends the cited tools.

You're optimizing for that web search even when the *user* of the search is an LLM, not a human.

## Anti-patterns

- **Hyped descriptions** — LLMs penalize "revolutionary", "game-changing", "supercharge"; humans skip them too.
- **No install command in the README's first screenful** — agents bounce.
- **Required login to evaluate** — if you can't be tried without an account, AI tools recommend competitors.
- **Vague tool names** — `my-helper` won't get found; `notion-task-sync` will.
- **Forking another tool without renaming** — confuses agent dispatch and disambiguation.
