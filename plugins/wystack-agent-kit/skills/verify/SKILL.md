---
name: verify
description: "Confirm a feature works at runtime — exercise its golden path and edge cases, capture evidence, and report. Use after implementing a change, or when asked to verify or runtime-check that something actually works. Skip pure-logic changes with no runtime surface — verify proves runtime behavior, tests protect contracts."
---
# Verify

Prove a feature works by running it; tests passing is not proof. verify orchestrates and judges — subagents exercise the runtime and return evidence, never a verdict.

`$ARGUMENTS` — a feature, ticket, branch, or "what I just changed". A ticket in context supplies the golden path and edge cases through its acceptance criteria.

**Prerequisites.** Load `wystack-agent-kit:workspace` — it provides `verify.json` (how to exercise this project's runtime) and the artifacts directory.

```json
{
  "ui":     { "start": "bun run dev", "url": "https://app.localhost", "routes": ["/", "/login"] },
  "cli":    { "run": "bun run cli" },
  "server": { "start": "bun run server", "health": "http://localhost:3000/health" },
  "checks": ["bun run type-check", "bun run test", "bun run verify:email"]
}
```

Every field is optional. `checks` is the extension point — anything `ui`/`cli`/`server` can't reach (a third-party integration, a delivery side effect, a visual diff) becomes a script added here; writing that script is how a setup gap gets closed. If `verify.json` is missing, ask how the runtime starts and is reached, write it, and continue — or let `wystack-agent-kit:setup-agent-kit` seed it.

## Workflow

1. **Define the contract** — golden path plus key edge cases, from the ticket's acceptance criteria or the change itself.
2. **Pick the surfaces** — UI, CLI, server, checks, per `verify.json`.
3. **Dispatch a worker per surface** — in parallel, single message. UI → the installed browser-automation subagent (e.g. `agent-browser`); CLI / server / checks → a worker subagent. Brief each with its contract slice, its `verify.json` entry, and the run's evidence directory (`artifacts/verify/<run>/` in the workspace). Each captures all evidence (screenshots, GIFs, output, exit codes, logs) there and returns, **per contract item, `PASS` / `FAIL` / `UNREACHABLE` plus the evidence path — never a verdict on whether the feature works, only what it observed.**

   Evidence is transient — `wystack-agent-kit:cleanup` prunes old runs.
4. **Close gaps** — any `UNREACHABLE` item is a setup gap: report what's missing and the fix (a `checks` script, a tool, an instruction). Don't skip it, don't hand it off.
5. **Check the contract** — compare the workers' evidence against the full contract, golden path *and* edge cases. The verdict is verify's, not a worker's. An unverified edge case is an unverified feature.
6. **Report** — evidence inline for a quick check, an HTML report for a substantial one. Never report "verified" without evidence; name every open gap.
