---
name: code-review
description: "Run a multi-agent static code review with parallel expert reviewers and Notion ticket context. Use when the user asks to review code, review a branch, review changes, check regressions, or get feedback before merge. Also invoked by `engineering:full-review` and `engineering:finish`."
---

# Code Review

Static review from multiple expert perspectives. Reviewers get spec context so
they check "does this fulfill the requirement?" not just "is this correct?"

Reviewer composition scales with change type. Reviewers hunt for findings with
maximum recall; **this skill (the orchestrator) owns triage, severity
translation, filing discipline, and round termination.** Reviewers themselves
stay broad — don't bake scope filters into their prompts.

## Severity model

Two labels, not five. Applied by the orchestrator (this skill) when consolidating.

**MUST** — merge gate. Fix on branch, OR file immediate ticket with owner if out-of-branch-scope. Includes:
- Correctness bugs (observed, not speculative)
- AC violations, security holes
- Inaccurate comments or docs (treat as code)
- Tests asserting X but claiming Y; 0-expect tests; tests encoding current behavior vs spec contract
- **Maintainability hazards** — bright-line test: *"will a future engineer reading this cold be wrong about what it does, or need to read unrelated code?"* If YES → MUST. Triggers: function does 3+ unrelated things; name misleads; duplicated logic across 3+ sites; abstraction leak; implicit invariant that would break on plausible refactor; dead code; file > 500 lines with mixed concerns.

**SUGGEST** — nice-to-have. Inline comment at the code site by default. File as a ticket **only if the near-term-trigger test passes**: (a) known near-term work will touch this area, (b) hard deadline, or (c) blocks a committed PRD. Otherwise: inline + KB note. Tickets are commitments, not memory.

## Composition (scale by change type)

| Change type | Reviewers |
|---|---|
| Features, refactors, architectural work | `code-reviewer` + `engineering:principal` + `engineering:qa` + specialists from roster |
| Bug fixes (scoped, observed bug) | `code-reviewer` + `engineering:qa` |
| Polish, docs, comment updates | `code-reviewer` alone |
| Security-sensitive | Full comp + run R1 twice (LLM sampling insurance) |

## Codex Compatibility

This workflow must run in both Claude-style harnesses and Codex:

- Keep `code-reviewer`, `principal`, `ui-engineer`, `dx-engineer`, and similar
  names as the canonical reviewer roles.
- In Codex, only generic subagent execution types are guaranteed
  (`default`, `explorer`, `worker`). When named reviewer types are unavailable,
  spawn a generic subagent and pass the corresponding role brief from
  `engineering/agents/*.md`, or use the closest installed standalone skill
  (`code-reviewer`, `principal-engineer`, `qa`) when available.
- Do not claim plugin parity unless the current session actually exposes the
  engineering plugin skills. If the session lacks `engineering:engineering-context` or the
  role briefs cannot be loaded, say so and continue with the best compatible
  fallback.

No code written or executed. Findings only.

## Input

`$ARGUMENTS` — empty (current branch vs main), PR URL, or file paths.

## Specialist Roster

| Agent | Domain | Triggers |
|---|---|---|
| `engineering:ui-engineer` | Design system, React | `.tsx`, `packages/client/**` |
| `engineering:stack-engineer` | DB, server, reactivity | `packages/db/**`, `packages/server/**` |
| `engineering:dx-engineer` | Runtime, CLI, logging | `packages/runtime/**`, CLI, codegen |
| `engineering:devops` | CI/CD, releases | Dockerfile, `.github/**`, deploy configs |

Multiple join when the diff spans domains. Skip if principal already covers the only domain touched.

## Pipeline

```
Scope → Context → Preflight → Parallel reviews → Dedup → Walk-through
```

Each stage gates the next.

### 1. Scope

```bash
git diff --name-only $(git merge-base HEAD main)..HEAD
```

Classify against the roster to pick specialists.

### 2. Context Gathering

**This step is a hard gate. You MUST invoke `engineering:engineering-context` (or the documented fallback) before step 4. Skipping it is the #1 cause of false-positive reviews — reviewers flag intentional design as bugs.**

#### 2a. Extract identifiers from the branch and recent commits

Before dispatch, parse the branch name and the last ~20 commit messages (`git log -20 --oneline`) for ticket IDs. Match these patterns (case-insensitive):

- `task-{id}` / `task/{id}` / `task_{id}`
- `{PROJECT}-{id}` (e.g. `WS-123`, `ENG-456`, `PROJ-789`) — any 2–6 letter prefix + dash + digits
- Bare leading digits: `{id}-{slug}` or `{id}_{slug}`
- Path-style prefixes: `feat/{id}-*`, `fix/{id}-*`, `eng/{id}-*`, `{user}/{id}-*`, `{user}/task-{id}-*`

Collect every match. Commit messages often carry an ID even when the branch doesn't.

#### 2b. Invoke the skill with explicit arguments

Pass the branch name AND every extracted ticket ID as `$ARGUMENTS`, plus the mode:

```
engineering:engineering-context "<branch-name> <id1> <id2> ..." review
```

Do not rely on the engineering-context skill's branch-name inference alone — when the branch encodes a ticket ID, hand it over explicitly. **If you found a ticket ID, instruct context that task-manager MUST be dispatched with that ID, even if its freshness check thinks the ticket is already loaded.** Freshness on title alone is unreliable when only the ID matches.

That skill owns the parallel dispatch (task-manager + wiki-librarian + Explore +
kb), the freshness check that skips sources already in the conversation, and the
Notion-fallback ladder. It returns a structured block with Goals / Non-Goals /
Phase scope / Key decisions / Open questions / Edge-case expectations / Prior
decisions (KB) / Known issues (KB retro) / Repo conventions.

If `engineering:engineering-context` is not available in the current harness, gather the
same block manually from the ticket/spec links and repo docs, and explicitly
label the result as a fallback context block. **The fallback is also mandatory — never proceed to step 4 with no context block at all.**

If `engineering:engineering-context` reports gaps (no PRD found, unresolved open questions affecting the diff), pause and ask the user before dispatching reviewers.

Pass the returned block **verbatim** to every reviewer in step 4 — not paraphrased. Exact wording matters because reviewers check findings against it.

### 3. Preflight

Spawn `preflight` for typecheck + tests when that skill is available. Otherwise
run the equivalent checks directly. Any fail → stop. Reviewing broken code
produces findings about breakage, not design.

### 4. Parallel Reviews

Single message, all reviewers. Each gets:

- Changed file list, branch, base
- **Context block from step 2, verbatim** — not paraphrased
- Instruction: "Before flagging a finding, check it against Non-Goals and Decisions. If the behavior matches a stated Non-Goal or Decision, do not flag it — only flag if the implementation diverges from the stated decision."
- **Output format (required)** — three sections:

```
## Findings
- **file:line** — description
  Category: Bug | Design | Security | Coverage | Performance | Style | Maintainability | Doc
  Severity (reviewer's initial read): Critical | High | Medium | Low | Nit

## PATTERNS OBSERVED
- **Pattern name** — where (file:line or module); what makes this worth propagating; suggested destination (CLAUDE.md / Spec ADR / KB / inline comment)
```

**On PATTERNS:** reviewers surface good practice worth propagating — not just defects. Name the pattern, say where, explain why. "Well-written" without a named pattern doesn't count. Examples: "Flag-check cancellation via pending IDs" (flatter than signal plumbing); "Per-call fresh synthetic Request" (immutable adapter boundary); "Hoist-to-export for testability" (pure function testable without DI); "Spec-anchored test names". Destinations: project-specific idiom → CLAUDE.md; architectural decision → Spec ADR; tactical pattern → KB + optional inline comment.

**Reviewers keep using their native severity labels (Critical/High/etc.) as input signal.** The orchestrator re-classifies into MUST/SUGGEST during step 5. Don't force reviewers to pre-triage — it reduces recall.

- **Mandatory closing section — Ship verdict with argument.** Each reviewer must end their report with:

  ```
  ## Ship verdict
  **SHIP** | **SHIP-WITH-TICKETS: <list>** | **BLOCK: <reason>**

  **Argument:** <2–4 sentences weighing the findings above against ship-readiness. Name the specific risk of shipping now vs the specific cost of not shipping. If SHIP-WITH-TICKETS, justify why each deferred finding is safe to defer. If BLOCK, name the one thing that must change before this can merge.>
  ```

  **Why this matters:** reviewers optimized to "find issues" will always find something. Without an explicit ship argument, their findings bias toward blocking by default — noise accumulates faster than it converges. Forcing them to weigh severity × ship-worthiness in their own voice produces a recommendation, not just a pile of findings. This is what lets the main agent terminate multi-round loops cleanly. Include the argument even when the verdict is SHIP — "no findings, ship it" is a legitimate argument and locks in that the reviewer actually considered the question rather than defaulting to their finding-list.

**Core (always):**
- `code-reviewer` — correctness, races, error handling, security
- `engineering:principal` — architecture, boundaries, API, breaking changes
- `engineering:qa` — test quality (static review, not runtime). **Must check spec-grounding** (see below)
- fresh generic reviewer — subtle "looks right but…" bugs

**Codex-native dispatch rule:** use generic subagents. Prefer `explorer` for
read-only analysis. Do not pass unsupported custom `agent_type` strings just to
mirror the role name. The role name belongs in the prompt, not the transport.
This is an execution detail, not a rename of the reviewer roster.

**QA spec-grounding check (mandatory):** For every test in the diff, the QA reviewer must ask "does this assert a spec contract (PRD user story, Spec decision, edge-case table) — or does it assert *how the current code behaves*?" Tests that only encode current behavior become load-bearing for bugs: when the bug is fixed, the test breaks, and the fix looks like a regression. Flag any test that would pass a different-but-spec-compliant implementation — it's not testing the contract. Test names should reference the spec anchor (`"US-5: dedup by name returns existing"`, `"Decision #8: stale = mtime > indexedAt"`) so future reviewers can trace assertions back to intent.

**When a fix requires modifying an existing test:** that's a signal — the test may have been encoding the bug. Check the test's spec anchor before assuming the test is correct and the fix is wrong.

**Specialists** — from roster, per scope. In Codex, load the matching role brief
from `engineering/agents/*.md` into the prompt for each generic reviewer while
keeping the original reviewer name in the report.

### 5. Dedup + Triage + Report

Merge duplicates, cite all sources. Multi-reviewer agreement = high confidence.

**Triage each finding into MUST or SUGGEST** using the severity model at the top. This is the orchestrator's job. Reviewer-provided severity is input, not output — re-classify.

For SUGGEST findings, apply the **near-term-trigger test** before recommending ticket creation. If no trigger applies: recommend inline comment + KB note, not a ticket.

Capture PATTERNS observed by any reviewer into the PATTERNS section of the report; propose a destination for each.

Present via the `collaborate` skill: MUST + SUGGEST + PATTERNS blocks, per-item recommendation with short rationale, summary table, single action prompt at the end. The report template below implements this shape — don't drip-feed findings one at a time.

Single-message report:

```
## Review Summary

**Branch**: {branch} → {base} | **Files**: {n} | **Lines**: +{a}/-{r}
**Reviewers**: {list}

### Changes
{2-3 sentences}

### Perspectives
- **Correctness**: {1 sentence}
- **Architecture**: {1 sentence}
- **Tests**: {1 sentence}
- **Fresh eyes**: {1 sentence}
- {specialists}

### Triage summary
| MUST | SUGGEST | PATTERNS |
|---|---|---|
| {n} | {n} | {n} |

### Multi-reviewer agreement
{findings flagged by 2+ reviewers — higher signal}

### MUST ({n})
{numbered: file:line, description, reviewer(s), recommended action (fix on branch / file immediate ticket if out-of-scope)}

### SUGGEST ({n})
{numbered: file:line, description, reviewer, recommended destination (inline comment / KB / ticket-if-triggered)}

### PATTERNS OBSERVED ({n})
{numbered: pattern name, location, why worth capturing, proposed destination}

### Reviewer ship verdicts
| Reviewer | Verdict | Argument (1 line) |
|---|---|---|
| code-reviewer | SHIP / SHIP-WITH-TICKETS / BLOCK | {their argument, compressed} |
| principal | ... | ... |
| qa | ... | ... |
| {specialists} | ... | ... |

### Branch recommendation
{synthesize: if all SHIP or SHIP-WITH-TICKETS → recommend ship; if any BLOCK → lead with the blocker. Do NOT average severity — weigh the arguments. A Critical finding with a compelling "defer-to-ticket" argument from the flagging reviewer is still a SHIP-WITH-TICKETS; a Medium finding with "this changes a documented contract" is a BLOCK.}

---

Actions: (1) Fix inline  (2) Discuss + fix  (3) Discuss only  (4) Skip
```

Report must be self-contained — copy/paste-able into another session.

### 6. Execute

**Fix inline**: apply all fixes → re-run preflight → show diff → offer commit.

**Discuss + fix**: walk through findings highest-severity first, but in the `collaborate` shape — each finding gets its block (title + detail + bold recommendation), then a single prompt asks the user to confirm/override. The user responds with a batch (e.g. "fix #1, #3; defer #2 with ticket; skip rest"). Do NOT drip-feed one finding per turn. If a finding genuinely needs deep back-and-forth, break out of the batch and discuss that one, then return to the batch for the rest.

**When a fix needs a new or updated test:** delegate to the `test-writer` agent (or invoke the `tdd` skill). Pass the spec anchor (PRD user story or Spec decision ID) explicitly — test-writer's first rule is spec-grounding, and ad-hoc inline test writing tends to produce implementation-shaped tests that encode the fix rather than the contract. Exception: trivial one-line assertion changes directly next to an existing test.

**Discuss only**: same walk-through, no fixing.

**Skip**: acknowledge, continue.

## Edge Cases

- **No changes** → stop
- **Preflight fails** → stop, report
- **Reviewer fails** → continue, note gap
- **Zero MUST + all reviewers SHIP** → loop terminates; recommend merge. SUGGEST items don't force another round.
- **Mixed verdicts** → lead the report with the BLOCK arguments; the disagreement itself is the signal.
- **Multi-round loop convergence** → when the current round returns zero MUST and all reviewers vote SHIP or SHIP-WITH-TICKETS, stop. The termination rule is **round-agnostic** — LLM reviewers sample, so a later-round finding is valid on merit, not filtered by round number.
- **Soft round budget** → 2-3 rounds for well-scoped work. If round 5+ still surfaces MUSTs, stop and triage: scope too broad? requirements unclear? reviewer disagreement on "correct"?
- **Scope drift signal** → if round N surfaces MUSTs **inside** round N-1's fixes, the earlier fix was out of scope. File the finding as a separate ticket, don't pile more fixes onto the same branch.
- **100+ findings** → top 10 by severity, offer full list
- **No ticket/PRD/Spec** → stop, ask user for URLs. Don't proceed without spec.
- **Spec has open questions** → label findings "Spec Open Q", treat as design input not bugs
