# Anti-patterns: The AI Slop Catalog

Named patterns of generic AI-generated frontend work. Detect and avoid.

> **The slop test**: If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that's the problem. A distinctive interface should make someone ask "how was this made?" — not "which AI made this?"

Loaded by `frontend-design` and `polish-design`. Adapted from impeccable v1.3.0 with our additions.

---

## Typography

| Anti-pattern | What it is | Why it's slop |
|---|---|---|
| **Inter Everywhere** | Defaulting to Inter, Roboto, Arial, Open Sans, system defaults | Templated, indistinguishable from every other AI build |
| **Monospace Tech Theater** | Monospace fonts as lazy "technical/developer" shorthand | Surface signaling without intent |
| **Iconitis** | Large rounded-corner icons above every heading | Adds noise, no information value, screams template |
| **Single-weight Page** | One font weight for everything | No hierarchy → no rhythm |

## Color & Theme

| Anti-pattern | What it is | Why it's slop |
|---|---|---|
| **Purple Gradients** | Purple-to-blue gradients, neon accents on dark | The 2024–2025 AI fingerprint |
| **Cyan-on-Dark** | Cyan accents on near-black backgrounds | "Cyberpunk" by default, intent by accident |
| **Gradient Text** | Gradient fills on metrics or headings | Decorative noise; impact theater |
| **Pure Black/White** | `#000` or `#fff` with no tint | Doesn't appear in nature; flattens vibe |
| **Gray on Color** | Gray text on colored backgrounds | Washed out; tint the foreground toward the background instead |
| **Glow Mode Default** | Dark mode + glowing accents as the default visual language | "Cool" without committing to a real choice |

## Layout & Space

| Anti-pattern | What it is | Why it's slop |
|---|---|---|
| **Cardocalypse** | Wrapping every block in a card | Cards are containers, not decoration |
| **Cards on Cards** | Nested card containers | Visual noise; flatten the hierarchy |
| **Side-Tab Cards** | Identical card grids: icon + heading + text, repeated endlessly | Template, not design |
| **Hero Metric Layout** | Big number, small label, supporting stats, gradient accent | Templated dashboard cliché |
| **Center Everything** | Centered text + centered layout default | Left-aligned + asymmetric reads as designed |
| **Uniform Spacing** | Same padding everywhere, no rhythm | Monotone composition |

## Visual Details

| Anti-pattern | What it is | Why it's slop |
|---|---|---|
| **Glassmorphism Everywhere** | Blur effects, glass cards, glow borders used decoratively | Surface trick, no purpose |
| **Lazy Border Accent** | Rounded element with thick colored border on one side | Almost never looks intentional |
| **Decorative Sparkline** | Tiny charts as ornament, conveying nothing | Sophistication theater |
| **Generic Drop Shadow** | Rounded rectangles with default drop shadows | Forgettable, could be any AI output |
| **Modal Default** | Modals when something else would work | Modals are usually the lazy answer |

## Motion

| Anti-pattern | What it is | Why it's slop |
|---|---|---|
| **Bouncy Easing** | Bounce or elastic easing for state changes | Dated; real objects decelerate smoothly |
| **Layout-Property Animation** | Animating width/height/padding/margin | Janky; use transform + opacity |
| **Animation Soup** | Scattered micro-interactions everywhere | One orchestrated moment beats ten random ones |

## Interaction

| Anti-pattern | What it is | Why it's slop |
|---|---|---|
| **Every Button Primary** | All CTAs styled as the primary action | No hierarchy → no priority |
| **Redundant Heading + Intro** | Section heading restated by an intro paragraph | Say it once, say it well |
| **Empty State as Wallpaper** | "No items yet" with no action | Empty states are onboarding moments |

## Responsive

| Anti-pattern | What it is | Why it's slop |
|---|---|---|
| **Mobile Amputation** | Hiding critical functionality on small screens | Adapt the interface, don't shrink-and-hide |
| **Desktop-Shrunk** | Desktop layout literally scaled down | Different context → different composition |

## UX Writing

| Anti-pattern | What it is | Why it's slop |
|---|---|---|
| **OK / Submit / Yes** | Generic button labels | Use verb + object: "Save changes", "Create account" |
| **Click Here** | Link text without standalone meaning | Breaks accessibility; add context |
| **Vague Errors** | "Something went wrong", "Invalid input" | Name the error, the cause, the fix |
| **Blame Copy** | "You entered an invalid date" | Reframe: "Please enter a date in MM/DD/YYYY" |

---

## Detection workflow

When using `polish-design`:

1. Walk the interface section by section.
2. Per section, scan against the categories above.
3. Name the anti-pattern when found (e.g., "this is Cardocalypse — flatten").
4. Recommend the specific replacement, not just "make it better".

Naming the pattern lets the user verify the call and lets the fix be precise.
