# Story 1.2: Sky & Sedge design-token system

Status: ready-for-dev

## Story

As the Operator,
I want the site's visual identity implemented as reusable design tokens,
so that every screen looks consistent and on-brand.

## Acceptance Criteria

1. **Given** the DESIGN.md spec, **When** the Tailwind v4 theme is configured, **Then** all 15 color tokens, the 7-role type ramp (Lora headings + Inter body), and the spacing / rounded / shadow scales are available as theme tokens (usable as Tailwind utilities).
2. **Given** the fonts, **When** any page renders, **Then** Lora and Inter load with the **Vietnamese subset** and render Vietnamese diacritics correctly (Sâm Thương, Bói cá lam, Diệc xám).
3. **Given** a `/styleguide` page, **When** it is opened, **Then** it displays every color token (swatch + name + hex), the full type ramp, the spacing/radius/shadow scales, and a Vietnamese diacritic sample.
4. **Given** the accessibility floor, **When** text tokens are used on their intended backgrounds, **Then** all deep/text tokens pass WCAG AA (the styleguide notes the pairing); `soft` variants are decorative-only.
5. **Given** the toolchain, **When** the story is done, **Then** `build`, `lint`, and `tsc --noEmit` pass clean.

## Tasks / Subtasks

- [ ] **Task 1 — Fonts (AC: 2)**
  - [ ] Load **Lora** (weights 600, 700) and **Inter** (400, 500) via `next/font/google` with `subsets: ['latin', 'vietnamese']`, exposed as CSS variables (e.g. `--font-lora`, `--font-inter`) on `<html>` in `app/layout.tsx`.
- [ ] **Task 2 — Tailwind v4 `@theme` tokens (AC: 1, 4)**
  - [ ] In `app/globals.css`, define the token system inside `@theme { … }` (Tailwind v4 CSS-first config — do NOT create a v3 `tailwind.config.js`). Map the exact values in Dev Notes.
  - [ ] Colors as `--color-<name>`; spacing as `--spacing-*` (or rely on Tailwind's 4px base + add named tokens gutter/margins/max-content); radius as `--radius-*`; the overlay shadow as `--shadow-overlay`; fonts as `--font-lora`/`--font-inter`.
  - [ ] Provide the type ramp — either as `--text-*` size tokens or small semantic utility classes (`.text-display`, `.text-h1`… `.text-caption`) pairing family + size + weight + line-height + tracking per the ramp.
- [ ] **Task 3 — Styleguide page (AC: 3, 4)**
  - [ ] Create `app/styleguide/page.tsx` (a plain route this story; `[locale]` arrives in 1.3): render color swatches (each: block in the token color, token name, hex, and its AA note), the type ramp with live samples, the spacing/radius/shadow scales, and a Vietnamese diacritic stress line.
  - [ ] It's a Server Component; no client JS needed.
- [ ] **Task 4 — Verify (AC: 5)**
  - [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean; `npm run dev` → `/styleguide` renders with correct fonts/colors and Vietnamese diacritics.

## Dev Notes

**Builds directly on Story 1.1's verified scaffold** (Next 16.3, Tailwind 4 via `@import "tailwindcss"` + `@tailwindcss/postcss`, layered tree). This story is **tokens + a styleguide only** — do NOT build the 12 UI components (those come in the stories that use them), no i18n/`[locale]` routing (Story 1.3), no domain logic.

**EXACT token values (from DESIGN.md frontmatter — use verbatim, do not invent):**

*Colors (`--color-*`):*
```
bg-page #FBF9F4   surface #FFFFFF   surface-sunken #F1EDE4   border #E4DFD3
ink #3B4147   ink-muted #6B7178   caption-deep #71736B
sky-soft #7E9AAB   sky-deep #4C6577   sage-soft #8B9B7A   sage-deep #5E6F4B
success #4F7A52   pending #96681F   error #A85248   info #4C6577
```
*Accessibility rule:* `sky-deep`, `sage-deep`, `ink`, `ink-muted`, `caption-deep`, `success`, `pending`, `error` are the **text/interactive** tokens (all pass AA on cream `#FBF9F4` / white); the `soft` variants (`sky-soft`, `sage-soft`) are **decorative/large-area only — never text**.

*Type ramp (family / size / weight / line-height / tracking):*
```
display   Lora 700  56px / 1.08 / -0.01em
h1        Lora 700  40px / 1.15 / -0.005em
h2        Lora 600  30px / 1.2
h3        Lora 600  22px / 1.3
body-lg   Inter 400 18px / 1.65
body      Inter 400 16px / 1.6
caption   Inter 500 13px / 1.45 / +0.02em
```
Rule: headings never use Inter; body/UI/prices never use Lora. Headings must be allowed to wrap (Vietnamese runs longer) — never truncate.

*Radius (`--radius-*`):* `sm 2px`, `md 6px` (DEFAULT), `lg 12px`, `full 9999px`.
*Spacing:* 4px base scale (1=4 … 9=96: 4,8,12,16,24,32,48,64,96) + named `gutter 24px`, `margin-mobile 20px`, `margin-desktop 32px`, `max-content 1200px`.
*Shadow:* `overlay: 0 6px 24px -8px rgba(59,65,71,0.18)` — the ONLY shadow (flat editorial; depth is whitespace + hairline `border`, not shadows).

**Vietnamese diacritic sample for the styleguide:** `Sâm Thương · Bói cá lam · Diệc xám · Đồng bằng sông Cửu Long · ẦẨẪẬ ầẩẫậ ỀỄỆ ệ ỮỰ ữự Đđ`

### References

- [Source: _bmad-output/planning-artifacts/ux-designs/ux-SamThuongShop-2026-07-18/DESIGN.md#Colors / Typography / Layout & Spacing / Shapes / Elevation & Depth] — token values + the soft/deep AA rule.
- [Source: …/architecture/architecture-SamThuongShop-2026-07-18/ARCHITECTURE-SPINE.md#Stack] — Tailwind 4.
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1 / Story 1.2] — acceptance criteria.

## Dev Agent Record

### Agent Model Used

Claude Sonnet (implementation) + Claude Opus (verification & finalize)

### Debug Log References

- `npx tsc --noEmit` → "TypeScript: No errors found" ✅
- `npm run lint` → "ESLint: No issues found" ✅ (after removing an unused `ReactNode` import in `app/styleguide/page.tsx`)
- `npm run build` → "Compiled successfully in 28.0s", TypeScript finished, 6 static pages generated. Routes: `○ /`, `○ /_not-found`, `ƒ /api/health`, `○ /styleguide`.

### Completion Notes List

- Implemented the Sky & Sedge token system in Tailwind v4 CSS-first form (`app/globals.css` `@theme`): all 15 `--color-*` tokens verbatim from DESIGN.md, `--radius-*` (md default), named spacing tokens (gutter / margin-mobile / margin-desktop / max-content), `--shadow-overlay`, and `@theme inline` aliasing the `next/font` variables into `--font-lora` / `--font-inter`. No v3 `tailwind.config.js`.
- 7-role type ramp implemented as Tailwind v4 `@utility` classes (`text-display` … `text-caption`), each pairing family + size + weight + line-height + tracking; Lora for headings, Inter for body — never swapped.
- Fonts: Lora (600/700) + Inter (400/500) loaded via `next/font/google` with `subsets: ['latin','vietnamese']`, exposed on `<html>` as `--lora-font`/`--inter-font` (variable names match the `globals.css` aliases — verified).
- `app/styleguide/page.tsx` (Server Component, static route) renders all color swatches (name/hex/AA note), the full type ramp with live samples, the spacing/radius/shadow scales, and the Vietnamese diacritic sample — dogfooding the tokens. Prerendered statically at build with no errors.
- **Minor fidelity note:** numeric spacing utilities (`p-5`, `gap-6`…) use Tailwind's native 4px scale, which diverges from DESIGN.md's custom step values at the high end (Tailwind `5`=20px vs DESIGN token `5`=24px). Named semantic tokens are exact. **Decision (confirmed with Thinh An): keep the idiomatic Tailwind-native numeric scale** — no `--spacing-*` override.
- Scope held: tokens + styleguide only — no UI components, no i18n, no domain logic.

### File List

- `app/globals.css` (modified — token system)
- `app/layout.tsx` (modified — Lora + Inter via next/font, exposed on `<html>`)
- `app/styleguide/page.tsx` (new — token styleguide)
