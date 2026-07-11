# Four-Axis Scoring

The brainstorm interview tracks ambiguity per component across four axes, and aims each question at the weakest. Scoring is a **legibility instrument** — it shows *where* a design is vague, not just *that* it is. It is not a gate.

## The axes

| Axis | High score means | Low score means |
|---|---|---|
| **Goal** | Purpose is specific; success is concrete and measurable | "Make it better", "a platform for X" — undefined |
| **Constraints** | Solution-space limits are named — technical, business, time, resource | No constraints surfaced; solution floats free |
| **Criteria** | "Done" is defined — acceptance, metrics, observable outcomes | No way to tell a good result from a bad one |
| **Context** | Prior decisions, surrounding state, dependencies are known | Design rests on unstated background |

Goal and context come up naturally in conversation. Constraints and criteria get skipped — they are uncomfortable to pin down. Forcing all four onto the scoreboard is the point.

## Reading a score

Per cell, 0-1, judged after each answer:

| Score | Meaning |
|---|---|
| 1.0 | Specific, evidence-based, no "but what about" branches left |
| 0.7-0.9 | Clear; one or two follow-ups would sharpen it |
| 0.4-0.6 | Multiple interpretations possible, or assumed details |
| 0.0-0.3 | Vague, hand-wavy, contradictory, or absent |

Aggregate ambiguity is driven by the **weakest cell** (max-gap), not the average — a strong Goal must not hide a weak Criteria.

## The loop

After each answer: re-score the affected axes → find the weakest cell across all components → aim the next question there.

Show the user the table when it adds signal:

```
Round 4 — weakest: auth-flow / criteria (0.30)

Component      Goal  Constraints  Criteria  Context
auth-flow      0.85  0.40         0.30      0.70
rate-limiting  0.70  0.80         0.50      0.60

Next question targets auth-flow / criteria.
```

## Not a gate

The threshold per mode (`--light` ~0.4, default ~0.25, `--grill` ~0.15) is a **prompt to check** — "near threshold, pause: are we actually ready?" — never a stop condition.

Stopping is holistic judgment:

- **Trajectory** — three rounds with no movement means the question machine is out of useful questions, regardless of the absolute number.
- **Where the ambiguity sits** — a 0.3 in a load-bearing axis matters; a 0.3 in context for an exploratory piece may not.
- **Diminishing returns** — the last two questions yielded nothing new.
- **User readiness** — the user has context the score does not.

## Honest limits

- Scores are LLM-judged and noisy. Treat them as **relative within a session**, not absolute across sessions.
- If the user keeps overriding at a given score ("ambiguity 0.3, but I'm ready"), the threshold is wrong — not the user. Track that.
- Skip scoring in builder-mode brainstorms — a generative posture conflicts with measurement.
- The instrument is experimental. Show it when it helps, let it fade when it doesn't, and learn which session types it serves.
