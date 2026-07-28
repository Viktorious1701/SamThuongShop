---
name: SamThuongShop
description: Visual identity for SamThuongShop — a nature-editorial bird-photography store and portfolio.
status: final
created: 2026-07-18
updated: 2026-07-18
colors:
  bg-page: '#FBF9F4'
  surface: '#FFFFFF'
  surface-sunken: '#F1EDE4'
  border: '#E4DFD3'
  ink: '#3B4147'
  ink-muted: '#6B7178'
  caption-deep: '#71736B'
  sky-soft: '#7E9AAB'
  sky-deep: '#4C6577'
  sage-soft: '#8B9B7A'
  sage-deep: '#5E6F4B'
  success: '#4F7A52'
  pending: '#96681F'
  error: '#A85248'
  info: '#4C6577'
typography:
  display:
    fontFamily: Lora
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.08'
    letterSpacing: -0.01em
  h1:
    fontFamily: Lora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: -0.005em
  h2:
    fontFamily: Lora
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.2'
  h3:
    fontFamily: Lora
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.65'
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.45'
    letterSpacing: 0.02em
rounded:
  none: '0'
  sm: 2px
  DEFAULT: 6px
  md: 6px
  lg: 12px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  '7': 48px
  '8': 64px
  '9': 96px
  base: 4px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 32px
  max-content: 1200px
shadows:
  overlay: '0 6px 24px -8px rgba(59, 65, 71, 0.18)'
components:
  top-nav:
    height: 64px
    background: '{colors.surface}'
    border-bottom: 1px solid {colors.border}
    link-color: '{colors.ink}'
    link-hover-color: '{colors.sky-deep}'
    font: '{typography.caption}'
  language-toggle:
    font: '{typography.caption}'
    active-color: '{colors.ink}'
    inactive-color: '{colors.ink-muted}'
    separator-color: '{colors.border}'
  button-primary:
    background: '{colors.sky-deep}'
    color: '#FFFFFF'
    radius: '{rounded.full}'
    padding: '{spacing.3} {spacing.5}'
    font: '{typography.caption}'
    hover-background: '#3D5464'
    disabled-background: '{colors.surface-sunken}'
    disabled-color: '{colors.ink-muted}'
    focus-ring: '2px solid {colors.ink}'
    focus-ring-offset: 2px
  button-secondary:
    background: transparent
    color: '{colors.sage-deep}'
    border: 1px solid {colors.sage-deep}
    radius: '{rounded.full}'
    padding: '{spacing.3} {spacing.5}'
    hover-background: '{colors.surface-sunken}'
  product-card:
    background: '{colors.surface}'
    radius: '{rounded.md}'
    image-radius: '{rounded.sm}'
    image-border: 1px solid {colors.border}
    title-font: '{typography.h3}'
    title-color: '{colors.ink}'
    availability-font: '{typography.caption}'
    availability-color: '{colors.ink-muted}'
    price-font: '{typography.body}'
    price-color: '{colors.ink}'
    gap: '{spacing.3}'
  variant-selector:
    option-radius: '{rounded.md}'
    option-border: 1px solid {colors.border}
    option-color: '{colors.ink}'
    selected-border: 1px solid {colors.sky-deep}
    selected-color: '{colors.sky-deep}'
    disabled-color: '{colors.ink-muted}'
    font: '{typography.body}'
  watermark-badge:
    background: 'rgba(59, 65, 71, 0.72)'
    color: '#FFFFFF'
    radius: '{rounded.sm}'
    padding: '{spacing.1} {spacing.2}'
    font: '{typography.caption}'
  cart-line:
    border-bottom: 1px solid {colors.border}
    thumb-radius: '{rounded.sm}'
    thumb-border: 1px solid {colors.border}
    title-color: '{colors.ink}'
    meta-color: '{colors.ink-muted}'
    price-color: '{colors.ink}'
    gap: '{spacing.4}'
  status-pill:
    radius: '{rounded.full}'
    background: '{colors.surface-sunken}'
    font: '{typography.caption}'
    label-color: '{colors.ink}'   # label always ink for AA on the sunken pill; the DOT carries the status hue
    paid-dot: '{colors.success}'
    awaiting-dot: '{colors.pending}'
    shipped-dot: '{colors.info}'
    failed-dot: '{colors.error}'
    padding: '{spacing.1} {spacing.3}'
  gallery-item:
    radius: '{rounded.sm}'
    border: 1px solid {colors.border}
    caption-font: '{typography.caption}'
    caption-color: '{colors.caption-deep}'
  text-input:
    background: '{colors.surface}'
    border: 1px solid {colors.ink-muted}   # interactive fields need a >=3:1 edge (WCAG 1.4.11); border token is decorative-only
    radius: '{rounded.md}'
    text-color: '{colors.ink}'
    placeholder-color: '{colors.ink-muted}'
    focus-border: 1px solid {colors.sky-deep}
    error-border: 1px solid {colors.error}
    padding: '{spacing.3} {spacing.4}'
    font: '{typography.body}'
  footer:
    background: '{colors.surface-sunken}'
    border-top: 1px solid {colors.border}
    text-color: '{colors.ink}'   # ink not ink-muted: ink-muted fails AA on surface-sunken (4.22:1)
    link-color: '{colors.ink}'
    heading-font: '{typography.h3}'
    font: '{typography.body}'
---

## Brand & Style

SamThuongShop is a **nature-editorial** store — a print magazine that happens to take payment. The direction is **"Sky & Sedge"**: airy, modern, and quiet, built so that Sam Thuong's bird photography is always the loudest thing on the page. Every layout decision starts from one rule: **the photograph leads, the UI supports.** Chrome recedes into cream and hairline; the image carries the emotion.

The posture is calm and confident, never "discount-store loud." Generous whitespace, restrained type, and a two-hue accent palette borrowed from the birds' own world — the pale blue of open sky, the muted green of sedge and reed. Nothing competes with a kingfisher's cobalt or a heron's slate.

This is a **light-mode-only** system in v1 — no dark theme. The interface is **bilingual Vietnamese + English**; every visual decision must survive both a Vietnamese string ("Thêm vào giỏ") and its English twin ("Add to cart") without breaking, and every glyph must render Vietnamese diacritics cleanly (Sâm Thương, Bói cá lam, Diệc xám).

## Colors

The palette is a warm cream field with two nature accents. There is a hard split between **soft** and **deep** variants: soft hues are for decoration and large calm areas; deep hues carry any text or interactive fill. Every deep pairing below has been chosen to pass **WCAG AA (≥4.5:1) on the `{colors.bg-page}` cream** — the soft variants deliberately do not, which is why they are barred from text.

- **`bg-page` #FBF9F4** — the warm-cream canvas behind everything. The default page background. Never used for text or on top of imagery.
- **`surface` #FFFFFF** — pure white for cards, inputs, nav, and any raised content. Gives photos a clean mount. Not used as a page background (that stays cream).
- **`surface-sunken` #F1EDE4** — a recessed tone for the footer, status-pill fields, and quiet section bands. Signals "lower layer," never used for primary content areas.
- **`border` #E4DFD3** — the hairline. This is the workhorse of the whole system: it frames photos, separates cart lines, and outlines cards. It replaces shadow as our depth mechanism. Never used as fill or text.
- **`ink` #3B4147** — the primary text color for both headings and body, and the color of **VND prices**. Passes AA comfortably on cream and white. The default for anything a reader must read.
- **`ink-muted` #6B7178** — secondary text: meta lines, helper copy, inactive states, placeholder text. AA on cream. Not for long body passages.
- **`caption-deep` #71736B** — reserved for photo captions and image meta (species, location, date). A slightly warm neutral that sits under an image without stealing from it, while still clearing AA. Not used for UI labels.
- **`sky-soft` #7E9AAB** — decorative sky-blue for large calm areas only: hero wash panels, illustrative dividers, empty-state art. **Never text, never a small control.**
- **`sky-deep` #4C6577** — the **primary interactive** color: links, primary-button fill, focus rings, selected states. AA on cream and white. This is the one hue users learn to mean "clickable."
- **`sage-soft` #8B9B7A** — decorative sage-green for tags and category flags rendered as filled chips backed by their own deep text. Large/decorative use only, never small text on cream.
- **`sage-deep` #5E6F4B** — the **secondary interactive** color: secondary-button outline/text, secondary links. Used sparingly so it never rivals `sky-deep`. AA on cream and white.
- **`success` #4F7A52** — the *Paid* / *Completed* order state. Used for the status **dot** (and for short status text on cream/white, where it passes AA); on the `{colors.surface-sunken}` status pill the label stays `{colors.ink}` and this hue rides the dot. AA on cream, not on sunken.
- **`pending` #96681F** — the *Pending Payment* / *Processing* / awaiting state (a muted amber-brown, not a yellow). Same rule as `success`: dot hue and cream/white status text only; the pill label is `{colors.ink}`. AA on cream, not on sunken.
- **`error` #A85248** — *Failed* / *Cancelled* states and input validation errors. AA on cream. Never decorative.
- **`info` #4C6577** — informational notices; intentionally the same value as `sky-deep` so system messaging reads as part of the primary voice.

**Accent discipline:** only two accent hues live on any screen — sky and sage. No third accent is introduced. Semantic colors (success/pending/error) are status vocabulary, not brand accents, and appear only inside status affordances and validation.

## Typography

Two families, both loaded with the **Vietnamese subset** so every diacritic (ầ, ế, ị, ọ, ữ) renders natively in both languages:

- **Lora** (serif, weights 600 / 700) — the editorial voice. All headings and display type. Its literary warmth gives the store its magazine feel and pairs naturally with wildlife photography.
- **Inter** (sans, weights 400 / 500) — the quiet functional voice. All body copy, UI labels, prices, form text, and captions. Neutral, highly legible on mobile, and complete across the Vietnamese subset.

**The ramp** (`{typography.*}`):

| Role | Family | Size | Weight | Line height |
|---|---|---|---|---|
| `display` | Lora | 56px | 700 | 1.08 |
| `h1` | Lora | 40px | 700 | 1.15 |
| `h2` | Lora | 30px | 600 | 1.2 |
| `h3` | Lora | 22px | 600 | 1.3 |
| `body-lg` | Inter | 18px | 400 | 1.65 |
| `body` | Inter | 16px | 400 | 1.6 |
| `caption` | Inter | 13px | 500 | 1.45 |

`display` is reserved for the portfolio/home hero. `h3` is the product title on cards. `caption` (with slight tracking) is the uppercase-optional label used for nav items, availability hints, and status pills. **Rules:** headings never use Inter; prices and UI never use Lora. Because Vietnamese words run longer and stack more diacritics, headings must be allowed to wrap to a second line gracefully — never truncate a species name.

## Layout & Spacing

A **4px base scale** drives all spacing: `{spacing.1}`–`{spacing.9}` = 4, 8, 12, 16, 24, 32, 48, 64, 96px. Named tokens: `{spacing.gutter}` (24px column gutter), `{spacing.margin-desktop}` (32px) and `{spacing.margin-mobile}` (20px) for page edges. Content is capped at `{spacing.max-content}` (~1200px) and centered.

The grid is a **12-column** desktop grid with 24px gutters. Whitespace is a feature, not leftover space: sections breathe with `{spacing.8}`–`{spacing.9}` vertical rhythm so the eye rests between photographs.

**Asymmetric hero rhythm** is the signature move: a **wide photograph (8 columns) paired with a narrow copy column (4 columns)** — image dominant, text deferential. Product detail follows the same split: large image left, variant/price column right.

**Breakpoints (responsive web, mobile-first):**
- **Mobile (< 640px):** single column, 20px margins, no horizontal scroll ever. Hero photo goes full-bleed above stacked copy. Product grid = 1–2 columns.
- **Tablet (640–1024px):** 6–8 column feel; product grid = 2–3 columns; margins ease toward 32px.
- **Desktop (> 1024px):** full 12-column grid, 32px margins, asymmetric hero active; product grid = 3–4 columns.

## Elevation & Depth

**Flat editorial.** Depth comes from **whitespace and the `{colors.border}` hairline**, not from shadows. Cards, product tiles, gallery items, and inputs sit on the page with a 1px `{colors.border}` outline and generous surrounding space — they are *framed*, like plates in a book, never *floated*.

Exactly **one** shadow token exists, `{shadows.overlay}` (`0 6px 24px -8px rgba(59,65,71,0.18)`), and it is reserved for **transient overlays only**: the nav dropdown, the cart drawer, and modals. If an element is part of the page, it gets a hairline; if it floats above the page temporarily, it gets the overlay shadow. Nothing else casts a shadow — resting cards never do.

## Shapes

Radius encodes what a thing *is*:

- **Buttons → `{rounded.full}` (9999px, pill).** The one soft, friendly, obviously-tappable shape. Pills read as "action" and give the quiet UI a single warm gesture.
- **Cards & inputs → `{rounded.md}` (6px).** A gentle rounding that feels modern and calm without turning tech-y. The default container radius.
- **Photographs & gallery images → `{rounded.sm}` (2px) or `{rounded.none}`, always with a `{colors.border}` hairline frame.** This is the editorial rule: a photograph is a print on a page, mounted with a thin margin-line, not a rounded app thumbnail. Sharp corners keep the image honest and gallery-like.

The logic: soft where the user acts (pills), calm where the UI holds content (6px), sharp and framed where the photography lives (2px + hairline).

## Components

Token references resolve against the frontmatter above.

### top-nav
Full-width bar, `{components.top-nav.height}` tall, `{colors.surface}` background with a `{colors.border}` bottom hairline (no shadow at rest). Left: wordmark in Lora. Center/right: nav links in `{typography.caption}`, color `{colors.ink}`, hover `{colors.sky-deep}`. Far right: the language-toggle. On mobile it collapses to a hamburger opening a menu that uses `{shadows.overlay}` (it is transient).

### language-toggle
An inline `EN | VN` pair in `{typography.caption}`. Active language is `{colors.ink}`; inactive is `{colors.ink-muted}`; the `|` separator is `{colors.border}`. No pill, no box — a quiet text switch. Persists the choice across pages for the session.

### button-primary
Pill (`{rounded.full}`), solid `{colors.sky-deep}` fill, white label in `{typography.caption}`, padding `{spacing.3} {spacing.5}`. Hover darkens to `#3D5464`; focus shows a **2px `{colors.ink}` ring offset 2px from the fill** — a same-color `{colors.sky-deep}` ring on a `{colors.sky-deep}` button is invisible and is forbidden. Disabled = `{colors.surface-sunken}` fill with `{colors.ink-muted}` text. Example labels: "Add to cart" / "Thêm vào giỏ", "Checkout" / "Thanh toán".

### button-secondary
Pill, transparent fill, `{colors.sage-deep}` text and 1px `{colors.sage-deep}` border. Hover fills `{colors.surface-sunken}`. Used for lower-priority actions ("Continue shopping" / "Tiếp tục mua"). Never competes visually with primary.

### product-card
`{colors.surface}` card at `{rounded.md}`. Top: the bird photograph at `{rounded.sm}` with a `{colors.border}` hairline frame (photo leads). Below, spaced by `{spacing.3}`: species title in `{typography.h3}` `{colors.ink}` (e.g. *Bói cá lam / Common Kingfisher*); an **availability hint** in `{typography.caption}` `{colors.ink-muted}` showing format — "Bản in · Bản số" / "Print · Digital"; and the VND price in `{typography.body}` `{colors.ink}` — e.g. **980.000₫**. No shadow; the hairline and whitespace do the lifting.

### variant-selector
A row of selectable options at `{rounded.md}`, each a 1px `{colors.ink-muted}` chip with `{colors.ink}` label (interactive edge ≥ 3:1). Selected = 1px `{colors.sky-deep}` border and `{colors.sky-deep}` label. Two groups: **Print sizes** — "A4 · A3 · A2" (e.g. A3 1.250.000₫) — and **Digital tiers** — "Bản web · Bản in / Web-res · Print-res" (e.g. 350.000₫ · 650.000₫) `[ASSUMPTION: tier names/count pending PRD Open Question 4]`. Unavailable options are `{colors.ink-muted}` and non-interactive.

### watermark-badge
Small overlay tag pinned on a digital preview image. Background `rgba(59,65,71,0.72)`, white `{typography.caption}` label, `{rounded.sm}`. Reads "XEM TRƯỚC · CÓ ĐÓNG DẤU / WATERMARKED PREVIEW". Signals the file is protected until purchase.

### cart-line
A row separated from the next by a `{colors.border}` bottom hairline, `{spacing.4}` gap. Left: thumbnail at `{rounded.sm}` with hairline frame. Middle: title `{colors.ink}` + variant meta (`{colors.ink-muted}`), e.g. "Bản in A3 / Print A3". Right: line price in `{colors.ink}`. Quantity stepper for prints; digital lines are locked to qty 1.

### status-pill
Pill (`{rounded.full}`) on `{colors.surface-sunken}`, `{typography.caption}` label in `{colors.ink}` with a leading colored **dot**. The dot carries the status hue: **Paid / Completed** → `{colors.success}` ("Đã thanh toán / Paid"); **Pending Payment / Processing** → `{colors.pending}` ("Chờ thanh toán / Awaiting payment"); **Shipped** → `{colors.info}` ("Đã gửi / Shipped"); **Failed / Cancelled** → `{colors.error}` ("Đã huỷ / Cancelled"). The label stays `{colors.ink}` — the status hues fail AA as small text on the sunken pill (success 4.24:1, pending 4.18:1), so color lives in the dot, meaning in the word. Never a loud fill.

### gallery-item
Portfolio tile: the image at `{rounded.sm}` with a `{colors.border}` hairline, an optional caption beneath in `{typography.caption}` `{colors.caption-deep}` (species / place, e.g. *Diệc xám — Vườn quốc gia Xuân Thủy*). If it links to a Product, the whole frame is the target; no button chrome added over the photo.

### text-input
`{colors.surface}` field, 1px `{colors.ink-muted}` border (interactive fields need a ≥ 3:1 edge per WCAG 1.4.11 — the decorative `{colors.border}` hairline is too faint here), `{rounded.md}`, `{colors.ink}` text, `{colors.ink-muted}` placeholder, padding `{spacing.3} {spacing.4}`. Focus = 2px `{colors.sky-deep}` border. Error = 1px `{colors.error}` border with helper text in `{colors.error}` plus a non-color error icon. Labels sit above in `{typography.caption}` `{colors.ink}`, required fields marked "Bắt buộc / Required" (e.g. "Địa chỉ giao hàng / Shipping address").

### footer
`{colors.surface-sunken}` band with a `{colors.border}` top hairline. Body text `{colors.ink}` (not `{colors.ink-muted}` — it fails AA at 4.22:1 on the sunken band), links `{colors.ink}`, section headings in `{typography.h3}`. Holds nav, contact, About link, and a second language-toggle.

## Do's and Don'ts

**DO**
- **DO let the photography dominate** — the largest, highest-contrast element on any screen is the bird image.
- **DO keep VND prices in `{colors.ink}`** — prices are information, not accents (e.g. 980.000₫).
- **DO frame every photograph with a `{colors.border}` hairline** and small/zero radius, like a print on a page.
- **DO use `{colors.sky-deep}` as the single "clickable" signal** for links and primary actions.
- **DO design every label for both languages** — test the longer Vietnamese string first so layouts never break.
- **DO keep depth flat** — rely on whitespace + hairline; reserve `{shadows.overlay}` strictly for transient overlays.

**DON'T**
- **DON'T put `{colors.sky-soft}` or `{colors.sage-soft}` on text or small controls** — soft variants are decorative/large-area only and fail AA.
- **DON'T add drop-shadows to cards, product tiles, or images at rest** — a resting element gets a hairline, never a shadow.
- **DON'T introduce a third accent hue** — only sky and sage; semantic colors are for status, not decoration.
- **DON'T set headings in Inter or prices/UI in Lora** — the two families do not swap roles.
- **DON'T round photographs like app thumbnails** — that breaks the editorial "print" reading.
- **DON'T let UI chrome compete with a photo** — no heavy buttons or loud fills layered over imagery.
- **DON'T introduce a dark theme in v1** — this is a light-mode-only system.
