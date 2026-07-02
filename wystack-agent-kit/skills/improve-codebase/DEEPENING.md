# Deepening

How to deepen a cluster of shallow modules safely, given its dependencies. Assumes the vocabulary in [LANGUAGE.md](LANGUAGE.md) — **module**, **interface**, **seam**, **adapter**.

## Dependency categories

When assessing a deepening candidate, classify its dependencies. The category determines how the deepened module is tested across its seam.

### 1. In-process

Pure computation, in-memory state, no I/O. Always deepenable — merge the modules and test through the new interface directly. No adapter needed.

### 2. Local-substitutable

Dependencies with local test stand-ins (PGLite for Postgres, in-memory filesystem, ephemeral SQLite). Deepenable when the stand-in exists. The deepened module is tested with the stand-in running in the test suite. The seam is internal; no port at the module's external interface.

In WyStack codebases this covers PGLite-backed database tests, capturable in-memory logging, and most filesystem-backed primitives.

### 3. Remote but owned (Ports & Adapters)

Your own services across a network boundary — internal RPC, separate deployments, queues you control. Define a **port** (interface) at the seam. The deep module owns the logic; the transport is injected as an **adapter**. Tests use an in-memory adapter; production uses HTTP / gRPC / queue.

Recommendation shape: _"Define a port at the seam, implement an HTTP adapter for production and an in-memory adapter for testing, so the logic sits in one deep module even though it's deployed across a network."_

### 4. True external (Mock)

Third-party services you don't control (Stripe, Twilio, Anthropic API, Notion, GitHub). The deepened module takes the external dependency as an injected port; tests provide a mock adapter. The mock should mirror the real API's failure modes — partial failures, rate limits, schema drift.

## Seam discipline

The seam principles are canonical in [LANGUAGE.md](LANGUAGE.md) — *one adapter is a hypothetical seam, two a real one*; a module has internal seams as well as its external one. Applied to deepening:

- **Don't put a port at the module's interface for a single adapter** — production alone isn't a seam; production + test is. A single-adapter port is just indirection.
- **Don't expose internal seams through the interface** just because the module's own tests use them.

## Testing strategy: replace, don't layer

- Old unit tests on shallow modules become waste once tests at the deepened module's interface exist — delete them.
- Write new tests at the deepened module's interface. The **interface is the test surface**.
- Tests assert on observable outcomes through the interface, not internal state.
- Tests should survive internal refactors. If a test has to change when the implementation changes, it's testing past the interface.

## WyStack-specific guidance

- **Prefer extracting to a WyStack package over a feature-local helper** when the deepened module would be useful across projects. File the question in the proposal — don't decide unilaterally.
- **Database access**: deepening a query path usually means moving from per-query helpers toward a repository-shaped interface. Tests run against PGLite — no adapter at the module's external interface.
- **`@wystack/server` handlers**: the handler IS the interface. Deepening usually means consolidating logic out of handlers into a deep module the handler delegates to.
