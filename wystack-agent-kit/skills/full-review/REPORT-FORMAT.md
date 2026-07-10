# Unified Report Format

The merged-three-lens report this skill produces. Single message — don't drip-feed findings.

## Clarity contract

A decision artifact, not a work log. Output shape follows `docs/communication-contract.md` (load it if not in context). The template below operationalizes it: recommendation first, current-state language, boundary-grouped with per-boundary status/evidence/next-action, command output confined to `Verification Evidence`.

```
## Full Review — TASK-{id}: {title}

### Recommendation
{READY / BLOCKED / NEEDS INFO} — {one-sentence reason}

### Decision Needed
{None / the one concrete user choice needed. Example: "Approve pushing libs/wystack first, then committing the DashFrame pointer."}

### PR Summary
**PR**: {#number + title + URL, or "No open PR found"}
**Branch**: {branch} → {base} | **Files**: {n} | **Lines**: +{a}/-{r}

- **Intent**: {what PR/ticket says this should do}
- **Actual diff**: {what changed in code, grouped by module}
- **User impact**: {what becomes possible/different for the user}
- **State**: {review decision, merge state, checks, or "local branch only"}

### Current State
| Boundary | Status | Evidence | Next action |
|---|---|---|---|
| {repo/package/submodule} | {clean / blocked / needs commit / needs push} | {check or file evidence} | {specific next step} |

### Architectural Insight
{1-2 short paragraphs synthesizing the code-review/principal perspective: key boundary or contract touched, whether the design aligns with existing architecture, strongest reusable pattern, and highest architecture risk. Cite modules/files. If no architecture signal exists, say so.}

### Product / Requirement Fit
- **Delivered value**: {1 sentence}
- **Scope fit**: {complete / partial / over-scoped, with reason}
- **Main user-facing gap**: {gap or "none found"}

### Verification Evidence
- **Automated**: {checks/tests run or reviewed, with pass/fail}
- **Runtime/QA**: {manual/runtime evidence, screenshots, browser/app checks, or "not run"}
- **Gaps**: {missing evidence that affects confidence}

### Status
Code review: {n MUST} / {n SUGGEST} / {n PATTERNS}
QA: {pass}/{total} requirements passed, {n edge cases}
PM: {n product findings}

### MUST (merge gate)
{all MUST findings — code, failed ACs, critical PM gaps; each: title, evidence (path + quote), confidence, reasoning, source, recommendation, min fix scope when known}

### SUGGEST (optional)
{all SUGGEST findings; each: title, evidence, confidence, reasoning, source, recommended destination — inline comment, KB, or a follow-up recommendation the user approves before it is filed}

### PATTERNS OBSERVED
{named patterns worth capturing; each: pattern name, location, proposed destination — CLAUDE.md / Spec / KB}

### Requirements Coverage
{PASS/FAIL/UNTESTED table from QA}

### Merge Readiness
{READY if zero MUST, else BLOCKED + list of MUSTs}

### Next Action
{one recommended action, with one sentence explaining why. If approval is required, ask exactly one approval question.}
```

The report must be self-contained — copy/paste-able into another session.

## Severity model

See [SEVERITY.md](../code-review/SEVERITY.md) — the controller re-classifies all reviewer severities into MUST / SUGGEST.

## Action selection prompt

Presented after the report only when the best next action isn't obvious or the user asked for options:

```
**Actions:**
1. **Fix inline** — auto-fix all MUSTs in this session; SUGGESTs go to inline comments / KB (you review diff before commit)
2. **Fix MUSTs only** — fix MUST findings + failed ACs only, then merge
3. **Discuss + fix** — walk through one-by-one, fix as we go
4. **Discuss only** — review findings, decide what to do later
5. **Skip + merge** — acknowledge findings, proceed to merge
```
