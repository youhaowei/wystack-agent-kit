# Accessibility Copy

Copy is half of accessibility. Wrong words break screen readers as surely as wrong markup.

## Link text

Must have standalone meaning — readers using rotor navigation hear link text out of context.

| Bad | Good |
|---|---|
| "Click here" | "View pricing plans" |
| "Read more" | "Read more about pricing" |
| "Learn more" | "How shipping works" |

## Alt text

Describes the **information**, not the image:

| Image | Bad alt | Good alt |
|---|---|---|
| Revenue chart trending up 40% | "Chart" / "Image of a chart" | "Revenue increased 40% in Q4" |
| Photo of team | "Photo" / "Group photo" | (omit if decorative) or "Engineering team at offsite" |
| Product screenshot | "Screenshot" | "Dashboard showing 12 active campaigns and $4,200 spent" |

**Decorative images**: use `alt=""` (empty) — *not* missing alt. Empty alt tells screen readers to skip; missing alt tells them to read the filename.

## Icon buttons

Need `aria-label` for screen reader context:

```html
<button aria-label="Delete message">🗑</button>
```

When the icon has visible text label nearby, you can connect via `aria-labelledby`:

```html
<svg aria-labelledby="delete-label" />
<span id="delete-label">Delete</span>
```

## Form labels

Always present, always associated:

```html
<!-- Good -->
<label for="email">Email</label>
<input id="email" type="email" />

<!-- Bad: placeholder ≠ label -->
<input type="email" placeholder="Email" />
```

For visually compact forms, use `<label class="sr-only">` to hide visually but keep for screen readers.

## Status & ARIA live regions

Async UI changes need announcements:

```html
<div role="status" aria-live="polite">Saving...</div>
<div role="alert" aria-live="assertive">Couldn't save. Try again.</div>
```

- `polite`: waits for screen reader to finish current speech.
- `assertive`: interrupts. Use only for errors.

## Plain language

Reading age targets:
- Consumer surfaces: ~grade 8.
- Technical/developer surfaces: ~grade 12.

Tools: Hemingway editor, readability scores. Aim for short sentences and common words. Long words and clause-stacked sentences hurt cognition for everyone, not just translators or screen-reader users.

## Skip patterns to avoid

- Tooltips with critical info — touch users can't access them.
- Color-only state communication ("the red row failed") — use icon + text + color.
- Auto-playing audio/video — always opt-in.
