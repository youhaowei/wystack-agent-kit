# Microcopy Patterns

Adapted from impeccable's UX writing reference + WyStack additions.

## The Button Label Problem

**Never use "OK", "Submit", or "Yes/No".** These are lazy and ambiguous. Use specific verb + object patterns.

| Bad | Good | Why |
|-----|------|-----|
| OK | Save changes | Says what will happen |
| Submit | Create account | Outcome-focused |
| Yes | Delete message | Confirms the action |
| Cancel | Keep editing | Clarifies what "cancel" means |
| Click here | Download PDF | Describes the destination |

**For destructive actions**, name the destruction:
- "Delete" not "Remove" (delete is permanent; remove implies recoverable)
- "Delete 5 items" not "Delete selected" (show the count)

## Loading States

Be specific. "Saving your draft..." beats "Loading...". For long waits:
- Set expectations: "This usually takes 30 seconds"
- Show progress when possible
- Offer cancel for anything > 5 seconds

## Confirmation Dialogs: Use Sparingly

Most confirmation dialogs are design failures — consider undo instead. When you must confirm:
- Name the action: "Delete project?" not "Are you sure?"
- Explain consequences: "This can't be undone."
- Use specific button labels: "Delete project" / "Keep project", not "Yes" / "No"

## Form Instructions

- Show format with placeholders, not separate instructions where possible.
- For non-obvious fields, explain *why* you're asking, not just *what* to type.
- Example: "Phone number (so we can text you when your order ships)" not just "Phone number".

## Avoid Redundant Copy

If the heading explains it, the intro is redundant. If the button is clear, don't restate. Say it once, say it well.

| Redundant | Tight |
|---|---|
| Heading: "Pricing" + Intro: "Here are our pricing plans..." | Heading: "Pricing" + jump straight to tiers |
| Button: "Save changes" + Tooltip: "Click to save your changes" | Button: "Save changes" |

## Translation-Friendly Phrasing

- Keep numbers separate from text strings: "New messages: 3" not "You have 3 new messages" (word order varies by language).
- Use full sentences as single strings when grammar matters.
- Avoid abbreviations: "5 minutes ago" not "5 mins ago".
- Give translators context about where strings appear (Stripe-style key naming).

### Plan for expansion

| Language | Expansion vs English |
|---|---|
| German | +30% |
| French | +20% |
| Finnish | +30–40% |
| Chinese | -30% (fewer chars, similar visual width) |

Allocate space accordingly — buttons that fit "Save" in English need to fit "Speichern" in German.
