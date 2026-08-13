# Interface design

Use this branch only when a chosen boundary has several credible shapes.

Frame the shared constraints first: responsibilities, invariants, callers, dependencies, failure behavior, and compatibility needs. Then produce a small set of materially different interfaces. Useful contrasts include:

- minimum surface area;
- flexibility across known use cases;
- an excellent default path;
- a port or adapter around a genuine external seam.

For each design, show the public shape, one representative use, what it hides, and its tradeoffs. Compare designs by depth, locality, seam placement, and how they respond to likely change. Recommend one or a deliberate hybrid.

Independent agents may explore alternatives when the boundary is broad or consequential, but parallelism is optional; distinct reasoning matters more than agent count.
