# Diverge — Reference

Detail behind the **Diverge** strategy: running N independent attempts at one item, then synthesizing. One attempt is a guess; N independent attempts are evidence.

## N and the variation source

Independence is the experiment — every attempt gets the identical brief and no knowledge of the others. Variation comes from one of:

- **Model spread** (default) — spread attempts across models:

  | Attempt | Model |
  |---|---|
  | 1 | Claude Opus |
  | 2 | Claude Sonnet |
  | 3 | Codex (`gpt`) — or Gemini |

  Probe `codex` / `gemini` on PATH (see `engineering:ccg` for the detection pattern). If absent, fall back to Claude-only attempts with fresh contexts and note the reduced diversity in the synthesis.

- **Assigned stances** — give each attempt an opposing bias (minimal-change vs correctness-first vs future-ergonomics). Use stances when the decision has known competing framings; use model spread when it does not.

Defaults: **spec → 3 attempts, spike → 2** (a spike is a worktree implementation — expensive). Cap at 4.

## Modes

- **spec** — the item is a design or architecture decision. Attempts produce design documents — dispatch subagents, or `codex` / `gemini` CLI calls. No worktrees; these are text.
- **spike** — the item is an XL ticket. Attempts produce throwaway implementations whose only job is to surface what the real implementation will face. Each is a worktree-isolated agent (`engineering:worktree`); each writes a findings note — what it built, what fought back, what it would do differently.

## Storage layout

```
<workspace>/artifacts/diverge/<slug>/
  brief.md        shared brief — identical input to every attempt
  attempt-1.md    design artifact (spec) or findings note (spike)
  attempt-2.md
  attempt-3.md
  synthesis.md    convergence / divergence / recommended approach
```

Spike code lives on its worktree branches, not here — only the findings notes are copied in. The directory is transient evidence under `artifacts/`; `engineering:cleanup` prunes old runs.

## Hand off

- **spec** — the accepted consolidated design goes to `engineering:spec` / `engineering:prd` / `engineering:breakdown`.
- **spike** — spikes are evidence, never merged. The accepted approach is implemented fresh on a clean branch — dispatch it through the Execute strategy. Promote a spike branch directly only if it passes a full review against scope-fence + red→green, and even then review it as new code.

## Principles

- **Identical brief, independent attempts.** An attempt that saw another is contaminated evidence.
- **Synthesis is advisory.** The synthesizer recommends; the human decides each divergence point.
- **Reserve it.** XL tickets and irreversible architecture only — for routine sizes, one attempt with review is right.
