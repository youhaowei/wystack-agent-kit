# Unified Report Format

The merged-three-lens report this skill produces. Single message — don't drip-feed findings.

```
## Full Review — TASK-{id}: {title}

### Status
Code review: {n MUST} / {n SUGGEST} / {n PATTERNS}
QA: {pass}/{total} requirements passed, {n edge cases}
PM: {n product findings}

### MUST (merge gate)
{all MUST findings — code, failed ACs, critical PM gaps; each: file:line, description, source, recommended action}

### SUGGEST (optional)
{all SUGGEST findings; each: file:line, description, source, recommended destination — inline comment, KB, or ticket-if-triggered}

### PATTERNS OBSERVED
{named patterns worth capturing; each: pattern name, location, proposed destination — CLAUDE.md / Spec / KB}

### Requirements Coverage
{PASS/FAIL/UNTESTED table from QA}

### Merge Readiness
{READY if zero MUST, else BLOCKED + list of MUSTs}
```

The report must be self-contained — copy/paste-able into another session.

## Severity model

See [SEVERITY.md](../code-review/SEVERITY.md). The orchestrator re-classifies all reviewer-supplied severities into MUST / SUGGEST.

## Action selection prompt

Presented immediately after the report:

```
**Actions:**
1. **Fix inline** — auto-fix all MUSTs in this session; SUGGESTs go to inline comments / KB (you review diff before commit)
2. **Fix MUSTs only** — fix MUST findings + failed ACs only, then merge
3. **Discuss + fix** — walk through one-by-one, fix as we go
4. **Discuss only** — review findings, decide what to do later
5. **Skip + merge** — acknowledge findings, proceed to merge
```
