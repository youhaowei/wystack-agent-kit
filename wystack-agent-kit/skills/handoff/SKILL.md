---
name: handoff
description: "Consolidate a session's work into durable homes and emit a kickstart prompt for a fresh session. Use at the end of a working session — when context is heavy, the conversation is wrapping up, or work is passing to a new session or agent. Sibling to finish-task: finish-task closes a task, handoff closes a session."
---
# Handoff

Close a session: drain its work into the durable stores, then emit a prompt that starts the next session where this one left off. The sibling of `finish-task` — that closes a *task*, this closes a *session* (one continuous working window, which may span several tasks or none). User-invoked, directly or via `next-task`'s heavy-context branch; takes no arguments.

handoff writes **no durable artifact** — the tasks and docs it updates are the persistence; the prompt itself is transient. Derive, don't store.

**Prerequisites.** Load `wystack-agent-kit:workspace` — the consolidation step's delegates (`task-manager`, `new-task`, `spec`, `prd`, `wiki-librarian`) all require it; loading it up front fails fast if the kit isn't set up. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Workflow

### 1. Walk the session

Read back over the current session's context — the conversation in this window, not the session transcript on disk. Identify:

- **Tasks touched** — work items started, advanced, discussed, or discovered.
- **Decisions made** — design choices, scope boundaries, rejected alternatives.
- **Terms and principles** — vocabulary or cross-cutting rules that surfaced.
- **Loose ends** — follow-up work surfaced but not yet a task (distinct from `finish-task`'s review-loop deferrals, which finish-task triages itself).
- **Stale docs** — methodology or domain docs the session's decisions outdate.

### 2. Consolidate into durable homes

Each kind of session residue belongs in a durable store. Propose the full set of updates, recommend the consolidation, and stop — this is an interactive checkpoint. Apply only what the user approves, then **delegate** the writes — handoff drafts the content from session context, the delegate persists it; handoff does not reimplement these:

| Residue | Home | Delegate to |
|---|---|---|
| In-flight task context | the task body, made context-complete | `wystack-agent-kit:task-manager` |
| Loose ends | a new task each | `wystack-agent-kit:new-task` — one invocation per loose end |
| Terms (ubiquitous language) | a glossary note per term — the single canonical home; specs and PRD cite it | `wystack-agent-kit:glossary` |
| Design decisions (real alternatives, worth keeping) | the spec's Decisions section, or the PRD for product-level | `wystack-agent-kit:spec` / `wystack-agent-kit:prd` |
| Stale methodology / domain docs | the doc itself | `wystack-agent-kit:wiki-librarian` — or the doc's typed-doc skill (`prd`, `spec`) |
| Priority shifts | named in the kickstart prompt | none — surfaced as a signal, never mutated here |

The goal: every task the next session needs is context-complete on its own. Context that lands in a task body does not also go in the kickstart prompt.

### 3. Emit the kickstart prompt

Emit one prompt — plain text, pasteable into any fresh session (Claude Code, Codex, anywhere). It carries:

- **Intent and state** — what the session was doing and where it ended.
- **The live queue** — the in-focus task(s); if the session leaves an ordered cluster, the sequence and its rationale.
- **Cross-cutting context** — decisions, sequencing rationale, and priority-shift signals that span tasks. Session-level only — never task-level detail (a file path, an acceptance criterion), which now lives in the task bodies.
- **The next command** — `wystack-agent-kit:start-task <target>` for the task to resume; or `wystack-agent-kit:next-task` when the session leaves no single clear target (see Edge cases).

Shape:

```
Session: <what this session did, where it ended>
Queue:   <in-focus task(s), in order, each with a one-line rationale>
Context: <cross-cutting decisions and sequencing — session-level only>
Next:    wystack-agent-kit:start-task <target>   # or wystack-agent-kit:next-task if no single clear target
```

The prompt is the only output. handoff does not write it to a file — emit it as the session's final message, with no trailing commentary, and tell the user to copy it before the window closes.

## Edge cases

- **No tasks touched** — skip consolidation; still emit a prompt carrying intent, state, and a recommended next command.
- **A proposal is declined** — skip that write; the residue stays unconsolidated and is named in the prompt instead.
- **No clear single target** — the prompt's next command recommends running `wystack-agent-kit:next-task` in the fresh session rather than naming a `start-task` target.
- **Uncommitted code in the working tree** — handoff is a context ritual, not a code-landing gate (that is `finish-task`); it does not commit. Name the branch or worktree in the kickstart prompt so the next session checks the code out.

## Principles

- **Delegate, never reimplement** — task CRUD, doc edits, and ticket creation belong to the skills and agents that own them.
- **Session-level context only** — task-level detail in the prompt is a sign step 2 left a task incomplete.
- **One-directional** — handoff is a terminal step. It never invokes `next-task` as a skill call (it may name `next-task` as text in the kickstart prompt); `next-task` delegates *to* handoff.
