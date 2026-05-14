---
name: new
description: "Create a new task in the Notion Tasks database with codebase-aware scope and estimate suggestions. Use when the user wants to capture new engineering work, turn an idea into a task, or write up follow-on implementation work."
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


# New Task

Create a codebase-informed task in Notion with estimates, acceptance criteria, and scope.

## Input

Task description: `$ARGUMENTS`

If no argument, use the harness's native question UI to ask what needs to be done.

## Prerequisites

Load these into YOUR context (needed for orchestration):

```
Load the installed `notion-workspace` skill or equivalent workspace context for the current harness.
Load the installed `engineering:estimation` skill or equivalent estimation guidance before sizing work.
```

## Architecture

| Concern | Where | Why |
|---------|-------|-----|
| Orchestration, user interaction | **Main agent** | Needs conversation history |
| Codebase exploration | **`Explore` subagent** | File contents stay out |
| Notion writes | **`notion-writer` subagent** | Confirmation noise stays out |

## Workflow

### 1. Gather Description

If `$ARGUMENTS` is empty, ask via the harness's native question UI:
- **Question**: "What needs to be done?"
- **Header**: "New task"
- **Options**:
  - **Bug** — "Something is broken or behaving incorrectly"
  - **Feature** — "New functionality or enhancement"
  - **Tech Debt** — "Refactoring, cleanup, or infrastructure improvement"
  - **Research** — "Investigate an approach, library, or design question"

After selection, ask for a brief description of the work.

### 2. Identify Project

Infer from the **current working directory name** (last path segment). Map common directory names to known projects — e.g., `knowledgebase` → Knowledgebase, `powker` → Powker, `rincon` → Rincon — Tucson Wedding Marketplace, `workforce` → WorkForce.

If no match, ask the user which project.

### 3. Explore Codebase

Spawn an **`Explore` subagent** to analyze codebase impact. Prompt:

```
Task: "{description}"
Project: {project_name}

Analyze:
1. **Affected files** — paths + brief rationale
2. **Implementation complexity** — files changed, new vs existing patterns
3. **Suggested estimate** — use scale (XS/S/M/L/XL/XXL) with reasoning:
   - XS: Single-file, <20 lines, pattern-following
   - S: 1-2 files, <50 lines, straightforward
   - M: 2-4 files, new logic, minor design decisions
   - L: 4-8 files, architectural decisions, multiple modules
   - XL: 8+ files, cross-cutting, needs spec
   - XXL: Split first
4. **Suggested acceptance criteria** — concrete and verifiable, referencing actual file paths. Use `docs/testing-philosophy.md`; do not invent a test criterion unless the risk earns one.
5. **Potential blockers** — dependencies, unknowns, prerequisites

Exploration depth: "quick" for likely S/M, "medium" for likely L+.
```

### 4. Present Task Proposal

Synthesize the exploration results and present to the user:

```
### New Task Proposal

**Title**: {suggested title}
**Type**: {type}
**Priority**: {suggested — Medium unless clearly urgent}
**Estimate**: {size} ({model tier})

**Description**:
{refined description based on codebase analysis}

**Acceptance Criteria**:
1. {criterion referencing code}
2. {verification criterion: strategic test, runtime check, screenshot, typecheck, or lint}
3. {doc criterion if M+}

**Affected Files**: {list}
```

Use the harness's native question UI for confirmation:
- **Question**: "Create this task?"
- **Header**: "Confirm"
- **Options**:
  - **Create as-is** — "Create with the suggested properties"
  - **Edit first** — "I want to change some details"
  - **Cancel** — "Don't create"

If "Edit first": ask what to change, update, and re-present.

### 5. Create in Notion

Spawn **`notion-writer`** subagent to create the task:

```
Create a task in the Notion Tasks database.

Tasks database data source: collection://24cd48cc-af54-8069-afc6-000b3ce9c348

Properties:
- Task name: "{title}"
- Status: "Not Started"
- Priority: "{priority}"
- Estimates: "{estimate}"
- Task type: "{type}"
- Project: ["{project_url}"]

Page content:
## Description
{description}

## Acceptance Criteria
{numbered list}

## Scope
- Files: {affected files}
- Tests: {required per estimation tier}
- Docs: {required per estimation tier}
```

### 6. Offer Next Steps

After creation, present options:

```
Task created: TASK-{id} — {title}
Notion: {url}
```

Use the harness's native question UI:
- **Question**: "What's next?"
- **Header**: "Next step"
- **Options**:
  - **Plan it** — "Invoke the `engineering:groom` skill to create an implementation plan"
  - **Start working** — "Invoke the `engineering:start` skill to begin implementation"
  - **Done** — "I'll come back to it later"

## Edge Cases

- **Duplicate detection**: Before creating, mention if similar-sounding tasks exist in the project (check researcher results if available from a recent `engineering:next` run)
- **XXL estimate**: Suggest splitting into sub-tasks before creating
- **Research type**: Default status to "Later" per workspace conventions

## Notes

- Uses cached DB schema from workspace skill — never fetch schema at runtime
- Exploration keeps file contents out of main context
- The notion-writer handles all Notion API calls
