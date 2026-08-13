---
name: improve-codebase
description: Find and design high-leverage codebase improvements by deepening shallow modules, clarifying seams, and reducing change amplification.
---

# Improve Codebase

Survey the codebase for places where understanding or changing one behavior requires bouncing across many files, where callers repeat policy, or where an interface exposes nearly as much complexity as its implementation.

Apply the deletion test: if removing the module makes complexity disappear, it is likely shallow; if the complexity reappears across callers, the module is earning its boundary.

Rank candidates by leverage and locality. For each, show the current friction, the deeper shape, the seam it would own, and what becomes easier to test or change. Respect repository constraints and existing domain vocabulary.

Read references only for the selected branch:

- [LANGUAGE.md](LANGUAGE.md) for the shared vocabulary;
- [DEEPENING.md](DEEPENING.md) for dependency shapes;
- [CATALOG.md](CATALOG.md) for concrete refactorings;
- [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md) when several interface shapes deserve comparison.

Complete when the user has a ranked set of evidence-backed candidates or a chosen candidate with a defensible target boundary.
