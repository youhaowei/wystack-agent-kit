---
name: spec
description: Write or revise a technical specification covering system boundaries, data flow, invariants, integrations, and load-bearing decisions.
---

# Spec

Use the user's template, then the project's existing spec convention. With neither, let the design determine the sections.

A spec owns how the system should work: boundaries and ownership, end-to-end data flow, invariants and failure behavior, integrations, operational constraints, trade-offs, and unresolved questions. Reference product requirements without duplicating them. Point to code for incidental signatures or schemas; include a shape only when the shape itself is the decision.

Record decisions where they affect the design. Use an ADR when a consequential choice has durable rationale that would bloat the living spec.

Pressure-test the strongest alternative and the risky seams. Keep current design truth in the spec rather than a chronological change log.

Complete when implementation and review can proceed without guessing load-bearing behavior, while ordinary coding decisions remain free.
