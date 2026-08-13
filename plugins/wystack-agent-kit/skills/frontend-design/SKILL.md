---
name: frontend-design
description: Design and implement frontend interfaces, including new visual directions, components, pages, responsive states, and final polish.
---

# Frontend Design

Use the project's existing visual system and product context. When no system exists, establish only the direction and tokens needed for the current work.

For non-trivial layout, visual, or copy changes, build several distinct static HTML or code mocks before editing real components. Make the alternatives differ in structure or visual direction, not just color. Let the user select or combine them.

Implement the selected direction with deliberate hierarchy, typography, spacing, states, accessibility, and responsive behavior. Avoid continuous decorative animation that consumes GPU; motion should explain change or interaction.

Use [anti-patterns](../../references/anti-patterns.md) only when a distinctiveness audit would help. Prefer the project's actual primitives and tokens over bundled assumptions.

Complete when the selected direction is implemented, important states and breakpoints are exercised, and visual evidence matches the actual code and runtime state.
