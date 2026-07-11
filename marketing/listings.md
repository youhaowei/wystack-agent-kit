# Directory & marketplace listing drafts

Tailored copy per surface. **Do not paste the same blurb everywhere** — each directory has a different reader and format. Submissions and launches are outward-facing one-shots: these are drafts for a human to review and post, not to auto-submit.

Canonical facts (keep consistent across all listings):
- **Name:** WyStack Agent Kit
- **Package:** `@wystack/agent-kit` (npm) · repo `github.com/youhaowei/wystack-agent-kit`
- **License:** MIT
- **One-liner:** The agent carries the work. You carry the decisions.
- **Category:** Coding-agent plugin / skills bundle (Claude Code · Codex · Cursor · Pi). **Not** an MCP server.
- **Install (Claude Code):** `/plugin marketplace add github.com/youhaowei/wystack-agent-kit` → `/plugin install wystack-agent-kit@wystack-agent-kit`

---

## Positioning anchor — "lifecycle over primitives"

Use this framing in every launch-style surface. It's credibility-by-adjacency, not competition.

> Discipline-primitive skill sets like **mattpocock/skills** teach an agent individual disciplines — TDD, domain modeling, grilling a plan. WyStack Agent Kit is the **lifecycle layer over those primitives**: it wraps discipline into one end-to-end method (brainstorm → PRD → spec → breakdown → build → review → verify → ship) with human decision-gates at every stage, auditable run records, and optional parallel autonomy. The two compose — keep your primitives, add the lifecycle.

Honest guardrails when using this framing:
- Don't imply endorsement by or affiliation with mattpocock/skills, obra/superpowers, or garrytan/gstack.
- The README already credits all three under "Inspired by the best of the scene" — keep the credit visible; it's the honest version of the adjacency.

---

## P0 — free, evergreen, correctly-scoped

### skills.sh
Format: skill/plugin directory listing. List the **plugin as a unit**, not decomposed skills.

> **WyStack Agent Kit** — one portable lifecycle for coding agents. Brainstorm → PRD → spec → build → review → verify → ship, as one connected method rather than scattered skills. The agent does the work; you make the decisions at every gate. 37 skills + 10 role agents, runs on Claude Code, Codex, Cursor, and Pi. Supervised by default, autonomous (`orchestrate`) when you want it. MIT.
>
> Install: `/plugin marketplace add github.com/youhaowei/wystack-agent-kit`

### Claude Code Templates — aitmpl.com (davila7)
Submission: PR to the aitmpl templates repo. Largest CC plugin/template directory. Lead with the lifecycle differentiator.

> **WyStack Agent Kit** — a full software-lifecycle method for coding agents, not a bag of tricks. One continuous flow (plan → build → review → verify → ship) where the agent carries the work and you own the decisions: scope, trade-offs, what merges. Every run leaves auditable evidence under `.wystack/`. Where primitive skill sets give an agent individual disciplines, this wraps them into an end-to-end lifecycle with decision gates and optional parallel-ticket autonomy. Runs identically on Claude Code, Codex, Cursor, and Pi. MIT.

### awesome-claude-code / awesome-claude-code-plugins (GitHub awesome lists)
Submission: PR adding one list line. Keep it to the list's existing format (name — link — one clause).

> **[WyStack Agent Kit](https://github.com/youhaowei/wystack-agent-kit)** — full software-lifecycle plugin (plan → build → review → verify → ship) with human decision-gates and auditable run records; runs on Claude Code, Codex, Cursor, and Pi. MIT.

PR description to accompany the entry:

> Adds WyStack Agent Kit — an MIT lifecycle plugin (37 skills + 10 role agents) that runs one connected method across Claude Code, Codex, Cursor, and Pi. It complements discipline-primitive sets already on this list (e.g. mattpocock/skills) by wrapping primitives in an end-to-end lifecycle with decision gates and optional parallel autonomy. Published to npm as `@wystack/agent-kit`; install path and full skill reference in the README.

### llms.txt
Written to repo root (`/llms.txt`). Ships nothing to npm; sits at the repo root for AI crawlers reading the GitHub repo. No further action — verify it renders on the repo's default branch after commit.

---

## P2 — secondary directories (proven to index this category)

These three already index mattpocock/skills, which is evidence they carry traffic for exactly this audience.

### claudepluginhub.com
Format: plugin card (name, tagline, install, tags).

> **WyStack Agent Kit** — the lifecycle layer for coding agents. One method from idea to merge, with the human in the loop at every gate. 37 skills, 10 role agents, 4 harnesses (Claude Code · Codex · Cursor · Pi). Auditable by design; autonomous when you allow it.
>
> Tags: `claude-code`, `plugin`, `lifecycle`, `code-review`, `agentic-workflows`, `mit`

### agentconn.com
Format: agent/tool review entry. Emphasize the multi-agent / role-agent angle (their audience skews agent-infra).

> **WyStack Agent Kit** — a portable agent workforce for the whole software lifecycle. Ships 10 universal role agents (pm, principal, qa, devops, designer, and more) plus 37 lifecycle skills, all under one charter: the agent does the work, the human owns the decisions. `orchestrate` dispatches parallel agents per ticket and brings results back for you to gate. Runs on Claude Code, Codex, Cursor, and Pi. MIT.

### crossaitools.com
Format: setup/how-to listing (their mattpocock entry is a "Setup …" page). Mirror that shape.

> **Set up WyStack Agent Kit** — install a full software-lifecycle method for your coding agent in ~30 seconds. `/plugin marketplace add github.com/youhaowei/wystack-agent-kit` then `/plugin install wystack-agent-kit@wystack-agent-kit`, reload, and run `wystack-agent-kit:setup-agent-kit` once per repo. You get planning (brainstorm/PRD/spec/breakdown), execution (start-task/orchestrate/finish-task), review + verification, design, and writing skills — one connected method, not loose commands. Works on Claude Code, Codex, Cursor, and Pi. MIT.

---

## P3 — metadata tuning (cheap, do inline)

### GitHub topics — add to the existing 10
Current: `agent-kit`, `agentic-workflows`, `ai-agents`, `claude-code`, `claude-plugin`, `codex`, `cursor`, `developer-tools`, `llm-tools`, `skills`.
Add for exact-match discovery: `claude-code-plugin`, `codex-plugin`, `agent-skills`, `claude-skills`.

### npm keywords — already strong (10)
Optional adds to `package.json` keywords: `agent-lifecycle`, `code-review`, `claude-skills`. Skip if it pushes past a natural set — no keyword stuffing.

---

## P1 — traction launches (need a comms runway, not a drive-by submit)

With 0 stars today, these are first-traction levers. Prep assets and launch-day comms before posting. These are drafts — the human runs the actual launch.

### Product Hunt

**Tagline (≤60 chars):**
> One lifecycle for coding agents. You keep the decisions.

**Description:**
> WyStack Agent Kit takes a coding agent through the whole job — plan a feature, build it, review it, verify it, ship it — as one connected method instead of scattered commands. The rule holds at every stage: the agent does the work, you make the decisions (scope, trade-offs, what merges).
>
> - 37 lifecycle skills + 10 role agents, one behavioral charter
> - Auditable by design — decisions, review verdicts, and run evidence become durable project state under `.wystack/`, not chat history
> - Supervised by default; `orchestrate` scales to parallel multi-ticket work when you want it — you still gate every merge
> - Runs identically on Claude Code, Codex, Cursor, and Pi
>
> Where skill sets like mattpocock/skills give an agent individual disciplines (TDD, domain modeling), Agent Kit is the lifecycle layer over those primitives. Keep your primitives — add the method. MIT.

**Maker's first comment:**
> Built this after wiring the same plan→build→review→ship loop into three different agent harnesses one too many times. The scene has excellent discipline-primitive skills — obra/superpowers, garrytan/gstack, mattpocock/skills — but I kept wanting one connected lifecycle over them, with the human owning the decisions and every "it works" backed by evidence I can actually review. That's what this is. It runs the same on Claude Code, Codex, Cursor, and Pi. Would love feedback on the decision-gate model — where should the agent stop and ask, vs. proceed?

### Show HN

**Title:**
> Show HN: WyStack Agent Kit – one lifecycle for coding agents, portable across harnesses

**Body:**
> This is a plugin/skills bundle that runs one software lifecycle — brainstorm → PRD → spec → breakdown → build → review → verify → ship — as a single connected method, on Claude Code, Codex, Cursor, and Pi. Same skill bodies everywhere; only the frontmatter adapter differs per harness.
>
> The design principle is a hard split: the agent carries the work, the human carries the decisions. Skills never hand you a checklist of chores, never silently make a call that's yours (scope, what merges), and never claim success without evidence — decisions and run records are written as typed state under `.wystack/`, not lost to chat history.
>
> It's a synthesis, not a from-scratch invention: it credits and draws on obra/superpowers, garrytan/gstack, and mattpocock/skills (all MIT). Those give an agent individual disciplines; this wraps them into an end-to-end method with decision gates and optional parallel-ticket autonomy (`orchestrate`).
>
> Repo: https://github.com/youhaowei/wystack-agent-kit — MIT. Happy to answer questions about the portability model or the decision-gate charter.

### r/ClaudeAI / r/ClaudeCode

**Title:**
> I turned my plan→build→review→ship loop into one portable Claude Code plugin (also runs on Codex/Cursor/Pi)

**Body:**
> Sharing WyStack Agent Kit — an MIT plugin that runs the whole software lifecycle as one method instead of loose slash-commands. The everyday loop is four skills (`brainstorm`, `start-task`, `code-review`, `finish-task`); there are 33 more for depth (PRD/spec, verify, orchestrate parallel tickets, design system, product copy).
>
> The thing I care most about: the agent does the work and surfaces the decisions that are yours, and every claim of "done" leaves auditable evidence under `.wystack/`. If you already use discipline skills like mattpocock/skills, this sits on top of them as the lifecycle layer — they compose.
>
> Install: `/plugin marketplace add github.com/youhaowei/wystack-agent-kit` → `/plugin install wystack-agent-kit@wystack-agent-kit`. Feedback welcome, especially on where the agent should gate vs. proceed.

---

## Not applicable (don't waste effort)

- **MCP registry / Smithery / mcp.so** — Agent Kit is a plugin, not an MCP server. Wrong catalog.
- **G2 / Capterra** — B2B SaaS review sites. Wrong audience for a free OSS dev plugin.
- **Futurepedia / TAAFT** — consumer AI-tool directories. Weak fit; skip unless a specific dev-tooling category opens up.
