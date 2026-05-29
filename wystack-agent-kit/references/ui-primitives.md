# @wystack/ui Primitive Mapping

What to compose from when building. Loaded by `frontend`, `polish`, `establish`.

> **Rule**: never raw `<button>` / `<input>` / `<dialog>` in feature components. Always compose from primitives. If a primitive is missing, fix upstream — don't fork inline.

## When primitives apply

- **Feature components** in any consumer app: must use stdui primitives.
- **Marketing pages / landing components**: stdui primitives are still preferred but bespoke styling is allowed; document the deviation.
- **One-off prototypes**: anything goes; mark the file as a prototype.

## Primitive families

> **Note**: Verify exports in the `@wystack/ui` source before assuming a primitive exists. This list reflects the canonical families; exact component names may differ. Check `~/Projects/stdui/` or the consumer's `node_modules/@wystack/ui` for current exports.

### Interactives
- Button (primary, secondary, ghost, destructive)
- IconButton
- Link

### Form
- Input (text, number, email, password, search, url)
- Textarea
- Select / Combobox
- Checkbox / Radio / Switch
- Slider
- DatePicker
- FileInput
- Field wrapper (label + error + helper)

### Surface
- Card
- Sheet / Drawer
- Dialog / Modal
- Popover
- Tooltip
- Toast
- Banner / Alert

### Layout
- Stack (vertical/horizontal flex)
- Grid
- Spacer
- Divider

### Data display
- Table
- List
- Avatar
- Badge / Tag / Chip
- Progress / Spinner
- Skeleton

### Navigation
- Tabs
- Breadcrumbs
- Pagination
- Menu / Dropdown
- Sidebar / SideNav

### Typography
- Heading (h1–h6 with semantic + visual decoupling)
- Text (body, label, caption)
- Code

## Token-driven, not raw values

All primitives consume semantic tokens — never raw colors, sizes, spacing.

| Token category | Source | Example |
|---|---|---|
| Color | `--color-*` (OKLCH) | `--color-bg-canvas`, `--color-fg-default`, `--color-accent` |
| Spacing | `--space-*` (rem-based) | `--space-2`, `--space-4` |
| Type scale | `--text-*` (clamp-fluid) | `--text-base`, `--text-lg` |
| Radii | `--radius-*` | `--radius-sm`, `--radius-md` |
| Shadows | `--shadow-*` | `--shadow-card`, `--shadow-popover` |

If a feature needs a value not in the token set, **add to the token set first**, don't bypass.

## Composition over invention

When a needed primitive is missing:

1. Check `@wystack/ui` source for unexported variants.
2. Check the consumer for a local-only `components/` directory — sometimes a primitive lives there pre-promotion.
3. If genuinely missing, file a stdui ticket and stub it locally with a `// TODO(wystack/ui): promote` comment.
4. Never silently fork a primitive into the feature directory.

## Theming is structural

Token sets define themes. Theming is not a switch on top of one design — it's a coherent token swap.

- Light/dark: same component code, different token values.
- Brand themes: same token names, different OKLCH values.
- Density themes: same components, different `--space-*` scale.
