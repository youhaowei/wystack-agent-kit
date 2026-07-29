---
name: finish-task
description: "Finish an engineering task by running the final quality gate, landing the branch, cleaning up, and updating the configured work item. Use when implementation is done and the user wants to merge, open a PR, keep the branch, or discard the work."
---

# Finish Task

Own the final lifecycle: verify, land, shepherd the PR, update the work item.

`$ARGUMENTS` — work-item URL/path (or empty — detect from the `task-{id}-*` branch), plus an optional landing strategy (`merge` | `pr` | `keep`) from a caller that has already decided (a dispatching conductor passes `pr`).

**Prerequisites.** Load `wystack-agent-kit:workspace`. Not set up → `wystack-agent-kit:setup-agent-kit`.

## Workflow

1. **Resolve** — from the URL/path or the branch's task ID; else ask.

2. **Gate** — commit pending work via the installed `commit` skill, then converge per `docs/review-loop.md`, cheap loop first: `wystack-agent-kit:code-review` until zero MUST, then `wystack-agent-kit:full-review` (subsumes runtime verification) until its verdict is ship. Triage unfixed SUGGESTs as deferral candidates — file via `wystack-agent-kit:task-manager` only what the user approves; no user → carry them into the report. Surface compatible extension actions as options — never auto-run.

3. **Landing strategy** — an input, not a question; ask only when absent (the one prompt this skill makes): merge locally / open-update PR / keep branch / discard (interactive only, explicit typed confirmation).

4. **Execute** — *merge:* update base, merge, re-test, `wystack-agent-kit:cleanup` · *PR:* commit, push (on `main`/`master`, branch first), the `prCreate` capability or update the existing PR (`cli: manual` → emit the resolved command as text, exit `needs-human`) · *keep:* preserve as-is · *discard:* confirm, note why, then clean up. Track the outcome — steps 5–7 consume it.

5. **Shepherd** (PR path only) — one bounded pass toward green CI + comments resolved + approved. Fix what's clear and in-scope, reply on each addressed thread with the fix commit, re-request review. Await machine latency (CI); never human latency — exit the moment only reviewer-paced waiting remains; the caller re-invokes for the next pass. Exit at exactly one state and emit the status block:

   | Exit | Condition |
   |---|---|
   | `ready-to-merge` | mergeable + approved + green. `vcs.mergePolicy: gate` → re-verify the gate against the remote and merge now (outcome `merged`); `human` → report for the human merge |
   | `needs-human` | conflict on a published branch (never resolve it), unclear infra/CI failure, a product/scope decision, conflicting reviewers, fixes not converging |
   | `shepherding` | only human-paced waiting remains — never wait for a reviewer |

   ```
   ### PR Shepherd Status
   PR: {url}   State: {…}   CI: {…}   Reviews: {…}   Unresolved threads: {n}   Pass: {n}
   {needs-human → one line per blocker · shepherding → what the next pass waits on}
   ```

6. **Update the work item** — status role (`merged` → done · `pr-created` → in-review · `kept` → in-progress · `discarded` → backlog); a completion summary (date, action, branch, base, PR url, changes vs base); the calibration record `TASK-{id}.json` in workspace `calibration/` per `docs/run-record.md` — updated in place across passes; a `shepherding` exit leaves it open.

7. **Report and stop** — readiness with reasons, verification evidence, status `{old} → {new}`, PR url + Shepherd State, deferral candidates. Close with a plain-text recommendation (next-task / handoff / retro / another pass) — text, no question UI, same for a dispatched caller and a user.

## Rules

- **Merge authority is workspace policy** (`vcs.mergePolicy`), never the skill's own judgment: `human` → stop at ready-to-merge; `gate` → the independently verified gate decides both ways — merge on pass without asking, send back on fail without asking.
- **Context-blind** — consume inputs, emit a report; ask only for a missing required input, never "who are you".
- **Capabilities, not vendor verbs** — resolve `prChecks`, `prView`, … via the workspace `vcs.commands` table; never hardcode `gh`/`gt`/`glab`.
- **Findings never evaporate** — filed, fixed, or surfaced in the report.
- **Roles, not literal statuses** — map onto the configured vocabulary.
- **A recurring CI flake is a setup gap** — report it with a fix, don't just rerun.

## Edge cases

- **Task already done** — warn, confirm before finishing again.
- **PR already exists — resume.** Skip creation; run another shepherd pass. Gate loops skip only on a `.wystack/reviews/` record matching HEAD (`diff_sha`, verdict ship); re-run code-review on a substantive shepherd fix — uncertainty defaults to whole-PR review.
- **Force-push during shepherd** — only if a reviewer asks; it loses review history.
