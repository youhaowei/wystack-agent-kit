---
name: present
description: "Choose how to deliver a result so it costs the reader the least and informs the decision the most — inline answer, structured question, saved markdown, or rendered HTML report. Use when handing off a decision, a comparison, a review, a plan, or any substantial analysis, or when the user says 'write this up', 'present this', 'turn this into a report', 'give me a doc on', or asks for a briefing or HTML report. Other skills delegate here for their final artifact."
---
# Present

Pick the delivery format for a result. One principle: **minimize the reader's cognitive load, maximize the information they need to decide.** Format is a means to that end — never decoration.

This is the *artifact* layer. The communication contract (`docs/communication-contract.md`) governs how any reply is *shaped*; this skill governs whether the deliverable is a chat reply, a question, a saved file, or a rendered page.

## The format ladder

Choose by decision stakes × content size. Climb only as far as the content earns — a heavier format than the content needs is itself cognitive load.

| Format | Use when | Cost to reader |
|---|---|---|
| **Inline answer** | The result fits in a few screens and needs no revisiting | Lowest — it's just the reply |
| **Structured question** | The result *is* a decision the user must make now | Low — `AskUserQuestion`, recommendation first |
| **Markdown doc** | Substantial, will be revisited or edited, lives in the repo | Medium — a file to open |
| **HTML report** | Many sections, comparisons, needs navigation or a polished read | Medium — but scannable, sticky TOC |

- Don't save a file for something that fits inline — a file the user must open is friction.
- Don't answer inline when the result is a decision — make it a question with a recommendation.
- MD vs HTML is a judgment call, not a rule: HTML when navigation/scanning/comparison tables carry the content; MD when it's prose that will be edited. The choice is per-artifact; the style evolves by example.

## Inline answer

Apply the communication contract: recommendation first, then evidence, then decisions needed. Tables for comparisons. No preamble.

## Structured question

When the deliverable is a choice: `AskUserQuestion`, the recommended option first and labelled, one short why. One decision per question — don't stack.

## Markdown doc

Decision-first: a one-line status + headline at the top, then sections. Tables over prose for any comparison. Keep it the canonical copy; if an HTML render also exists, the MD is the source of truth.

## HTML report

There is **no bundled template** — the style belongs to the project and the person, and it evolves by example. Don't impose a house look.

1. **Match what exists.** Look for an earlier HTML report in this project (the workspace, `docs/`, prior renders). If one exists, mirror its style — the project already has a voice.
2. **Otherwise build to the principles**, and that render becomes the project's reference for next time:
   - Lead with the decision — a status line and a one-sentence headline above the fold.
   - Scannable — sections, comparison tables, callouts for what matters most.
   - Navigable when long — a table of contents; drop it when the report is short.
   - Comfortable — respects `prefers-color-scheme`, readable measure, restrained color.
3. **One source of truth.** When an HTML report renders a markdown doc, the MD is canonical — regenerate the HTML when the MD changes; never let them silently diverge.

The point is the reader's experience, not a fixed skin. A person's and a project's taste accrues across reports — let it.
