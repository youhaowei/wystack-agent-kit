# Analysis Heuristics

How coarse codebase signals map to proposed domain reviewers. Guidance, not a lookup table — a real project blends signals; judge the whole picture.

## Detection

Run cheap, breadth-first detection — do not read source files line by line.

| Signal | How to read it |
|---|---|
| Languages | File-extension census across the tree; lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `poetry.lock`, `Cargo.lock`, `go.sum`). |
| Frameworks | Manifest dependency lists — `package.json`, `pyproject.toml`, `requirements.txt`, `go.mod`, `Cargo.toml`, `Gemfile`, `composer.json`, `pom.xml`, `build.gradle`. |
| Boundaries | Top-level dirs and `apps/*`, `packages/*`, `services/*`, `src/*` — names like `web`, `api`, `server`, `mobile`, `cli`, `worker`. |
| Signal files | `Dockerfile`, `docker-compose.*`, `migrations/`, `schema.prisma`/`schema.sql`, `infra/`, `terraform/`, `*.proto`, `.github/workflows/`. |

## Signal-to-domain mapping

| Stack signal | Candidate specialist | Domain one-liner |
|---|---|---|
| React/Vue/Svelte/Next/Angular; `apps/web/`; CSS/Tailwind | `frontend-specialist` | UI components, client state, accessibility, rendering |
| Express/Fastify/Nest/FastAPI/Django/Rails/Go HTTP; `apps/api/`, `server/` | `backend-specialist` | API handlers, service layer, auth, request lifecycle |
| `migrations/`, ORM (Prisma/Drizzle/SQLAlchemy/ActiveRecord), `schema.*` | `data-specialist` | Schema design, migrations, query performance, data integrity |
| React Native/Swift/Kotlin/Flutter; `apps/mobile/`, `ios/`, `android/` | `mobile-specialist` | Mobile UI, platform APIs, app lifecycle, store constraints |
| ML/data deps (PyTorch, TensorFlow, pandas, notebooks); `models/`, `pipelines/` | `ml-specialist` | Model code, data pipelines, training/eval correctness |
| Heavy IaC — `terraform/`, k8s manifests, `infra/` as a first-class domain | `infra-specialist` | only when infra is a substantial codebase, not a few config files — `devops` covers light IaC |

## Reconcile matching signals

On a re-run, each discovered domain is matched against the existing `agents.specialists` entries before anything is written. Two signals, weighed together:

- **Slug (strong)** — a discovered domain whose proposed name equals an existing entry's `name`. Slug equality alone is not enough; pair it with the domain signal.
- **Domain phrase (soft)** — does the discovered domain one-liner describe the same stack area as the existing entry's `domain` string? Same area, possibly reworded.

| Both signals agree | Verdict |
|---|---|
| Slug matches and the domain phrase describes the same stack area | **Confident match** — keep entry and brief; update `domain` only if the phrase genuinely shifted. |
| No existing entry matches a discovered domain | **Added.** |
| An existing entry matches no discovered domain | **Retired.** |
| Slug matches but the domain is materially different; or domain overlaps but slug differs; or one discovered domain splits across two entries, or two collapse into one | **Ambiguous — flag, never guess.** Name the candidates; leave the entries untouched. |

A confident match preserves the brief file untouched — it may be hand-tuned. Only an `added` specialist gets a freshly generated brief.

## Judgment rules

- **Domain, not quality axis.** Propose a reviewer for a *stack domain* whose idioms an outsider would miss. Never propose a generic "quality" or "security" or "performance" reviewer — those are lenses every reviewer applies, owned by `principal` and `qa`.
- **No duplication of the universal four.** `pm`, `principal`, `qa`, `devops` already cover product, architecture, correctness, delivery. A proposed specialist must add a *domain*, not a second opinion on an existing axis.
- **Match weight to footprint.** A domain that is a handful of files does not need its own reviewer — `principal` carries it. Propose a specialist when the domain is a substantial, distinct part of the codebase.
- **Empty is a valid roster.** A single-language single-purpose project may need no specialists at all. Recommend none rather than manufacturing roles.
- **Merge thin domains.** If `web/` and `api/` are both small, one `fullstack-specialist` can beat two thin briefs. Prefer fewer, well-scoped reviewers.
