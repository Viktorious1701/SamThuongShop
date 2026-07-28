---
name: SamThuongShop
description: Experience contract for SamThuongShop — IA, behavior, states, flows, and accessibility.
status: final
created: 2026-07-18
updated: 2026-07-18
sources:
  - ../../prds/prd-SamThuongShop-2026-07-18/prd.md   # finalized PRD (25 FRs) — inherited by reference
design: ./DESIGN.md   # visual identity peer; tokens referenced via {path.to.token}
---

# SamThuongShop — Experience Spine

> This spine owns **how it works**: information architecture, behavior, states, flows, and the accessibility floor. The **look** — colors, type, shape, spacing — lives in `DESIGN.md`, referenced here by token name via `{path.to.token}` (e.g. `{colors.sky-deep}`, `{typography.h1}`, `{rounded.full}`). When this spine and any mockup disagree, the spine wins. Token names follow the Sky & Sedge set locked in `DESIGN.md` (neutrals `bg-page`/`surface`/`surface-sunken`/`border`; ink `ink`/`ink-muted`/`caption-deep`; accents `sky-soft`/`sky-deep`/`sage-soft`/`sage-deep`; status `success`/`pending`/`error`/`info`).

## Foundation

- **Form factor:** responsive web, mobile + desktop. **No native app.** Mobile is first-class — buyers arrive from phones and social links (PRD §10, UJ-1).
- **Theme:** **light mode only** for v1. Dark mode is out of scope.
- **Bilingual:** Vietnamese + English, with an **EN | VN toggle** in the top nav. **Vietnamese is primary, English secondary.** Missing translations **fall back to Vietnamese** (FR-25).
- **Visual direction:** "Sky & Sedge" — airy modern-magazine, asymmetric editorial layout, photography always leads, UI stays quiet. See `DESIGN.md` for the full look.
- **Navigation:** one unified top nav — **Home · Shop · Portfolio · About · Contact**, plus cart and the EN|VN toggle. **Shop and Portfolio are peers** (the store and the showcase have equal standing).
- **Scope:** **customer-facing only.** A single-operator admin exists (product/variant/collection, order, and portfolio/About management — FR-11, FR-12, FR-19–FR-23) but is specified only lightly from the spine tables; it has no dedicated screens or flows in this document.

## Information Architecture

### Nav / sitemap

```
Global chrome (top nav + footer + EN|VN toggle)
├── Home
├── Shop ──────────┬── Collection page ──── Product detail ──── Cart ──── Checkout ──── Order confirmation
│                   └── (basic search)                                                        │
├── Portfolio ───── Gallery ──(image → optional linked Product detail)                        │
├── About                                                                        Order status / tracking
├── Contact                                                                                   │
├── Cart (icon) ──── Checkout ──── Order confirmation ──── Order status                        │
└── Account ──── Order history ──── Re-download ◄──────────────────────────────────────────────┘
                 (register / login / logout)
[Operator admin — separate authenticated area, out of scope for screens]
```

### Surfaces → PRD FRs

| # | Surface | Purpose | Reached from | FRs |
|---|---|---|---|---|
| 1 | **Home / landing** | Image-led entry; featured Products + Collections, portfolio teaser, brief About hook | Nav "Home" / logo / cold entry | FR-1, FR-16, FR-25 |
| 2 | **Shop catalog** | All published Products, grouped by Collection, with basic name/Collection search | Nav "Shop" | FR-1, FR-3, FR-25 |
| 3 | **Collection page** | One curated grouping (species / habitat / theme); its Products only | Shop, Home feature, footer | FR-1 |
| 4 | **Product detail** | Variants (print sizes / digital tiers), watermarked preview, VND price, License, add-to-cart, made-to-order note | Catalog, Collection, Portfolio image link, search | FR-2, FR-4, FR-15, FR-25 |
| 5 | **Cart** | Line items, qty rules (digital qty=1), VND running total | Nav cart icon, "Add to cart" toast | FR-4, FR-7 |
| 6 | **Checkout** | Guest/account, conditional shipping (physical only), payment-method select (incl. COD rules), order summary in VND | Cart | FR-5, FR-6, FR-7, FR-8, FR-9, FR-15 |
| 7 | **Order confirmation** | Order # + on-screen + email confirmation; transfer instructions / COD note / digital delivery entry | Checkout submit | FR-10, FR-9, FR-13 |
| 8 | **Order status / tracking** | Guest lookup via Order reference; status + shipment note; guest re-download request | Confirmation link, footer "Track order", email | FR-10, FR-14 |
| 9 | **Account** | Register / login / logout; order history; digital re-download | Nav "Account", checkout upsell | FR-24, FR-10, FR-14 |
| 10 | **Portfolio galleries** | Gallery grid + lightbox; image may link to a Product | Nav "Portfolio", Home teaser | FR-16 |
| 11 | **About / profile** | Bilingual bio, professional standing | Nav "About", Home hook | FR-17 |
| 12 | **Contact** | Contact form or listed channels | Nav "Contact", footer | FR-18 |
| 13 | **Global chrome** | Persistent nav, footer, language toggle, cart indicator | Everywhere | FR-25, nav |
| — | *Operator admin* | *Products/variants/collections, orders, portfolio/About — single user, no customer-facing screens* | *Separate auth area* | *FR-11, FR-12, FR-19–FR-23* |

### Reference mockups

Full HTML mockups of the four highest-signal surfaces live in [`mockups/`](./mockups/) — [product detail](./mockups/mock-product-detail.html), [shop catalog](./mockups/mock-shop-catalog.html), [checkout](./mockups/mock-checkout.html), [portfolio](./mockups/mock-portfolio.html). They illustrate the Sky & Sedge look with real content; **where a mockup and these spines disagree, the spines win** (the mockups predate the final review fixes to focus rings, input borders, and status pills).

### Surface closure

**Holds.** Every customer-facing PRD need has a landing surface, and every surface has an entry flow:
- FR-1→(1,2,3) · FR-2→4 · FR-3→2 · FR-4→(4,5) · FR-5,6,7→6 (7 also on 5) · FR-8,9→6 · FR-9,10,13→7 · FR-10,14→(8,9) · FR-15→(4,6) · FR-16→10 · FR-17→11 · FR-18→12 · FR-24→9 · FR-25→13.
- Operator-only FRs (FR-11, FR-12, FR-19–FR-23) map to the admin area, intentionally out of scope for screens.
- No customer FR is orphaned; no customer surface lacks a reachable entry.

## Voice and Tone

Warm, knowledgeable, calm — a **nature-journal** voice, in **both** languages. Confident about the photography, never pushy or "discount-store" loud. Vietnamese copy reads as native (natural diacritics, no machine-translation stiffness), not as a translation of the English. Brand voice proper (adjectives, aesthetic posture) lives in `DESIGN.md` Brand & Style; this table governs functional microcopy.

| Do | Don't |
|---|---|
| "Made to order" / "Đặt in theo yêu cầu" | "Out of stock" / "In stock — hurry!" |
| "Awaiting transfer" / "Chờ chuyển khoản" | "Payment pending ⏳ — action required!!" |
| "Your download is ready." / "Ảnh của bạn đã sẵn sàng để tải về." | "SUCCESS! Click here now" |
| Short, complete sentences; one idea per line. | Exclamation stacking, urgency countdowns, faux scarcity. |

### Key bilingual strings (VN primary · EN secondary)

| Intent | Vietnamese | English |
|---|---|---|
| Add to cart | Thêm vào giỏ | Add to cart |
| Made to order | Đặt in theo yêu cầu | Made to order |
| Order confirmed | Đã xác nhận đơn hàng | Order confirmed |
| Awaiting transfer | Chờ chuyển khoản | Awaiting transfer |
| Download ready | Ảnh đã sẵn sàng để tải về | Your download is ready |
| Empty cart | Giỏ hàng của bạn đang trống | Your cart is empty |
| Search | Tìm kiếm | Search |
| Track your order | Theo dõi đơn hàng | Track your order |
| Continue shopping | Tiếp tục mua sắm | Continue shopping |

## Component Patterns

Behavioral only — every visual spec (fill, radius, type ramp) lives in `DESIGN.md.Components`. Colors named here are semantic references.

| Component | Behavioral rules |
|---|---|
| **Top nav + language toggle** | Sticky on scroll. Holds Home/Shop/Portfolio/About/Contact + cart + EN\|VN. Toggle flips the whole UI language in place, **stays on the current surface** (no reload to Home), persists the choice for the session, and sets `lang=vi`/`lang=en` on the document. Cart shows a live item-count indicator (no count when empty). On `< md`, links collapse into a menu (see Responsive). CTA fills use `{colors.sky-deep}`. |
| **Product card** | Image leads (photo fills the top; frame and radius are DESIGN's — see `product-card`). Shows Product name (`{typography.h3}`), species+location caption (`{typography.caption}` in `{colors.caption-deep}`), a from-price in VND (`{typography.body}`), and a type tag (Print / Digital / Both) in `{colors.sage-deep}`. Whole card is one click target → Product detail. No hover-only affordances on touch. |
| **Variant selector** | Two axes on a dual Product: **Physical Print size** (A4 / A3 / A2) and **Digital tier** (**Web-res / Print-res**) `[ASSUMPTION: exact tier names/count pending PRD Open Question 4]`. Selecting a Variant **updates the displayed price** and **updates shipping applicability**: choosing a Physical Print marks the line shipping-relevant; choosing a Digital Download marks it shipping-exempt and pins **quantity to 1**. Unpublished Products never render this control. |
| **Watermarked preview** | Digital tiers display a **watermarked** image only; the un-watermarked file is never delivered to the client before purchase (FR-2, counter-metric SM-C2). Lightbox-zoomable but still watermarked. Physical Prints show the clean display image (the deliverable is the print, not the file). |
| **Cart line** | Shows thumbnail, name, Variant label, unit price, qty stepper, line total (VND). **Digital lines lock qty at 1** — the stepper is disabled with the note "Digital images are sold once per order" / "Ảnh số chỉ bán một bản mỗi đơn". Remove control per line; removing the last line → empty-cart state. |
| **Checkout payment selector** | Radio set of enabled methods: Momo, ZaloPay, bank transfer, COD. **Hides the shipping step entirely** for digital-only carts (FR-6). **Disables COD** for any cart containing a Digital Download, with an inline reason: "COD isn't available for digital images" / "COD không áp dụng cho ảnh số" (FR-8). Bank transfer reveals transfer instructions + Order reference on submit. |
| **Status pill** | Compact pill on `{colors.surface-sunken}` with a **leading colored dot + an `{colors.ink}` label** (the label is never the status hue — that fails AA on the sunken pill; the dot carries the color). Dot maps 1:1 to Order Status: `{colors.success}` = Paid/Completed; `{colors.pending}` = Pending Payment / Awaiting transfer / Processing; `{colors.info}` = Shipped; `{colors.error}` = Cancelled/Failed. The label text is bilingual per the toggle and carries the meaning for colorblind users (never color alone). |
| **Gallery grid** | Masonry/asymmetric grid of portfolio images. Tap/click opens a **lightbox** (overlay uses `{shadows.overlay}`); arrow keys and swipe move between images, `Esc` closes. If an image is linked to a Product, the lightbox shows a "View this print" / "Xem bản in này" action → Product detail. Not all gallery images are for sale. |
| **Forms** | (register, login, address, contact, guest order-lookup) Every field has a visible label (never placeholder-only). Inline validation on blur and on submit; errors sit beneath the field in `{colors.error}` with text, not color alone. Primary submit uses `{colors.sky-deep}`; disabled while a required field is invalid or a request is in flight. |

## State Patterns

Status colors are used semantically: `{colors.success}` (delivered/paid), `{colors.pending}` (awaiting/processing), `{colors.info}` (shipped), `{colors.error}` (failed/problem). In every case a text label accompanies the color (never color alone).

| State | Surface | Treatment |
|---|---|---|
| **Empty cart** | Cart | "Your cart is empty" / "Giỏ hàng của bạn đang trống", quiet illustration, single link → Shop ("Continue shopping" / "Tiếp tục mua sắm"). Never a dead end. |
| **Loading (image-heavy)** | Home, Catalog, Collection, Portfolio | Skeleton blocks sized to the grid resolve into images; images lazy-load below the fold with low-quality placeholders → full asset (see Responsive). Layout never reflows/jumps as images arrive (reserved aspect ratios). |
| **Made-to-order availability** | Product detail, Product card | Physical Prints are **always purchasable while published** — copy is "Made to order" / "Đặt in theo yêu cầu" with a handling note, **never "out of stock"** and never a stock count (FR-2). Unpublished Products simply do not appear. |
| **Payment pending — bank transfer** | Order confirmation, Order status | Order Status = *Pending Payment*, status pill "Awaiting transfer" / "Chờ chuyển khoản" in `{colors.pending}`. Transfer details + Order reference shown; copy states the Order is held until the Operator confirms (FR-9). Nothing is delivered/shipped yet. |
| **Payment placed — COD** | Order confirmation, Order status | Physical-only COD Order is placed as *Processing*; pill "Processing" / "Đang xử lý". Copy: pay the courier on delivery; Operator marks Paid on cash receipt (FR-8). |
| **Payment failed / abandoned** | Return to Order status / Checkout | Order **stays *Pending Payment*** and is not fulfilled (UJ-1 edge). Message in `{colors.error}`: "Payment didn't complete — your order is saved. Try again." / "Thanh toán chưa hoàn tất — đơn hàng đã được lưu. Vui lòng thử lại." with a resume-payment action. No duplicate Order created on retry. |
| **Digital delivery success** | Order confirmation, email, Account | On *Paid*, "Your download is ready" / "Ảnh đã sẵn sàng để tải về" in `{colors.success}`; secure Download Link on-screen and by email. Digital-only Order shows *Completed* once the link is issued (FR-13). |
| **Download-link expired → re-download** | Account order history / guest Order lookup | Expired link shows "This link has expired" / "Liên kết đã hết hạn" (neutral, not error) with a re-issue action. **Signed-in:** re-download from order history. **Guest:** request a fresh link via Order reference; new time-limited link issued (FR-14). Cancelled Orders' links are invalidated and cannot be re-issued (FR-12). |
| **Form validation errors** | All forms | Inline, beneath the field, `{colors.error}` + text + `aria-describedby`; the first invalid field receives focus on failed submit. Required VN/EN field labels localize with the toggle. |
| **Guest order-lookup** | Order status / tracking | Guest enters Order reference (from confirmation/email) to see status, shipment note, and — for digital — request re-download. No account required (FR-10, FR-14). Unknown reference → "We couldn't find that order — check the reference from your confirmation email." / "Không tìm thấy đơn hàng — vui lòng kiểm tra mã trong email xác nhận." |
| **Search / filter no-results** | Shop catalog, Collection | Empty result set (common: a social link lands mid-search) shows "No birds match that search" / "Không tìm thấy loài chim phù hợp" with a one-tap "Clear search / Xem tất cả" back to the full catalog. Never a blank page or dead end. |
| **Unavailable / unpublished Product** | Product detail (direct/stale link) | A stale social or bookmarked link to an unpublished or removed Product shows a calm "This piece isn't available right now" / "Tác phẩm này hiện không có sẵn" with links to Shop and Portfolio — not a raw 404. Published-state is the only availability control (no stock, FR-2). |

## Interaction Primitives

- **Click/tap to act.** Whole product cards and gallery tiles are single targets; no reliance on hover to reveal primary actions.
- **Add-to-cart** confirms with a brief non-blocking toast ("Added to cart" / "Đã thêm vào giỏ") + cart-count update; it does **not** force a redirect to Cart.
- **Lightbox** (Portfolio): arrow keys / swipe to navigate, `Esc` to close, focus trapped while open, focus restored on close.
- **Language toggle** acts in place, never navigates away.
- **Banned:** urgency countdowns, faux stock scarcity, auto-playing carousels/hero motion on load, hover-only affordances on `sm`, modal stacks more than one level deep.

## Accessibility Floor

Behavioral floor; visual contrast is proven in `DESIGN.md`. **All text/CTA tokens (`sky-deep`, `sage-deep`, `pending`, `caption-deep`, `success`, `error`) pass WCAG AA** for their text/CTA use per the Sky & Sedge contrast board — the `soft` variants are decorative/large-area only.

- **Keyboard nav + visible focus:** every interactive element reachable and operable by keyboard; **the focus ring must contrast with the control it sits on** (primary buttons use an `{colors.ink}` ring offset from the `{colors.sky-deep}` fill — a same-color ring is invisible and is banned); `Tab` order follows reading order on every surface.
- **Overlay focus management:** the lightbox, cart drawer, and mobile menu are all modal overlays — each **traps focus while open, restores focus to its trigger on close**, closes on `Esc`, and uses `role="dialog"` / `aria-modal="true"`. No overlay is keyboard-escapable only by mouse.
- **Page structure:** a "Skip to content" link is the first focusable element on every page; landmark regions (`header`/`nav`/`main`/`footer`) wrap the sticky nav and content; exactly one `<h1>` per surface with no skipped heading levels.
- **Alt text convention for bird photography:** every photographic image carries alt text as **"{Species} — {location}"** (e.g. "Common Kingfisher — Xuân Thủy National Park" / "Bồng chanh — Vườn quốc gia Xuân Thủy"); purely decorative imagery uses empty alt. Localizes with the toggle.
- **Form labels/errors:** visible `<label>` per field; **required fields carry a visible non-color marker (e.g. "Required" / "Bắt buộc") plus `aria-required`** — asterisk-only or color-only is not enough; errors associated via `aria-describedby`; error state conveyed by text + icon, not color alone.
- **Target sizes:** interactive targets ≥ 44×44px (mobile-first buyers), with adequate spacing between adjacent controls.
- **Language attribute switching:** the toggle sets `lang="vi"` / `lang="en"` on the document root so screen readers use correct pronunciation; per-node `lang` where a surface mixes languages (e.g. a not-yet-translated Vietnamese fallback string inside an EN page).
- **Reduced motion:** honor `prefers-reduced-motion` — drop the add-to-cart toast fade and lightbox transitions, show end state immediately; no parallax/auto-motion.

## Key Flows

Named-protagonist journeys mirroring PRD UJ-1, UJ-2, UJ-3 verbatim in intent.

### Flow 1 — Lan buys a framed-worthy kingfisher print, pays with Momo (UJ-1)

**Entry state:** Lan, an amateur birdwatcher in Hanoi, unauthenticated, on her phone, arriving from a social link straight to a **Product detail** page.

1. Product detail loads image-first: "Common Kingfisher at Dawn" / "Bồng chanh lúc bình minh", Xuân Thủy National Park. Made-to-order note is shown — no stock count.
2. She uses the **variant selector**, choosing **Physical Print · A3** (850.000₫); the price updates and the line is marked shipping-relevant.
3. She taps **Add to cart** / **Thêm vào giỏ**; a toast confirms and the cart indicator ticks to 1.
4. She opens the **Cart**, sees the A3 print line and VND total, taps **Checkout**.
5. She checks out **as a guest** (FR-5), enters her shipping address (required — cart holds a print, FR-6).
6. Order summary shows item subtotal + flat shipping fee + grand total in VND (FR-7). She selects **Momo** and pays.
7. **CLIMAX:** the **Order confirmation** appears — "Order confirmed" / "Đã xác nhận đơn hàng" with a unique **order number** and a handling/shipping note; the same lands in her email. The "we've got your order" moment is where the value lands.
8. **Resolution:** she waits for delivery; the Operator sees the Order and ships it (admin, FR-11).
- **Edge case:** if her Momo payment fails or she abandons it, the Order **stays *Pending Payment*** and is not fulfilled; she returns via the confirmation/status link and pays again — no duplicate Order.

*Surfaces:* 4 → 5 → 6 → 7 (→ 8). *Components:* variant selector, cart line, checkout payment selector, status pill.

### Flow 2 — Minh buys and downloads a digital heron image (UJ-2)

**Entry state:** Minh, unauthenticated, on desktop, browsing a **Collection** ("Wetland Herons" / "Diệc vùng đầm lầy").

1. He opens a **Product detail** for "Grey Heron in Mist" / "Diệc xám trong sương", Tràm Chim National Park, and sees a **watermarked preview**.
2. He selects **Digital Download · Print-res** (650.000₫); qty is pinned to 1; the shipping applicability flips off. The **personal-use License** is shown on the page (FR-15).
3. He adds it to the cart and goes to **Checkout**. Because the cart is digital-only, the **shipping step is hidden** and **COD is disabled** (FR-6, FR-8).
4. He pays via **ZaloPay** (or bank transfer — which would hold the Order at *Awaiting transfer* until the Operator confirms, FR-9).
5. On payment confirmed, the Order reaches *Paid* and the digital-only Order moves to *Completed*.
6. **CLIMAX:** "Your download is ready" / "Ảnh đã sẵn sàng để tải về" in `{colors.success}`; a **secure, time-limited Download Link** appears on-screen and by email, and the download of the **un-watermarked** file begins. Value lands the moment the download starts.
7. **Resolution:** he can re-download within the link window, or from his **Account** if he created one (FR-14).
- **Edge case:** if the Download Link expires, he requests a **fresh link** via his Order reference (guest) or re-downloads from Account order history — no re-purchase.

*Surfaces:* 3 → 4 → 5 → 6 → 7 (→ 8/9). *Components:* watermarked preview, variant selector, checkout payment selector, status pill.

### Flow 3 — A visitor evaluates Sam Thuong's work (UJ-3, lighter)

**Entry state:** a potential buyer/collaborator lands on **Home** from a shared link.

1. Home leads with photography and a portfolio teaser; the visitor taps into **Portfolio**.
2. They browse the **gallery grid** and open images in the **lightbox** (keyboard/swipe navigation).
3. They read Sam Thuong's short bilingual bio on **About**, forming an impression of his professionalism.
4. **CLIMAX:** a gallery image they admire — "Sarus Crane at Tràm Chim" / "Sếu đầu đỏ ở Tràm Chim" — carries a **"View this print" / "Xem bản in này"** link; the showcase converts to a buyable **Product detail** without leaving the story. The portfolio has done its job: browsing becomes buying (or contacting).
5. **Resolution:** they either add a Product to cart (entering Flow 1/2) or use **Contact** to reach him (FR-18).
- **Edge case:** an image with no linked Product simply shows no purchase action — the lightbox stays a viewing surface, no dead "buy" affordance.

*Surfaces:* 1 → 10 → 11 → (4 or 12). *Components:* gallery grid + lightbox, product link.

## Responsive & Platform

**Mobile-first behavior** — buyers arrive from phones and social links (PRD §10, UJ-1); phone is the primary buying surface, desktop is the richer showcase.

| Breakpoint | Behavior |
|---|---|
| `≥ lg` (desktop) | Full top nav inline. Home & catalog use the asymmetric multi-column editorial grid; Product detail is two-column (image left, buy panel right); Portfolio masonry at full width. |
| `md` (tablet) | Grids reflow to 2 columns; Product detail may keep two columns or stack the buy panel below the image. |
| `< md` (mobile) | Nav links **collapse into a menu** (toggle button); the EN\|VN toggle and cart stay reachable in the top bar. All grids reflow to **1 column**, no horizontal scroll (FR-1). Product detail stacks image → variant selector → price → add-to-cart; a sticky bottom **Add to cart** bar is available. Checkout is a single scrollable column. |

**Image loading strategy:** reserve aspect-ratio boxes so layout never jumps; lazy-load below-the-fold imagery with low-quality placeholders resolving to optimized responsive images (PRD §10 image performance); prioritize the above-the-fold hero/product image. Watermarked previews are served at preview resolution only.

## Internationalization (VN / EN) *[invented section]*

- **Toggle behavior:** the EN|VN control in the top nav switches the entire UI **in place** on the current surface, persists the choice for the session, and sets the document `lang`. [ASSUMPTION] persistence is session-scoped (cookie/localStorage); the PRD guarantees only "persists across pages for the session" (FR-25).
- **Content model:** UI labels, **Product name + description**, and **About text/captions** are authored in **both** Vietnamese and English by the Operator (FR-19, FR-22, FR-25). Portfolio captions follow the same dual-language model.
- **Fallback rule:** if a translation is missing for the active language, **fall back to Vietnamese** (FR-25); mark such a node with its true `lang="vi"` so assistive tech pronounces it correctly even inside an EN page.
- **Currency:** **always VND**, in every language, formatted Vietnamese-style (e.g. `1.200.000₫`) — currency does **not** change with the language toggle (PRD: domestic Vietnam, VND only).
- **URL / lang handling:** [ASSUMPTION] the PRD is silent on URL structure. Default is a **single URL per surface** with client-side language state (no `/vi/` vs `/en/` path split) to keep the single-operator system simple; if SEO for both languages becomes a goal (PRD §10 shareability), revisit with `hreflang` and per-language paths. [NOTE FOR UX] confirm whether social link previews (OpenGraph) should render in a fixed language (likely Vietnamese) or follow the sharer's toggle state.
- **Diacritics:** body type (Inter) and headings (Lora) were chosen partly for strong Vietnamese diacritic support (`DESIGN.md` typography); microcopy must be reviewed by a native speaker, not machine-translated.
