# Decision-Free Executor Brief

The brief a dispatched execution agent runs in the **Execute** strategy. The cockpit has already groomed, planned, and scoped the ticket — the agent has no decisions to make, only the plan to execute. If the agent finds itself needing to ask, the cockpit's groom/plan was incomplete: it reports that as a blocker rather than guessing.

Fill the braces from the groomed ticket before dispatch.

````markdown
Implement this task in your worktree, open a PR, report back. Every decision is already made — execute the plan, do not redesign it.

## {TASK-id} — {title}
Work item: {url_or_path}

### Plan
{the approved plan — step by step}

### Acceptance criteria
{ACs}

### Scope fence
You may touch only: {declared file globs}. If the plan forces you outside that scope, stop and report it to the cockpit — do not widen it silently. An out-of-scope diff is a blocking review finding.

### Codebase context
{key files, existing patterns, relevant types}

### Process
1. Resolve the workspace — you are in a worktree, so run the resolver block in `docs/storage-contract.md` § Location and resolution rather than reading `.wystack.json` from `cwd` (which would fork a fresh workspace instead of finding the existing one). Read the project CLAUDE.md for conventions.
2. Execute the plan via the installed execution skill (`executing-plans` or equivalent).
3. Add tests only per the strategic test gate (`docs/testing-philosophy.md`): hidden edge case, spec contract, regression, system boundary.
4. Capture red→green evidence — the golden-path test failing before your change, passing after — for the PR body.
5. Run the project's checks (type-check, lint, test).
6. Land the work as a PR — invoke `wystack-agent-kit:finish-task` with the landing strategy set to `pr` (finish-task takes the landing strategy as an input; supplying it means finish-task does not ask). It converges the review loop and writes the calibration record. Landing is fixed: PR, never merge. finish-task's shepherd runs one bounded pass — if it exits with Shepherd State `shepherding` (CI handled, awaiting human review), that is expected, not a failure.
7. Report the PR URL and finish-task's Shepherd State to the cockpit — the cockpit owns any further shepherd passes.

### Rules
- Never merge — PR only. The cockpit gates merges with the user.
- Never mark the work item Done — `finish-task` and the cockpit own status.
- Stay inside the declared file scope.
- A decision you cannot resolve from the plan is a blocker — report it, do not guess.
````
