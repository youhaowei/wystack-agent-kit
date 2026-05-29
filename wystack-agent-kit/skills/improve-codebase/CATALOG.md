# Catalog

Named refactorings — Fowler's catalog as a cheat sheet. Use when the user asks _"how do I actually move from here to there?"_ The lens (LANGUAGE.md) tells you **what to deepen**; the catalog tells you **how to move safely**.

These are not procedures. They're names for moves the engineer (or the model) can already perform — naming them gives a shared vocabulary and a hint about the intermediate states.

## Composing moves

Most deepenings combine 2–4 catalog moves. Common chains:

- **Shallow helper cluster → deep module**: Inline Function (×N to absorb the helpers) → Extract Function (around the genuinely deep behaviour) → Move Function (relocate to the new home).
- **Coupled siblings**: Combine Functions into Class → Encapsulate Field → Hide Method.
- **Conditional fan-out**: Replace Conditional with Polymorphism, OR Replace Type Code with Subclasses, OR (often best) collapse to a deep module with a switch behind the seam.
- **Leaky implementation detail**: Encapsulate Variable / Hide Delegate.

## Common moves

| Move | When to reach for it |
|---|---|
| **Extract Function** | A block of code is doing one thing with a name. Pull it out. |
| **Inline Function** | A function adds no leverage — its name is no clearer than its body. Push it back. |
| **Move Function** | A function lives on the wrong module. Relocate to where its data lives. |
| **Combine Functions into Class** | A cluster of functions share a parameter list — they're a class waiting to happen. |
| **Combine Functions into Transform** | A cluster computes derived values from one input. Make the input → output transform explicit. |
| **Replace Conditional with Polymorphism** | A type-tag drives branching across many functions. The type wants to be a class. |
| **Encapsulate Variable / Field** | Direct access to a field leaks the implementation. Hide it behind a method. |
| **Hide Delegate** | Callers reach through one object to access another. Add a method on the first that hides the second. |
| **Replace Magic Literal** | Bare numbers/strings carry meaning. Name them. |
| **Replace Loop with Pipeline** | Imperative loops obscure intent. Map / filter / reduce reads as a transform. |
| **Move Statements into Function / out of Function** | Repeated setup or teardown belongs inside; one-off context belongs outside. |
| **Slide Statements** | Group related statements together before any larger move. The cheapest first step. |

## Heuristics for picking a move

- **Locality first.** If the smell is "I keep editing the same five files together", the move that concentrates them is the right one — usually Move Function or Combine Functions into Class.
- **Smallest reversible step.** Each move should leave the system in a working state. If you can't, you're chaining moves that should be separate commits.
- **Tests survive the move.** If a move requires rewriting tests, the tests were probably testing past the interface (see LANGUAGE.md). Address that before continuing.

## Out of scope

- Big-bang rewrites. The catalog is for incremental moves only.
- Cross-language ports. Those are migrations, not refactorings.
- Dependency-injection scaffolding for its own sake. Two-adapters rule applies.

For dependency-shaped moves (introducing ports, splitting on a seam), see [DEEPENING.md](DEEPENING.md). For exploring alternative target shapes, see [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md).
