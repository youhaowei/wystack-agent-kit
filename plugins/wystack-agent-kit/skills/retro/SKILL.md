---
name: retro
description: "Run a project retrospective from accumulated run records — surface where the workflow is miscalibrated (estimation accuracy, perspective credibility, outcome by size) and propose evidence-backed changes for the user to accept, each written to the config that actually drives behavior. Use periodically after a batch of tickets closes, or when the user asks to refine the workflow, recalibrate estimation, or review how the pipeline is performing."
---

# Retro

Close the calibration loop. `finish-task` and `perspective` *emit* run records; `retro` *consumes* them — turning accumulated evidence into accepted changes at each finding's home. Refinement is data and config, never skill edits.

`retro [project]` — infer project from CWD if omitted. A manual ceremony, not a trigger — run it when a batch of work has closed.

**Prerequisites.** Load `wystack-agent-kit:workspace` — it resolves where the run records live. No workspace → nothing to retrospect; say so and stop.

## Where accepted changes land

Every proposal names its home — there is no side-channel tuning file:

| Finding | Home |
|---|---|
| Estimation anchors, known seams | `workspace.md` § Estimation Anchors — `wystack-agent-kit:calibrate` owns proposing these; invoke it |
| Perspective provider credibility | The workspace perspective provider config — reweight, demote, or drop a provider |
| Workflow shape (which sizes/shapes run clean vs need rework) | `workspace.md` Workflow Notes — guidance `groom` and `breakdown` read |
| The retro itself | One immutable run record per retrospective (`.wystack/retro/`, per `docs/run-record.md`): findings with `derivedFrom`, and the accept/reject outcome per proposal |

## Workflow

1. **Gather.** Read the workspace run records: `calibration/` (`TASK-*.json` from `finish-task`), `perspective/` verdict and override entries, and when present `reviews/` pass records with their linked `findings/*.json` (see `skills/code-review/RECORD-FORMAT.md`) — review verdicts let `review_rounds` and verdict distributions be re-derived from primary evidence; finding records feed recurring-finding analysis by `signature`, triage outcomes, and whether deferred SUGGESTs were acted on. Read prior retro records so this retro sees what was already found and decided.

   Too few records to distinguish signal from noise → say so and offer **reconstruction** rather than stopping: `wystack-agent-kit:calibrate` (its reconstruct stage) rebuilds estimation-accuracy records from the task store, git, and PRs — ask first, it costs a fetch sweep. Reconstruction covers estimation only; perspective verdicts and per-ticket outcomes aren't recoverable from history. Nothing to reconstruct from either → say so plainly and stop.

2. **Analyze.** Look for where the seed policy and reality diverge:

   | Signal | Question | Evidence |
   |---|---|---|
   | **Estimation accuracy** | Are sizes predicting argument size? | delegated — `wystack-agent-kit:calibrate` owns record reconstruction, anchor verification, and the known-seam list |
   | **Perspective credibility** | Are configured perspectives worth following? | how often `findings` were acted on vs overridden |
   | **Outcome by size** | Which ticket sizes/shapes run clean vs need rework? | merged-vs-reworked outcome grouped by size |

   A record feeds whichever rows its fields support — reconstructed estimation records carry no perspective or outcome fields, so those rows draw only on live records.

3. **Surface findings.** Present what the data shows — each finding with its evidence, not a bare claim. Lead with the strongest miscalibration.

4. **Propose changes.** Each proposal states the change, the home it writes to (table above), and the evidence behind it. Estimation gets no proposal here — invoke `calibrate` rather than deriving estimation deltas.

5. **Accept and apply.** The user reviews each proposal — accept, edit, or reject per item. Write only accepted changes to their homes; the fixed skills read the updated config on their next run — no skill edit, no restart. Write the retro run record capturing findings and per-proposal outcomes, then summarize what changed and what the skills will now do differently.

## Rules

- **Advisory.** retro proposes; the user decides every change. Never auto-write a config home.
- **Reads run records, never deletes them.** The data only accrues.
