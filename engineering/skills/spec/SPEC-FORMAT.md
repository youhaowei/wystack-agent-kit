# Spec Format

What goes in a spec, how to size it, and the optional Domain Model section.

## What a spec captures

### Concepts and framing

- **What this is / isn't** — one paragraph positioning.
- **Key concepts** — the vocabulary of the system. Define once, use everywhere. Cross-reference the project glossary (see `engineering:glossary`).
- **Design principles** — the rules that guide decisions.

### Architecture (the core)

- **Component boundaries** — what modules/services exist, what each owns, how they communicate. Diagram preferred.
- **Data flow** — how data moves through the system end-to-end.
- **Decisions (ADRs)** — trade-offs considered, what was chosen and why, reversibility. _"We use X because Y, not Z because W"_ is the atomic unit. Each entry: **decision / alternatives / why / reversibility**. Decisions live inside the spec, not in a separate folder.
- **Integration points** — where this touches other systems, dependencies.
- **Migration strategy** — if changing existing architecture, how to get from A to B.

### Domain Model (optional — for DDD-committed projects)

Include when the system has meaningful domain complexity. Skip for CRUD-shaped or infrastructure-level work.

- **Bounded contexts** — when the system spans multiple contexts, name them and draw the boundary. Each context has its own language; reference the glossary.
- **Aggregates** — entity clusters with consistency boundaries. Name the aggregate root and what it protects. _"An Application is an aggregate rooted at Applicant; Household and Document belong inside it."_
- **Domain events** — named business events that other parts react to. _"ApplicationSubmitted"_, _"HouseholdSizeChanged"_. When eventual consistency matters, make events explicit.
- **Anti-corruption layers** — when integrating with external systems whose model doesn't match ours, describe the translation.
- **Context map** — only for systems that span multiple bounded contexts; describe how contexts relate (upstream/downstream, shared kernel, anti-corruption).

These sections use the vocabulary of the glossary. If a term appears in the Domain Model but not in the glossary, add it via `engineering:glossary` before finalizing.

### Open Questions

- What needs spikes or further design.
- What's explicitly deferred.

## Level of detail

**Too light (just vibes):**

> "The engine runs workflows with agents."

**Right level (architecture + decisions):**

> "The engine has two primitives: a concurrency pool (max N agents, auto-fills from ready work) and an ask queue (agents post human decisions, engine parks and resumes). We chose append-only JSONL for execution logs over SQLite because it matches the existing session persistence pattern and supports crash recovery via replay."

**Too heavy (implementation code):**

> ```typescript
> interface ExecutionRecord = { t: 'node_start', nodeId: string, ts: number } | ...
> ```

Describe shape and intent. TypeScript interfaces, schemas, and record formats belong in the codebase, not the spec.
