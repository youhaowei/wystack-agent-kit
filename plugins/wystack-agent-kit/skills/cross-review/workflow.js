export const meta = {
  name: 'cross-review',
  description: 'Adaptive independent review: available-family cold reads, seam-clustered evidence, and explicit completion status',
  phases: [
    { title: 'Prepare', detail: 'assemble the diff once, so every seat reads the same bytes' },
    { title: 'Plan', detail: 'choose technical angles and model families from the ticket, diff shape, and risk' },
    { title: 'Angles', detail: 'the planned independent families read their assigned angles cold' },
    { title: 'Prune', detail: 'deduplicate candidates and cluster them by root-cause seam' },
    { title: 'Evidence', detail: 'one bounded worker per ambiguous seam, not per question' },
    { title: 'Panel', detail: 'adversarial judgment, optional completeness challenge, conditional synthesis' },
    { title: 'Fixes', detail: 'focused re-check: did the last round of fixes hold' },
  ],
}

// args: { base, workdir, effort, instructions, findings, since, priorEvidence,
//         effectiveSize, diffShape, risk, acceptanceCriteria,
//         bridgeModel, workerModel, judgeModel, claudex, nativeFamily, authorFamily,
//         angleSeats, panelSeats, codexModel }
//   base         — ref the diff is taken against; the diff is three-dot, so it is really
//                  the merge-base with this ref. Defaults to the trunk, which is wrong for
//                  a stacked branch — the caller must pass the parent PR's head instead.
//   workdir      — absolute path of the checkout holding the branch under review. Subagents
//                  inherit the session's working directory, which is frequently NOT the
//                  branch, so this goes into every prompt rather than being assumed.
//   effort       — review shape: 'low' | 'medium' | 'high' | 'xhigh' | 'max' (default 'low')
//   modelEffort  — reasoning effort for routed seats (default 'low'; escalate on evidence)
//   instructions — extra scope from the caller, passed to every agent verbatim
//   findings     — non-empty prior findings trigger focused re-check and require since
//   since        — supplied fix-start ref triggers focused re-check and scopes the fix diff
//                  reads only what the fixes wrote
// `args` reaches the script as a JSON string in some invocation paths and as an object in
// others. Reading `args?.x` off a string yields undefined for every field, so every default
// fires silently — a measured run reviewed the wrong checkout against the wrong base and
// looked like a clean empty diff. Normalize once, here, and never touch `args` again.
const opts = typeof args === 'string' ? (() => { try { return JSON.parse(args) } catch { return {} } })() : args ?? {}

const base = opts.base || 'origin/main'
const workdir = opts.workdir || '.'
const effort = opts.effort || 'low'
const modelEffort = opts.modelEffort || 'low'
const isClaudex = opts.claudex === true || opts.claudex === '1'
const forbiddenReviewShapeKeys = ['mo' + 'de', 'pro' + 'file']
if (forbiddenReviewShapeKeys.some((key) => key in opts)) throw new Error('cross-review accepts no caller-selected review shape')
const priorFindings = Array.isArray(opts.findings) ? opts.findings : []
const hasPriorFindings = priorFindings.length > 0
const phaseName = (hasPriorFindings || opts.since) ? 'focused-recheck' : 'initial'
const priorEvidence = Array.isArray(opts.priorEvidence) ? opts.priorEvidence : []
const applicablePriorEvidence = priorEvidence.filter((entry) => entry && entry.applicable === true && entry.seam && entry.disposition)
const planningContext = {
  effectiveSize: opts.effectiveSize ?? 'unknown',
  diffShape: opts.diffShape ?? 'unknown',
  risk: opts.risk ?? 'unknown',
  acceptanceCriteria: opts.acceptanceCriteria ?? 'not supplied',
}
const extra = opts.instructions ? `\n\nCaller's additional scope:\n${opts.instructions}` : ''

// Model routing is supplied by the caller as flat strings because the same workflow runs
// under different providers. Claudex gets distinct internal defaults; other callers inherit
// their parent unless they explicitly pass a route. Keep the workflow semantic: bridge =
// scripted relay, worker = bounded code reasoning, judge = review decisions.
const route = (model) => (model ? { model, effort: modelEffort } : { effort: modelEffort })
const resolvedBridgeModel = opts.bridgeModel || (isClaudex ? 'gpt-5.6-luna' : undefined)
const resolvedWorkerModel = opts.workerModel || (isClaudex ? 'gpt-5.6-terra' : undefined)
const resolvedJudgeModel = opts.judgeModel || (isClaudex ? 'gpt-5.6-sol' : undefined)
const routing = { bridge: resolvedBridgeModel ?? 'inherited', worker: resolvedWorkerModel ?? 'inherited', judge: resolvedJudgeModel ?? 'inherited' }
const bridgeRoute = route(resolvedBridgeModel)
const workerRoute = route(resolvedWorkerModel)
const judgeRoute = route(resolvedJudgeModel)
log(`cross-review routes: bridge=${routing.bridge}; worker=${routing.worker}; judge=${routing.judge}`)

const parseSeats = (value, fallback) =>
  [...new Set((value || fallback).split(',').map((seat) => seat.trim().toLowerCase()).filter(Boolean))]
const configuredAngleSeats = parseSeats(opts.angleSeats, 'native,gemini,codex,grok')
const configuredPanelSeats = parseSeats(opts.panelSeats, 'verify,completeness,codex')
const codexModel = opts.codexModel
const nativeFamily = (opts.nativeFamily || (isClaudex ? 'openai' : 'claude')).toLowerCase()
const authorFamily = (opts.authorFamily || 'unknown').toLowerCase()
const familyForSeat = (seat) => ({ native: nativeFamily, gemini: 'gemini', codex: 'openai', grok: 'xai' })[seat] || seat
const availableAngleSeats = configuredAngleSeats.filter((seat) => seat !== 'codex' || codexModel)

const availablePanelSeats = configuredPanelSeats.filter((seat) => seat !== 'codex' || codexModel)
if (!codexModel && (configuredAngleSeats.includes('codex') || configuredPanelSeats.includes('codex'))) {
  log('DROPPED Codex seat(s): codexModel was not supplied by the caller')
}

// The final shape is ReportFindings' finding shape, so the calling skill can pass
// it straight through without remapping.
const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['file', 'summary', 'failure_scenario'],
        properties: {
          file: { type: 'string', minLength: 5, pattern: '^[A-Za-z0-9._/@-]+\\.[A-Za-z]+$' },
          line: { type: 'integer' },
          category: { type: 'string' },
          summary: { type: 'string', minLength: 40, description: 'one sentence stating the defect' },
          short_summary: { type: 'string', maxLength: 60, description: 'the claim alone, no rationale clause' },
          failure_scenario: {
            type: 'string',
            minLength: 80,
            description: 'concrete inputs or state, then the wrong output or crash they produce',
          },
          verdict: { type: 'string', enum: ['CONFIRMED', 'PLAUSIBLE'] },
        },
      },
    },
  },
}

// A seat must prove what it read and who answered. Without this a seat that reviewed the
// wrong branch through the wrong model still returns well-formed JSON and is counted as a
// working seat — which is exactly what happened on the first live run.
const ANGLES_SCHEMA = {
  type: 'object',
  required: ['angles', 'input_sha', 'model_served'],
  properties: {
    input_sha: {
      type: 'string',
      pattern: '^[a-fA-F0-9]{64}$',
      description: 'output of `shasum -a 256 <the diff file you were given>`, hash only',
    },
    model_served: {
      type: 'string',
      description: 'the model the CLI reported actually serving the request, from its own logs — not what was requested and not what the model says its name is',
    },
    angles: {
      type: 'array',
      items: {
        type: 'object',
        required: ['question', 'where', 'seam', 'confidence', 'needs_evidence'],
        properties: {
          question: { type: 'string', description: 'what could be wrong, phrased as a question to answer against the code' },
          where: { type: 'string', description: 'files or symbols to look at' },
          seam: { type: 'string', description: 'short root-cause or subsystem label used to cluster duplicates' },
          why: { type: 'string' },
          evidence_summary: { type: 'string', description: 'what in the diff or checkout already supports the candidate' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          needs_evidence: {
            type: 'boolean',
            description: 'true when runtime reproduction, sibling inspection, or disputed contract work is still needed',
          },
        },
      },
    },
  },
}

const CLUSTERS_SCHEMA = {
  type: 'object',
  required: ['clusters'],
  properties: {
    clusters: {
      type: 'array',
      items: {
        type: 'object',
        required: ['seam', 'evidence_key', 'questions', 'where', 'needs_evidence'],
        properties: {
          seam: { type: 'string' },
          evidence_key: { type: 'string', minLength: 3, description: 'exact planner evidence_decisions.seam_or_angle key for this seam' },
          questions: { type: 'array', minItems: 1, items: { type: 'string' } },
          where: { type: 'array', minItems: 1, items: { type: 'string' } },
          why: { type: 'string' },
          existing_evidence: { type: 'string' },
          needs_evidence: { type: 'boolean' },
        },
      },
    },
  },
}

// The length floors below are not style rules — they are the only thing standing between
// this stage and a placeholder. A schema of plain strings accepts `{"answer":"test"}`,
// because "test" is a valid string, and two of five agents in a measured run returned
// exactly that after burning 60k tokens each. Nothing flagged it. A minimum length turns
// that into a validation failure the agent has to answer, so it gets retried rather than
// counted as work. Keep the floors modest: they exist to reject a stub, not to demand prose.
const EVIDENCE_SCHEMA = {
  type: 'object',
  required: ['observations', 'answer', 'disposition'],
  properties: {
    disposition: {
      type: 'string',
      enum: ['confirmed-from-source', 'reproduced-at-runtime', 'refuted', 'unresolved'],
      description: 'how far the requested evidence actually got; never call an unrun reproduction confirmed',
    },
    reproduction: {
      type: 'string',
      description: 'command or runtime path exercised and observed output, or why no reproduction was possible',
    },
    refutation_basis: {
      type: 'string',
      enum: ['runtime-exercise', 'source-unreachable'],
      description: 'required when disposition is refuted: how the proposed failure was ruled out',
    },
    observations: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['file', 'what_the_code_does'],
        properties: {
          file: {
            type: 'string',
            minLength: 5,
            pattern: '^[A-Za-z0-9._/@-]+\\.[A-Za-z]+$',
            description: 'path relative to the repository root, e.g. src/wystack/auth.ts',
          },
          line: { type: 'integer' },
          what_the_code_does: {
            type: 'string',
            minLength: 60,
            description: 'what this code actually does, in a sentence — naming the symbols and the condition',
          },
          sibling_precedent: {
            type: 'string',
            description: 'a file in the same directory that already handles this case, and how — or "none found"',
          },
        },
      },
    },
    answer: {
      type: 'string',
      minLength: 80,
      description: 'the angle question answered from the observations alone',
    },
  },
}

const PREP_SCHEMA = {
  type: 'object',
  required: ['diff_path', 'sha256', 'line_count', 'files', 'head'],
  properties: {
    diff_path: { type: 'string', description: 'absolute path of the written diff file' },
    sha256: { type: 'string', description: 'sha256 of that file, hash only' },
    line_count: { type: 'integer' },
    files: { type: 'array', items: { type: 'string' } },
    head: { type: 'string', description: 'the commit the diff was taken to' },
    branch: { type: 'string' },
  },
}

const PLAN_SCHEMA = {
  type: 'object',
  required: ['angle_assignments', 'panel_seats', 'evidence_decisions', 'rationale'],
  properties: {
    angle_assignments: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['seat', 'angle', 'why'],
        properties: {
          seat: { type: 'string', enum: ['native', 'gemini', 'codex', 'grok'] },
          angle: { type: 'string', minLength: 10, description: 'the technical perspective assigned to this seat' },
          why: { type: 'string', minLength: 20, description: 'why this family is useful for this angle' },
        },
      },
    },
    panel_seats: {
      type: 'array',
      minItems: 1,
      items: { type: 'string', enum: ['verify', 'completeness', 'codex'] },
    },
    evidence_decisions: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['seam_or_angle', 'depth', 'why'],
        properties: {
          seam_or_angle: { type: 'string', minLength: 3 },
          depth: { type: 'string', enum: ['direct', 'source', 'runtime'] },
          why: { type: 'string', minLength: 20 },
        },
      },
    },
    rationale: {
      type: 'string',
      minLength: 60,
      description: 'why this angle-by-family matrix is proportionate to the ticket, diff, and miss cost',
    },
  },
}

// The configured judge model owns synthesis and severity ranking.
const synthesize = (findings, phaseName) =>
  agent(
    `Independent reviewers produced these findings against the same branch. Consolidate them.

${JSON.stringify(findings, null, 2)}

Merge duplicates. Rank most-severe first. Drop anything whose failure scenario does not name
a concrete input that reaches the code. Where a finding is a consistency gap with a sibling
file rather than an unsolved defect, say so in the summary — it changes what the fix is.

\`short_summary\` is the claim alone in 60 characters or fewer: no rationale clause, no
consequence clause.${extra}`,
    { label: 'synthesis', phase: phaseName, ...judgeRoute, schema: FINDINGS_SCHEMA },
  )

// --- focused re-check -------------------------------------------------------
// A middle round is not a cheaper review of the whole branch. The branch was already
// reviewed; what has not been reviewed is the code the last round's fixes wrote. This
// asks two questions and nothing else: did each fix actually close its finding, and
// did the fixes break something new. Both are narrow and convergent, which is what makes
// a native GPT worker sufficient, and it is why there is no discovery stage, no pruning and no external
// seats here. Cost scales with the number of fixes, not with the size of the branch.

if (phaseName === 'focused-recheck') {
  phase('Fixes')

  const prior = priorFindings
  if (prior.length > 0 && !opts.since) {
    return {
      status: 'incomplete',
      level: effort,
      phase: phaseName,
      routing,
      findings: [],
      plan: { kind: 'focused-recheck', scenarios: prior.length, fixRange: null },
      fixesChecked: 0,
      coverage: { checksRequested: prior.length + 1, checksCompleted: 0, checksMissing: prior.length + 1 },
      evidence: { scenarioChecks: 0, regressionCheck: 0 },
      note: 'focused re-check has prior findings but no since ref for the fix diff',
    }
  }
  const fixRange = `${opts.since}..HEAD`

  const checks = prior.map((f, i) => () =>
    agent(
      `One finding from the last review round was reported fixed. Decide whether it actually was.

The checkout is at ${workdir}. Read files by absolute path under it, and run git as
\`git -C ${workdir} ...\` rather than with \`cd\` — your own working directory is a different
checkout of the same repository, so a lost \`cd\` silently puts you on the wrong branch.

The finding:
${JSON.stringify(f, null, 2)}

Read the code as it stands now. The question is not "does the fix look reasonable" — it is
**can the failure scenario above still happen?** Walk the same input through the current code
and say where it now stops, naming the file and line that stops it.

Two ways a fix fails, and both look fine at a glance:
- it answers the one-line summary while the failure scenario still goes through, because the
  summary usually describes a weaker bug than the scenario does;
- it moves the problem instead of removing it — the original call site is guarded and some
  other path reaches the same code unguarded.

Return an empty findings array if the scenario is genuinely closed. If it is not, return the
finding again with the failure scenario rewritten to describe what still gets through.${extra}`,
      { label: `fix:${i + 1}`, phase: 'Fixes', ...workerRoute, schema: FINDINGS_SCHEMA },
    ),
  )

  // Scenario checks and the fix-diff regression seat both use the bounded worker route.
  // Fixes are written under time pressure against a narrow brief and then shipped unreviewed;
  // this seat catches a round trading one bug for another. Only multi-finding synthesis routes
  // to the judge.
  checks.push(() =>
    agent(
      `Read only the commits that fixed the last review round:
\`git -C ${workdir} diff ${fixRange}\`. Use \`git -C\` rather than \`cd\` — your own working
directory is a different checkout of the same repository.

These lines were written to close review findings and have not themselves been reviewed. Look
for what they introduced — a guard added on one path and not its sibling, an early return that
skips cleanup, a changed signature whose other callers were not updated, a narrowed type that
silently drops a case.

The scope test is a REGRESSION test, and it is strict because it is what makes the gate's
fix loop terminate: report a behavior only if some concrete input produced a strictly better
outcome BEFORE these commits than after. For each candidate finding, state what that input
did at ${opts.since ?? base} and what it does at HEAD; if the before-behavior was the same
or worse, it is not a finding of this round.

Out of scope, even when true and even when worth fixing someday:
- the fix closed its case but not a neighboring case it never claimed (incompleteness);
- behavior that predates these commits (the initial review already covered the branch);
- states unreachable without deliberate manual sabotage outside the repo's own tooling;
- style, structure, or diagnostics quality of the new lines, unless strictly worse than before.

Do not re-report the findings these commits were fixing. Strict regressions only.${extra}`,
      { label: 'fix:new', phase: 'Fixes', ...workerRoute, schema: FINDINGS_SCHEMA },
    ),
  )

  log(`focused re-check: checking ${prior.length} fixes, plus the fix diff itself`)
  const checkResults = await parallel(checks)
  const completedChecks = checkResults.filter(Boolean)
  const open = completedChecks.flatMap((r) => r.findings ?? [])

  // Below two findings there is nothing to merge or rank, so synthesis would be pure cost.
  const synthesis = open.length > 1 ? await synthesize(open, 'Fixes') : null
  if (synthesis) log(`focused re-check synthesis returned ${synthesis.findings?.length ?? 0} finding(s)`)

  return {
    status: checks.length > completedChecks.length || (open.length > 1 && !synthesis)
      ? 'incomplete'
      : (synthesis?.findings ?? open).length ? 'findings' : 'passed',
    level: effort,
    phase: phaseName,
    routing,
    findings: synthesis?.findings ?? open,
    plan: { kind: 'focused-recheck', scenarios: prior.length, fixRange },
    fixesChecked: prior.length,
    seatsRun: completedChecks.length,
    coverage: {
      checksRequested: checks.length,
      checksCompleted: completedChecks.length,
      checksMissing: checks.length - completedChecks.length,
    },
    evidence: {
      scenarioChecks: Math.min(prior.length, completedChecks.length),
      regressionCheck: completedChecks.length > prior.length ? 1 : 0,
      synthesisCompleted: open.length <= 1 || !!synthesis,
    },
  }
}

// --- Stage 1: angles -------------------------------------------------------
// Every seat here is picked on intelligence, not on a coding-agent score: nothing
// in this stage drives a harness. The external models get no tools at all — the
// diff goes into the prompt, JSON comes out. A cold read that has never seen my
// reasoning is the whole point, so do not paste conclusions into these prompts.

// `brief`, not a finished prompt: the preamble does not exist until the prepare stage has
// run, so each seat's prompt is assembled inside its thunk rather than at definition time.
const NATIVE_SEATS = [
  {
    label: 'angles:native-open',
    brief: `Read this diff with a deliberately loose brief: find what is wrong with it. You
have the checkout — follow whatever question the code raises, including questions nobody
asked you. Trace a value to where it comes from. Check whether the path you are reviewing
is even reachable. Prior runs show the single most valuable output of this seat is the
question that was not in the brief.

You are the configured native judge model reading this directly. Report \`model_served\` as
the model you are actually running as.

Return candidates worth investigating, not finished findings. For each one name its root-cause seam,
state how confident the current evidence makes you, and mark needs_evidence when sibling reading,
runtime reproduction, or a disputed product/API contract is still required.`,
  },
]

const EXTERNAL_SEATS = [
  {
    label: 'angles:gemini',
    slice: 'the diff alone, with no surrounding repo context',
    bridge: `Run Gemini through the Antigravity CLI:

    agy --model <id> --output-format json --json-schema <schema-path> -p "<prompt>"

**Resolve \`<id>\` by running \`agy models\` first and picking the strongest Gemini 3.1 Pro
variant it lists.** Do not guess an id. An id that is not in the local config does not
error — it silently falls back to whatever the default is, and a measured run of this
workflow spent twelve calls on Gemini 3.6 Flash while believing it had asked for 3.1 Pro.

Three more things bite. \`-p\` takes the prompt as its VALUE, so every flag must come
before it or the literal flag string gets sent as the prompt and you get a confident
answer to the wrong question. The model misreports its own identity, so establish what
actually served the request by passing \`--log-file\` and grepping for \`Model resolved\`
and \`label=\` — never by asking the model. Tools are auto-denied headless and fail as a
silent success, so give it no tools; paste the diff into the prompt.

Report the label from the log as \`model_served\`. If it is not a Gemini 3.1 Pro variant,
report what it actually was rather than what you asked for.`,
  },
  {
    label: 'angles:codex',
    slice: 'the diff plus the database schema and any migration files it touches',
    bridge: `Drive Codex yourself with Bash. Do not use the \`codex-routing\` skill, and do not
spawn a sub-agent or message a peer to do it for you. That skill dispatches an agent, which
leaves you waiting for a message you cannot block on — and a seat that yields its turn to
wait gets killed as idle. On a measured run this seat was started four times and the CLI was
paid for on three of them for nothing.

Write your prompt to a file, then run the companion in the foreground **with an explicit
timeout of 600000 ms**, which is the Bash tool's maximum:

    node ~/.claude/plugins/marketplaces/openai-codex/plugins/codex/scripts/codex-companion.mjs \\
      task --model ${codexModel} --effort ${modelEffort} --prompt-file <your-prompt-file>

The timeout is not optional. Runs of this shape have taken 413, 428 and 475 seconds; the
Bash default is 120, so at the default the call is killed every time, with Codex charged.
Spell the model out in full — the bare nickname \`sol\` is not wired to anything and falls
through to \`gpt-5.6-terra\` without saying so. Never pass \`--write\`; this is a review. If
the path above does not exist, find it with \`find ~/.claude ~/.codex -name
codex-companion.mjs\` rather than guessing.

**If the call still times out, do not run the task again — the work is not lost.** The job
keeps running and its output lands on disk. Recover it instead:

    …/codex-companion.mjs status --all --json          # find your job id
    …/codex-companion.mjs result <job-id> --json       # read its output

Poll \`status\` inside a single Bash call with its own timeout; do not end your turn to wait.

The CLI is metered, so **start at most two \`task\` runs.** Recovery reads are free — prefer
them to a second run. If Codex genuinely never answers, call \`StructuredOutput\` with
\`angles: []\` and \`model_served: "codex did not answer"\`. Do not fall back to reviewing the
diff yourself: this seat exists to report what the planned Codex perspective sees, and your
own findings are already covered by the native seat. Under an OpenAI-native claudex session,
Codex is an extra perspective but not an independent family.

Report the tier that actually served the request in \`model_served\`, read from the rollout
log the run names — never by asking the model what it is, and never by repeating what you
asked for.`,
  },
  {
    label: 'angles:grok',
    slice: 'the diff, plus the tests covering the changed code, plus `git log` for those files',
    bridge: `Drive the grok CLI headless: \`~/.grok/bin/grok -p "<prompt>" --always-approve\`.
Report the model its output names as \`model_served\`. Any \`git log\` you gather for this
seat must be run inside the checkout named in the preamble, never in your own directory.`,
  },
]

// --- Stage 0: prepare ------------------------------------------------------
// One agent assembles the diff and every planned cold read is handed that same file. Letting
// each assignment fetch "the diff" itself creates multiple chances to fetch a different one, and
// comparing model families only means anything if they read identical bytes. On the
// first live run this stage did not exist: seats inherited a working directory that was
// not the branch, found an empty diff, went looking for something to review, and came
// back with well-formed angles about unrelated code.

phase('Prepare')

const prep = await agent(
  `Assemble the input for a code review. This is mechanical — do not review anything.

Use \`git -C ${workdir}\` for every git command. Do not \`cd\` first: your own working
directory is a different checkout of this same repository, and a \`cd\` that silently fails
leaves you running against the wrong branch with no error to notice.

1. \`git -C ${workdir} rev-parse --abbrev-ref HEAD\` and \`... rev-parse HEAD\` — report both.
2. \`git -C ${workdir} diff ${base}...HEAD\` written to a file in your scratchpad named
   \`cross-review-input-${workdir.split('/').filter(Boolean).pop().replace(/[^A-Za-z0-9_-]/g, '-')}-${phaseName}-<short HEAD sha>.diff\`
   (substitute the short HEAD sha yourself). The scratchpad is shared across every
   concurrently running review in the session, so a fixed filename gets clobbered by a
   sibling run between assembly and the seats' reads — the unique name is load-bearing.
3. Report its absolute path, its \`shasum -a 256\` hash, its line count, and the files it
   touches.

Sanity-check before returning: if the branch you report is the same as \`${base}\`, or the
diff is empty, something is wrong with the inputs rather than with the branch. Report it
honestly — empty \`files\`, and the branch you actually found — rather than looking for some
other diff to review. The caller needs to see the mismatch.${extra}`,
  { label: 'prepare', phase: 'Prepare', ...bridgeRoute, schema: PREP_SCHEMA },
)

if (!prep?.diff_path || !prep.files?.length) {
  log(`prepare produced no reviewable diff for ${base}...HEAD in ${workdir} — stopping`)
  return { status: 'incomplete', level: effort, phase: phaseName, routing, findings: [], plan: null, coverage: { angleSeatsRequested: 0, angleSeatsCompleted: 0, angleSeatsMissing: 0 }, evidence: null, seatsRun: 0, note: 'empty diff or wrong review target' }
}

log(`reviewing ${prep.files.length} files, ${prep.line_count} lines @ ${prep.head} — sha ${prep.sha256.slice(0, 12)}`)

const preparedRange = `${base}...${prep.head}`
const exactTargetPriorEvidence = applicablePriorEvidence.filter((entry) =>
  (entry.reviewedBase === base && entry.reviewedHead === prep.head) || entry.range === preparedRange,
)
const reusablePriorEvidence = exactTargetPriorEvidence.filter((entry) => entry.disposition !== 'unresolved')
planningContext.priorEvidenceContext = applicablePriorEvidence.map((entry) =>
  exactTargetPriorEvidence.includes(entry)
    ? { ...entry, currentTarget: true }
    : {
        seam: entry.seam,
        currentTarget: false,
        reviewedBase: entry.reviewedBase ?? null,
        reviewedHead: entry.reviewedHead ?? null,
        range: entry.range ?? null,
        note: 'historical context only; disposition and answer intentionally withheld',
      },
)

phase('Plan')
const availableAngleDescription = availableAngleSeats.map((seat) => `${seat} (${familyForSeat(seat)} family)`).join(', ')
const reviewPlan = await agent(
  `Plan a proportionate adaptive initial review. Do not review the code or propose findings; choose
which technical angles need a cold read and which available model family should read each one.

Review target: ${prep.line_count} diff lines at ${prep.diff_path}, across these files:
${JSON.stringify(prep.files, null, 2)}
Read enough of that prepared diff to identify changed seams and review needs, but do not produce
findings; this stage allocates perspectives only.

Available cold-read seats: ${availableAngleDescription || 'none'}
Available judgment seats: ${availablePanelSeats.join(', ') || 'none'}
Author family: ${authorFamily}
Requested effort: ${effort}
Planning context: ${JSON.stringify(planningContext, null, 2)}
Prior evidence in planning context may explain history and cost, but only entries bound to exact current target ${preparedRange} count as current proof. Do not use stale or unbound context to omit an angle.

Treat angle and model family as separate axes. Start from the ticket and changed seams: choose
angles such as lifecycle/concurrency, authorization, persistence, API contracts, UI behavior,
accessibility, build/release, or focused ordinary correctness only when this change actually
needs them. Then assign each angle to the family whose independent perspective earns its cost.
Do not choose a seat merely to reach a count, and do not use both native and Codex as evidence
of family independence when nativeFamily is openai.

Effort is a willingness to buy marginal but useful perspectives, not a fixed number of agents:
- low: only clearly load-bearing angles and families;
- medium: cover the main seam plus genuine independent challenge where it can change the verdict;
- high/xhigh/max: progressively include subtle cross-seam and completeness risks when justified.

For each changed seam or angle, explicitly choose evidence depth: \`direct\` for source-complete
high-confidence judgment, \`source\` for needed code/sibling/test grounding, or \`runtime\` for
empirical behavior. Ambiguity, disputes, sibling dependence, runtime dependence, and expensive
misses justify evidence. Higher effort increases willingness to ground marginal seams but does
not require grounding every candidate. \`verify\` is the baseline judgment seat; add
\`completeness\` or \`codex\` only when that distinct job is justified. Every selected seat must
come from the available lists.${extra}`,
  { label: 'plan', phase: 'Plan', ...judgeRoute, schema: PLAN_SCHEMA },
)

const rawAssignments = reviewPlan?.angle_assignments ?? []
const invalidPlanAssignments = rawAssignments.filter((assignment) => !availableAngleSeats.includes(assignment.seat)).length
const seenAssignments = new Set()
const plannedAssignments = rawAssignments.filter((assignment) => {
  const key = `${assignment.seat}:${assignment.angle.trim().toLowerCase()}`
  if (!availableAngleSeats.includes(assignment.seat) || seenAssignments.has(key)) return false
  seenAssignments.add(key)
  return true
})
const plannedPanelNames = [...new Set(reviewPlan?.panel_seats ?? [])].filter((seat) => availablePanelSeats.includes(seat))
const panelSeats = new Set(plannedPanelNames)
const invalidPanelAssignments = (reviewPlan?.panel_seats?.length ?? 0) - plannedPanelNames.length
const plannerEvidenceDecisions = reviewPlan?.evidence_decisions ?? []
const duplicateEvidenceDecisionKeys = plannerEvidenceDecisions.length - new Set(plannerEvidenceDecisions.map((decision) => decision.seam_or_angle)).size
const invalidEvidenceDecisions = plannerEvidenceDecisions.filter((decision) =>
  !decision?.seam_or_angle || !['direct', 'source', 'runtime'].includes(decision.depth),
).length
const planIncomplete = !reviewPlan || !plannedAssignments.length || !plannedPanelNames.includes('verify') ||
  !Array.isArray(reviewPlan?.evidence_decisions) || !plannerEvidenceDecisions.length ||
  invalidPlanAssignments > 0 || invalidPanelAssignments > 0 || duplicateEvidenceDecisionKeys > 0 || invalidEvidenceDecisions > 0
const reportedPlan = {
  rationale: reviewPlan?.rationale,
  angles: plannedAssignments.map((assignment) => ({ ...assignment, family: familyForSeat(assignment.seat) })),
  panels: plannedPanelNames,
  evidenceDecisions: reviewPlan?.evidence_decisions ?? [],
}

log(`review plan: ${plannedAssignments.map((assignment) => `${assignment.seat}/${familyForSeat(assignment.seat)} → ${assignment.angle}`).join('; ') || 'no valid cold-read seats'}`)
log(`review plan rationale: ${reviewPlan?.rationale || 'planner returned no rationale'}`)
if (planIncomplete) log('review plan is missing its baseline judge or selected unavailable seats — run will be incomplete')

if (!plannedAssignments.length || !plannedPanelNames.includes('verify')) {
  return {
    status: 'incomplete',
    level: effort,
    phase: phaseName,
    routing,
    findings: [],
    plan: reportedPlan,
    reviewed: { files: prep.files.length, lines: prep.line_count, head: prep.head, sha: prep.sha256 },
    coverage: { angleSeatsRequested: plannedAssignments.length, angleSeatsCompleted: 0, angleSeatsMissing: plannedAssignments.length },
    evidence: { candidatesProposed: 0, seamClusters: 0, planned: plannerEvidenceDecisions.length, requested: 0, completed: 0, missing: 0, unresolved: 0, contradicted: 0, reused: 0, directToJudgment: 0 },
    note: 'review planner produced no executable angle/panel plan',
  }
}

const DIFF_PREAMBLE = `The review target has already been assembled for you. Read it from:

    ${prep.diff_path}

It is ${prep.line_count} lines across ${prep.files.length} files, taken from \`${base}\` to
commit ${prep.head}. If it exceeds ~1500 lines, review it in file groups rather than
truncating, and say which groups you covered.

**Do not run git to obtain the diff, and do not review any other diff.** Your working
directory is not necessarily the branch under review; the file above is. Before you start,
run \`shasum -a 256 ${prep.diff_path}\` and return that hash as \`input_sha\`. If it does not
match ${prep.sha256}, stop and say so rather than reviewing whatever you have.

The checkout for this branch, if you need to read a file in full or look at a sibling, is at
${workdir}. Read it there and nowhere else.

**Finish by calling the \`StructuredOutput\` tool. Never end your turn with the answer
written out as text.** A final message that lists the schema's fields in prose is not a
result: the run records nothing, and the harness starts your seat over from the beginning.
That is measured, not hypothetical — one seat did exactly this, and its replacement, and its
replacement's replacement, each paying for the same external call again.

The same applies when things go wrong. **A failure reported through the schema is a result;
a failure reported in prose is another retry.** If your bridge does not answer, or the diff
hash does not match, call \`StructuredOutput\` with an empty list and say what happened in
\`model_served\` — for example \`{"angles": [], "input_sha": "<the hash you computed>",
"model_served": "codex did not answer"}\`. That validates, gets recorded, and stops the loop.
Do not substitute your own review for the answer you did not get.

**Never end your turn waiting to be notified about something.** If you are waiting on work,
wait inside a single tool call that you own — a blocking command, or a poll loop with an
explicit timeout. A seat that yields its turn to wait for a message gets killed as idle after
about three minutes, and everything it was waiting for is charged and thrown away.${extra}`

phase('Angles')

const externalSeatRuns = plannedAssignments
  .map((assignment, index) => ({
    assignment,
    index,
    seat: EXTERNAL_SEATS.find((candidate) => candidate.label.endsWith(`:${assignment.seat}`)),
  }))
  .filter(({ seat }) => seat)
  .map(({ assignment, index, seat }) => ({
    assignment,
    thunk: () => agent(
      `${DIFF_PREAMBLE}

You are a bridge driver, not the reviewer. Assemble the input, send it to the external
model, and relay what comes back. Do not add your own findings, and do not filter the
model's — a claim you think is wrong is still data about what a different family sees.

Input slice for this seat: ${seat.slice}.
Planned technical angle: ${assignment.angle}
Why this family was assigned: ${assignment.why}
Stay cold: use this as a perspective, not as a conclusion to confirm.

${seat.bridge}

Ask the external model for candidates worth investigating within the planned angle — what
could be wrong and where to look — not for finished findings. Each candidate must include a
root-cause seam, confidence, and whether more evidence or runtime reproduction is required.
Relay its answer as the schema below.`,
      { label: `angles:${assignment.seat}:${index + 1}`, phase: 'Angles', ...bridgeRoute, schema: ANGLES_SCHEMA },
    ),
  }))

const nativeSeat = NATIVE_SEATS[0]
const nativeSeatRuns = plannedAssignments
  .map((assignment, index) => ({ assignment, index }))
  .filter(({ assignment }) => assignment.seat === 'native')
  .map(({ assignment, index }) => ({
    assignment,
    thunk: () => agent(`${DIFF_PREAMBLE}\n\nPlanned technical angle: ${assignment.angle}\nWhy native was assigned: ${assignment.why}\nStay cold: use this as a perspective, not as a conclusion to confirm.\n\n${nativeSeat.brief}`, {
      label: `angles:native:${index + 1}`,
      phase: 'Angles',
      ...judgeRoute,
      schema: ANGLES_SCHEMA,
    }),
  }))

// A barrier is correct here: pruning ranks angles by how much the families disagree,
// which is a property of the whole set and cannot be computed one seat at a time.
const seatRuns = [...nativeSeatRuns, ...externalSeatRuns]
const seats = seatRuns.map((run) => run.thunk)
log(`stage 1: ${seats.length} seats`)
const angleResults = await parallel(seats)

// Keep only seats that can prove they read the diff we assembled. A seat that reviewed
// something else is worse than a seat that failed: it returns confident angles about code
// nobody asked about, and they survive all the way to the panel looking like findings.
const failedModel = (name) => /did not answer|failed|timed? out|unavailable|wrong model/i.test(name || '')
const readPreparedInput = (result) => result?.input_sha?.trim().toLowerCase().startsWith(prep.sha256.trim().toLowerCase().slice(0, 16))
const completedSeat = (result) => readPreparedInput(result) && !failedModel(result.model_served)
const initialSuccessful = angleResults.filter(completedSeat)
const failedRuns = seatRuns.filter((_, index) => !completedSeat(angleResults[index]))
const rejectedInitial = angleResults.filter(Boolean).filter((result) => !readPreparedInput(result)).length

// Family diversity is preferred, not a hard availability gate. Re-run the exact angle
// through a fresh native reviewer when an external or configured seat fails. The fallback
// remains independent from the writer by context and role even when its family matches.
const fallbackResults = failedRuns.length
  ? await parallel(failedRuns.map(({ assignment }, index) => () => agent(
    `${DIFF_PREAMBLE}\n\nFallback review for a seat that was unavailable or failed to answer.\nOriginal planned seat: ${assignment.seat} (${familyForSeat(assignment.seat)} family).\nExact technical angle to preserve: ${assignment.angle}\nWhy this angle was selected: ${assignment.why}\n\nStart cold. Do not inherit conclusions from the failed seat or writer. Report the model actually serving this fallback.\n\n${nativeSeat.brief}`,
    { label: `angles:fallback-native:${index + 1}`, phase: 'Angles', ...judgeRoute, schema: ANGLES_SCHEMA },
  )))
  : []
const fallbackSuccessful = fallbackResults.filter(completedSeat)
const successful = [...initialSuccessful, ...fallbackSuccessful]
const missingAngleSeats = seats.length - successful.length
const rejectedFallback = fallbackResults.filter(Boolean).filter((result) => !readPreparedInput(result)).length
const rejected = rejectedInitial + rejectedFallback
const fallbacks = failedRuns.map(({ assignment }, index) => ({
  angle: assignment.angle,
  requestedSeat: assignment.seat,
  requestedFamily: familyForSeat(assignment.seat),
  modelServed: fallbackResults[index]?.model_served ?? null,
  completed: completedSeat(fallbackResults[index]),
}))
if (fallbacks.length > 0) {
  log(`fallback review seats: ${fallbacks.map((entry) => `${entry.requestedSeat} -> ${entry.modelServed || 'no answer'}`).join('; ')}`)
}
if (rejected > 0) {
  log(`DROPPED ${rejected} seat(s): read a different input than the one prepared`)
}
log(`families that answered: ${successful.map((r) => r.model_served ?? 'unreported').join(', ') || 'none'}`)

const allAngles = successful.flatMap((r) => r.angles ?? [])
log(`stage 1 returned ${allAngles.length} candidates from ${successful.length} of ${seats.length} seats`)

if (!allAngles.length) {
  const incomplete = missingAngleSeats > 0 || planIncomplete
  log(incomplete
    ? 'no candidate survived but required review coverage is incomplete'
    : 'all required cold-read seats completed and returned no candidates — passed')
  return {
    status: incomplete ? 'incomplete' : 'passed',
    level: effort,
    phase: phaseName,
    routing,
    findings: [],
    plan: reportedPlan,
    fallbacks,
    seatsRun: successful.length,
    seatsDropped: rejected,
    coverage: {
      angleSeatsRequested: seats.length,
      angleSeatsCompleted: successful.length,
      angleSeatsMissing: missingAngleSeats,
      panelSeatsRequested: 0,
      panelSeatsCompleted: 0,
      panelSeatsMissing: 0,
    },
    evidence: { candidatesProposed: 0, seamClusters: 0, planned: plannerEvidenceDecisions.length, requested: 0, completed: 0, missing: 0, unresolved: 0, contradicted: 0, reused: 0, directToJudgment: 0 },
  }
}

// --- Stage 2: prune --------------------------------------------------------

phase('Prune')

const pruned = await agent(
  `${allAngles.length} review candidates came back from independent model families reading the
same branch. Deduplicate them by root cause and return every concrete, distinct seam cluster that survives.

Rank by concrete failure potential and disagreement, not by how many seats repeated the same
wording. Preserve minority candidates when they identify a distinct reachable seam. Drop style,
unsupported speculation, and candidates the supplied evidence already refutes.

Current exact-target prior evidence, which may be reused only for matching seams:
${JSON.stringify(exactTargetPriorEvidence, null, 2)}

Planner evidence decisions:
${JSON.stringify(reviewPlan?.evidence_decisions ?? [], null, 2)}

Choose each cluster's evidence need from the concrete seam: direct-to-judgment is appropriate
only when source is complete and confidence is high. Mark needs_evidence for ambiguity,
disputed contracts, sibling dependence, runtime behavior, expensive misses, or a planner
evidence decision requiring source/runtime grounding. Do not make this an all-or-none choice.

Candidates:
${JSON.stringify(allAngles, null, 2)}`,
  { label: 'prune', phase: 'Prune', ...judgeRoute, schema: CLUSTERS_SCHEMA },
)

const clusters = pruned?.clusters ?? []
if (!pruned) log('pruning returned no structured result — the run will be incomplete')
log(`clustered ${allAngles.length} candidates into ${clusters.length} root-cause seams`)

// --- Stage 3: evidence -----------------------------------------------------
// Evidence is bought per root-cause seam, not per phrasing, and only when that seam needs it.

phase('Evidence')

const decisionsByKey = new Map(plannerEvidenceDecisions.map((decision) => [decision.seam_or_angle, decision]))
const clusterPlans = clusters.map((cluster) => ({ cluster, decision: decisionsByKey.get(cluster.evidence_key) }))
const invalidClusterEvidencePlans = clusterPlans.filter(({ decision }) => !decision).length
const unmatchedRequiredEvidenceDecisions = plannerEvidenceDecisions.filter((decision) =>
  decision.depth !== 'direct' && !clusters.some((cluster) => cluster.evidence_key === decision.seam_or_angle),
).length
const matchingPriorEvidence = (cluster) => reusablePriorEvidence.find((entry) =>
  entry.seam === cluster.seam && ((entry.reviewedBase === base && entry.reviewedHead === prep.head) || entry.range === preparedRange),
)
const evidenceTargets = clusterPlans.filter(({ cluster, decision }) => decision?.depth !== 'direct' && !matchingPriorEvidence(cluster))
const evidence = await parallel(
  evidenceTargets.map(({ cluster, decision }, i) => () =>
    agent(
      `Investigate one root-cause seam in this branch and return evidence, not a severity verdict.

The checkout is at ${workdir}. Read files by absolute path under it, and run any git command
as \`git -C ${workdir} ...\` rather than with \`cd\` — your own working directory is a
different checkout of the same repository, so a lost \`cd\` silently answers about the wrong
branch.

Seam: ${cluster.seam}
Required evidence depth: ${decision.depth}
Questions:
${cluster.questions.map((question) => `- ${question}`).join('\n')}
Where to look:
${cluster.where.map((where) => `- ${where}`).join('\n')}
Why it survived pruning: ${cluster.why || 'not supplied'}

Answer the cluster as one root cause. Report what the code does, with file and line evidence.
Check sibling files in the same directory and name any precedent. If the question calls for
runtime behavior, run the smallest focused reproduction available; source reading alone does
not count as runtime proof. Record the command or path and observed result.

Set disposition honestly. Required depth is binding: runtime requires a runtime reproduction;
source requires source or runtime grounding. A refutation is completed evidence, not a failure:
for runtime depth, set refutation_basis to runtime-exercise after exercising the path, or
source-unreachable only after complete source proof that the runtime path cannot be reached.
- confirmed-from-source: the contract is completely decided by reachable source and tests;
- reproduced-at-runtime: you exercised the concrete failure;
- refuted: the proposed failure cannot occur;
- unresolved: required runtime, product-contract, or environmental evidence was not obtained.

Do not convert unresolved into confirmed and do not rank severity.${extra}`,
      { label: `evidence:${i + 1}:${cluster.seam}`, phase: 'Evidence', ...workerRoute, schema: EVIDENCE_SCHEMA },
    ),
  ),
)

const reusedEvidence = clusters
  .map((cluster) => ({ cluster, decision: decisionsByKey.get(cluster.evidence_key) }))
  .filter(({ decision, cluster }) => decision?.depth !== 'direct' && matchingPriorEvidence(cluster))
  .map(({ cluster, decision }) => ({ cluster, requiredDepth: decision.depth, evidence: matchingPriorEvidence(cluster), reused: true }))
const gathered = [
  ...reusedEvidence,
  ...evidenceTargets.map(({ cluster, decision }, i) => ({ cluster, requiredDepth: decision.depth, evidence: evidence[i] })).filter((entry) => entry.evidence),
]
const newlyGathered = gathered.filter((entry) => !entry.reused)
const missingEvidence = evidenceTargets.length - newlyGathered.length
const unresolvedEvidence = gathered.filter((entry) => entry.evidence.disposition === 'unresolved').length
const isGroundedRefutation = (entry) => entry.evidence.disposition === 'refuted' &&
  ['runtime-exercise', 'source-unreachable'].includes(entry.evidence.refutation_basis)
const satisfiesRequiredDepth = (entry) => entry.requiredDepth === 'runtime'
  ? entry.evidence.disposition === 'reproduced-at-runtime' || isGroundedRefutation(entry)
  : ['confirmed-from-source', 'reproduced-at-runtime'].includes(entry.evidence.disposition) || isGroundedRefutation(entry)
const contradictedEvidence = gathered.filter((entry) => entry.evidence.disposition !== 'unresolved' && !satisfiesRequiredDepth(entry)).length
const directClusters = clusterPlans.filter(({ decision }) => decision?.depth === 'direct').map(({ cluster }) => cluster)
log(`evidence: ${gathered.length}/${clusterPlans.filter(({ decision }) => decision?.depth !== 'direct').length} seam clusters answered; ${reusedEvidence.length} reused; ${directClusters.length} direct-to-judgment`)
if (missingEvidence > 0) log(`${missingEvidence} evidence cluster(s) returned nothing usable — incomplete`)
if (unresolvedEvidence > 0) log(`${unresolvedEvidence} evidence cluster(s) remain explicitly unresolved`)
if (invalidClusterEvidencePlans > 0 || unmatchedRequiredEvidenceDecisions > 0) log('planner evidence decisions did not bind cleanly to retained seams — incomplete')
if (contradictedEvidence > 0) log(`${contradictedEvidence} evidence result(s) did not meet required depth — incomplete`)

const reviewBundle = JSON.stringify({ directClusters, gathered, exactTargetPriorEvidence }, null, 2)

// --- Stage 4: panel --------------------------------------------------------
// Two different jobs live here and collapsing them costs accuracy. Per-claim
// verification is discriminative and narrow. Consolidation — what is the story
// across the findings, what is missing — is integrative, and independent reads pay.

phase('Panel')

const panelThunks = []

if (panelSeats.has('verify')) panelThunks.push(
  () =>
    agent(
      `Review candidates and any gathered evidence against this branch:

${reviewBundle}

The checkout is at ${workdir}; use it to verify direct-to-judgment candidates rather than
trusting their summaries. Try to refute every claim. An observation is only a finding if a
concrete input reaches the code and produces a wrong result — say which input. Respect evidence
dispositions: refuted stays dropped, and unresolved stays unresolved rather than becoming a
confident finding merely because it sounds plausible. Default to refuting when unsure.

Return only what survives.${extra}`,
      { label: 'panel:verify', phase: 'Panel', ...judgeRoute, schema: FINDINGS_SCHEMA },
    ),
)

if (panelSeats.has('completeness')) panelThunks.push(
  () =>
    agent(
  `An adaptive fan-out review just ran against this branch.

Prepared diff files:
${JSON.stringify(prep.files, null, 2)}

All cold-read candidates:
${JSON.stringify(allAngles, null, 2)}

Clustered evidence and direct candidates:
${reviewBundle}

You are the completeness critic. Do not repeat or merely re-verify these claims. Ask what is
missing: a diff file nobody opened, a concrete candidate dropped without justification, a
runtime reproduction requested but not run, an assumption nobody checked, or branch history
such as an unreviewed merge/fixup that changes the reviewed head. Return only omissions with a
concrete correctness consequence, not review-process bookkeeping by itself.${extra}`,
      // Completeness is a distinct judge read: noticing an absence is a
      // reading-quality problem rather than bounded evidence-gathering work.
      { label: 'panel:completeness', phase: 'Panel', ...judgeRoute, schema: FINDINGS_SCHEMA },
    ),
)

if (panelSeats.has('codex') && codexModel) panelThunks.push(
  () =>
    agent(
      `You are a bridge driver. Put the review evidence below in front of Codex and relay its
verdicts. Do not add or filter findings.

Drive it yourself with Bash — not the \`codex-routing\` skill, not a sub-agent, and not a
message to a peer. Anything that leaves you waiting for a notification gets your seat killed
as idle, and the CLI is charged anyway. Write the prompt to a file and run the companion in
the foreground **with an explicit timeout of 600000 ms**:

    node ~/.claude/plugins/marketplaces/openai-codex/plugins/codex/scripts/codex-companion.mjs \\
      task --model ${codexModel} --effort ${modelEffort} --prompt-file <your-prompt-file>

The timeout is not optional — runs of this shape take 400 to 500 seconds and the Bash default
is 120. Spell the model out in full; the bare nickname \`sol\` silently falls through to
\`gpt-5.6-terra\`. Never pass \`--write\`.

If it times out anyway the job survives on disk: recover it with
\`codex-companion.mjs status --all --json\` then \`result <job-id> --json\` rather than paying
for a second run. Start at most two \`task\` runs. If Codex never answers, call
\`StructuredOutput\` with an empty \`findings\` array and say so — do not substitute your own
verdicts for the ones you did not get.

The question for Codex: which of these are real, and what did this review miss?

${reviewBundle}${extra}`,
      { label: 'panel:codex', phase: 'Panel', ...bridgeRoute, schema: FINDINGS_SCHEMA },
    ),
)

log(`panel seats: ${[...panelSeats].join(', ') || 'none'}`)
const panel = await parallel(panelThunks)
const initialCompletedPanel = panel.filter(Boolean)
const missingInitialPanelSeats = panelThunks.length - initialCompletedPanel.length
const panelFallback = missingInitialPanelSeats > 0
  ? await parallel(Array.from({ length: missingInitialPanelSeats }, (_, index) => () => agent(
    `A planned review-panel seat was unavailable. Perform a fresh independent fallback judgment over this exact review bundle.

${reviewBundle}

Try to refute every candidate, then check for one material omission in the reviewed diff. Return only concrete correctness findings. Do not inherit the writer's or missing reviewer's conclusions.${extra}`,
    { label: `panel:fallback-native:${index + 1}`, phase: 'Panel', ...judgeRoute, schema: FINDINGS_SCHEMA },
  )))
  : []
const completedPanel = [...initialCompletedPanel, ...panelFallback.filter(Boolean)]
const missingPanelSeats = panelThunks.length - completedPanel.length
if (missingPanelSeats > 0) log(`${missingPanelSeats} planned panel seat(s) returned nothing usable`)
const panelFindings = completedPanel.flatMap((r) => r.findings ?? [])
const synthesis = panelFindings.length > 1 ? await synthesize(panelFindings, 'Panel') : null
if (synthesis) log(`panel synthesis returned ${synthesis.findings?.length ?? 0} finding(s)`)

return {
  status: planIncomplete || !pruned || missingAngleSeats > 0 || invalidClusterEvidencePlans > 0 ||
    unmatchedRequiredEvidenceDecisions > 0 || missingEvidence > 0 || unresolvedEvidence > 0 ||
    contradictedEvidence > 0 || missingPanelSeats > 0 ||
    (panelFindings.length > 1 && !synthesis) || panelThunks.length === 0
    ? 'incomplete'
    : (synthesis?.findings ?? panelFindings).length ? 'findings' : 'passed',
  level: effort,
  phase: phaseName,
  routing,
  findings: synthesis?.findings ?? panelFindings,
  reviewed: { files: prep.files.length, lines: prep.line_count, head: prep.head, sha: prep.sha256 },
  plan: reportedPlan,
  fallbacks,
  seatsRun: successful.length,
  seatsDropped: rejected,
  families: successful.map((r) => r.model_served ?? 'unreported'),
  coverage: {
    angleSeatsRequested: seats.length,
    angleSeatsCompleted: successful.length,
    angleSeatsMissing: missingAngleSeats,
    panelSeatsRequested: panelThunks.length,
    panelSeatsCompleted: completedPanel.length,
    panelSeatsMissing: missingPanelSeats,
  },
  evidence: {
    candidatesProposed: allAngles.length,
    seamClusters: clusters.length,
    planned: clusterPlans.length,
    requested: clusterPlans.filter(({ decision }) => decision?.depth !== 'direct').length,
    completed: gathered.length,
    missing: missingEvidence,
    unresolved: unresolvedEvidence,
    contradicted: contradictedEvidence,
    invalidPlanBindings: invalidClusterEvidencePlans,
    unmatchedRequiredDecisions: unmatchedRequiredEvidenceDecisions,
    reused: reusedEvidence.length,
    directToJudgment: directClusters.length,
  },
}
