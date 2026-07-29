---
name: handoff
description: "Consolidate a session's work into durable homes and emit a kickstart prompt for a fresh session. Use at the end of a working session — when context is heavy, the conversation is wrapping up, or work is passing to a new session or agent. Sibling to finish-task: finish-task closes a task, handoff closes a session."
---
# Handoff

Close a session: drain its work into the durable stores, then emit a prompt that starts the next session where this one left off.

No arguments. User-invoked, directly or via `wystack-agent-kit:next-task`'s heavy-context branch.

**Prerequisites.** Load `wystack-agent-kit:workspace` — every consolidation delegate requires it. Not set up → `wystack-agent-kit:setup-agent-kit`.

## Workflow

1. **Walk the session** — read back over this window's conversation (not the transcript on disk) and identify: tasks touched, decisions made, terms and cross-cutting principles that surfaced, loose ends not yet a task (distinct from `finish-task`'s review-loop deferrals, which finish-task triages itself), and docs the session's decisions outdate.

2. **Consolidate** — propose the full set of updates, recommend, and stop: an interactive checkpoint. Apply only what the user approves, drafting content from session context and delegating each write to its owner:

   | Residue | Home | Delegate |
   |---|---|---|
   | In-flight task context | the task body, made context-complete | `wystack-agent-kit:task-manager` |
   | Loose ends | a new task each | `wystack-agent-kit:new-task`, one per loose end |
   | Terms | a glossary note per term | `wystack-agent-kit:glossary` |
   | Design decisions (real alternatives, worth keeping) | spec Decisions section; PRD for product-level | `wystack-agent-kit:spec` / `wystack-agent-kit:prd` |
   | Stale methodology / domain docs | the doc itself | `wystack-agent-kit:wiki-librarian`, or the doc's typed skill |
   | Priority shifts | named in the kickstart prompt | none — a signal, never mutated here |

   The goal: every task the next session needs is context-complete on its own.

3. **Emit the kickstart prompt** — plain text, pasteable into any fresh session:

   ```
   Session: <what this session did, where it ended>
   Queue:   <in-focus task(s), in order, each with a one-line rationale>
   Context: <cross-cutting decisions and sequencing — session-level only>
   Next:    wystack-agent-kit:start-task <target>   # or wystack-agent-kit:next-task if no single clear target
   ```

   The prompt is the session's final message — no file, no trailing commentary; tell the user to copy it before the window closes.

## Rules

- **Derive, don't store** — the updated tasks and docs are the persistence; the prompt is transient, never written to a file.
- **Delegate, never reimplement** — task CRUD, doc edits, and ticket creation belong to the skills and agents that own them.
- **Session-level context only** — task-level detail (a file path, an acceptance criterion) in the prompt means step 2 left a task incomplete.
- **Terminal step** — handoff never invokes `next-task` as a skill call (naming it as prompt text is fine); `next-task` delegates *to* handoff.

## Edge cases

- **No tasks touched** — skip consolidation; still emit a prompt with intent, state, and a next command.
- **A proposal is declined** — skip that write; the residue stays unconsolidated and is named in the prompt.
- **Uncommitted code** — handoff never commits (that's `finish-task`); name the branch or worktree in the prompt so the next session checks it out.
