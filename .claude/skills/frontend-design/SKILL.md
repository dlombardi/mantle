# Frontend Design

Visual design principles for building distinctive, polished UI that avoids generic aesthetics.

> **Companion skill:** Always read alongside `frontend-architect` for new components.

---

## Activation

Invoke for ALL UI creation tasks (components, pages, visual polish).

**Trigger keywords:** `design`, `visual`, `style`, `aesthetic`, `typography`, `font`, `color`, `animation`, `motion`, `polish`, `beautiful`, `UI`

**Key files:**
- `apps/web/src/styles/index.css` — Design tokens
- `apps/web/src/components/` — All components

---

## Pre-Design Protocol

Before writing UI code, answer:
1. **Purpose**: What problem does this interface solve?
2. **Tone**: What emotional response should users have?
3. **Differentiation**: What makes this UNFORGETTABLE?

---

## Design Philosophy

Reasoning Substrate follows the **Linear + Raycast** aesthetic:

- **Fast & responsive** — Every interaction feels instant. No loading spinners when avoidable.
- **Keyboard-first** — Commands, shortcuts, and quick navigation over mouse-heavy flows.
- **Dark mode native** — Design for dark first, light as secondary. Embrace the developer context.
- **Confident precision** — Clean lines, sharp edges, intentional spacing. No soft/rounded "friendly" aesthetic.
- **Subtle motion** — Animations serve function (state changes, focus, feedback). Never decorative.
- **Orange energy** — Use orange as the accent color for CTAs, focus states, and emphasis. Warm and confident.

---

## Project Design Tokens

Reference: `apps/web/src/styles/index.css`

| Token | Light | Dark |
|-------|-------|------|
| `--background` | white | near-black |
| `--primary` | deep navy | white |
| `--muted-foreground` | medium gray | light gray |
| `--border` | light gray | dark gray |
| `--accent-orange` | warm orange | brighter orange |

**Radii:** `--radius-xs` through `--radius-2xl`
**Shadows:** `--shadow-2xs` through `--shadow-2xl`
**Fonts:** `--font-sans` (Inter), `--font-mono`, `--font-serif`

---

## Typography

Current baseline: Inter (`--font-sans`)

Guidelines:
- Avoid generic fonts (Arial, system-ui) for display text
- Consider adding distinctive fonts for headers/accents
- Use font weight variation for hierarchy (not just size)

---

## Color & Theme

- **Orange accent** — Use `bg-accent-orange` for primary actions, focus states, active indicators
- Semantic tokens (`bg-primary`, `text-muted-foreground`) for consistency
- OKLCH color space for perceptually uniform gradients
- Dark backgrounds with high contrast text
- Avoid blue/purple accents (too common in dev tools)

> Reference: Read `apps/web/src/styles/index.css` for current token values.

---

## Motion & Animation

CSS-native (current):
- Tailwind `animate-*` utilities
- `transition-*` for hover states
- `data-[state=]` for conditional animations

For complex motion:
- Consider adding `motion` package
- Focus on high-impact moments (page load, reveals)

---

## Spatial Composition

- Asymmetry over balanced layouts
- Generous negative space OR controlled density
- Grid-breaking elements for emphasis
- Overlap and diagonal flow

---

## Visual Details

- Gradient meshes, noise textures
- Layered transparencies
- Dramatic shadows (use `--shadow-*` scale)
- Decorative borders, custom cursors

---

## Anti-Patterns

AVOID these for Reasoning Substrate:
- Purple/violet accents (overused in dev tools, not our identity)
- Overly rounded corners (soft/friendly conflicts with "precise")
- Slow, decorative animations (we're fast, not fancy)
- Light-mode-first design (dark is our native context)
- Generic gray-on-white enterprise aesthetic
- Uniform spacing without rhythm
- Loading spinners when skeleton/optimistic updates work

---

## Validation

```bash
bun run dev       # Visual inspection
bun run build     # No CSS errors
```

---

## Handoffs

| Skill | When |
|-------|------|
| `frontend-architect` | Read together for structure |
| `testing-consultant` | Visual regression tests |
