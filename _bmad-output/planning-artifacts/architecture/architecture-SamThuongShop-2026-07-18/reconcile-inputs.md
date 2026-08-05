---
title: Architecture Spine ↔ Inputs Reconciliation
subject: ARCHITECTURE-SPINE.md vs PRD / DESIGN.md / EXPERIENCE.md
created: 2026-08-04
status: review
---

# Reconciliation — Architecture Spine vs Source Inputs

Checks whether every load-bearing requirement, behavior, and constraint from the PRD, DESIGN.md, and EXPERIENCE.md lands somewhere in the spine (an AD, a convention, the Capability→Architecture map, or explicit Deferred). Focus is on *quiet* requirements the AD structure can drop.

**Verdict:** Strong coverage. All 25 FRs are mapped and no FR is orphaned. Five genuine gaps/underspecifications remain (digital qty=1 invariant, image-performance strategy, SEO/OpenGraph, email-delivery invariant, and an unflagged payment divergence), plus three minor items.

---

## What LANDED (confirmed coverage)

### PRD FRs 1–25
Every FR appears in the Capability→Architecture map and is governed by at least one AD:

| FR band | Map row | Governing ADs |
|---|---|---|
| FR-1..3 Catalog & storefront | ✓ | AD-2, AD-7, AD-8 |
| FR-4..7 Cart & checkout | ✓ | AD-3, AD-5, AD-8 |
| FR-8,9 Payments | ✓ | AD-4, AD-5 |
| FR-10..12 Orders & fulfillment | ✓ | AD-3, AD-8 |
| FR-13..15 Digital delivery & licensing | ✓ | AD-6, AD-3 |
| FR-16..18 Portfolio & about | ✓ | AD-2, AD-7 |
| FR-19..23 Operator admin | ✓ | AD-9, AD-2 |
| FR-24,25 Accounts & auth | ✓ | AD-9, AD-7 |

**No orphan FR.**

### Quiet PRD requirements
- **SM-C2 (no digital leakage)** — AD-6 binds SM-C2 explicitly: private R2 bucket, presigned post-Paid URL, separate watermarked derivative. LANDED (strong).
- **Guest order lookup** — Conventions/IDs row: "human-facing Order reference a short uppercase code (used for guest lookup, FR-10)." LANDED.
- **Made-to-order (no stock)** — AD-8 rule: "physical prints are made-to-order (no stock)." Deferred confirms no stock model. LANDED.
- **Bank-transfer manual confirmation** — AD-4: "or Operator confirmation for bank-transfer/COD." LANDED.
- **COD physical-only / shipping iff physical** — AD-8: "Shipping applies iff any line is physical; COD is offered iff no line is digital." LANDED.

### EXPERIENCE behaviors implying architecture
- **Watermarked preview generation** — AD-6: "watermarked preview is a separate derivative generated at upload; the original is never served before purchase." LANDED (strong).
- **Order status pill states** — AD-3 fixed status machine (*Pending Payment → Paid → Processing → Shipped → Completed*, + *Cancelled*) maps 1:1 to the DESIGN/EXPERIENCE pill states, including COD entering at *Processing* and digital-only → *Completed*. LANDED.
- **Download presigned + entitlement / re-download / cancel-invalidates** — AD-6 (presigned post-Paid via entitlement-checking Route Handler) + `DownloadGrant` entity + Order-reference convention support guest re-issue and account re-download; a Cancelled order fails the entitlement check. LANDED (mechanism present; expiry *value* is PRD Open Q3, acceptably deferred).
- **A11y floor (skip-link, focus, landmarks)** — presentation-only; the only backend-touching pieces (bilingual alt text "{Species} — {location}", `lang` switching) are covered by AD-7 / next-intl. No backend gap.

### DESIGN
- **Bilingual content** — AD-7 (per-locale `vi`/`en`, next-intl, `vi` fallback). LANDED.
- **VND formatting** — AD-5 (integer VND) + Conventions ("formatted per locale at the edge"); Vietnamese-style `1.200.000₫`. LANDED.
- **Image handling (visual)** — component tokens referenced via `components/ (DESIGN.md tokens)`. Visual-only aspect LANDED (serving/perf aspect is a gap — see below).

---

## What is MISSING / UNDERSPECIFIED

### GAP 1 — Digital Download quantity = 1 is not an invariant
- **Input:** PRD FR-4 ("Digital Download Variants are constrained to quantity 1 per Order"); DESIGN `cart-line` ("digital lines are locked to qty 1"); EXPERIENCE variant-selector + cart-line ("pins quantity to 1"). Load-bearing, appears in all three.
- **Spine status:** AD-8 governs physical/digital fulfillment split (shipping/COD applicability) but says nothing about qty=1. No AD, convention, or map cell states it. It would silently rely on implementation.
- **Suggested addition:** Extend AD-8's rule with: "a Digital Download line is constrained to quantity 1 per Order (enforced in the order/cart service)." Or add a Conventions row under cart/order rules.

### GAP 2 — Image performance / optimization & public-image serving has no architectural home
- **Input:** PRD §10 "Image performance" NFR (optimized/efficient image serving for image-heavy mobile pages); EXPERIENCE Responsive "Image loading strategy" (reserved aspect ratios, lazy-load below fold, low-quality placeholders → optimized responsive images, prioritize above-fold). Image-forward store — this is load-bearing for the core JTBD.
- **Spine status:** R2 holds *private* originals + watermarked previews; but the strategy for serving/optimizing the *public display* product & gallery images (Next/Image, responsive sizes, CDN, private-vs-public asset split) is absent from every AD, convention, and Deferred.
- **Suggested addition:** Add an AD or Conventions row, e.g. "Public display/gallery images are served through Next.js Image optimization with reserved aspect ratios and responsive sizes; only originals and previews live in private R2 (AD-6). Above-the-fold hero/product image is prioritized; below-fold lazy-loads." At minimum, name the display-image serving path.

### GAP 3 — SEO / shareability / OpenGraph absent entirely
- **Input:** PRD §10 "Basic SEO & shareability" NFR (Product/Portfolio pages indexable, good link previews — social links are a key traffic source); EXPERIENCE i18n raises the unresolved OG-language question and notes single-URL vs per-language-path tension for `hreflang`.
- **Spine status:** Not mentioned in any AD, convention, or Deferred. Server-component-first helps implicitly, but metadata/OG/indexability and the language-vs-URL decision are unaddressed.
- **Suggested addition:** Add a Conventions row (page metadata + OpenGraph via App Router `generateMetadata`, default OG locale) and/or a Deferred entry recording the single-URL-vs-`/vi//en/` path decision (EXPERIENCE flags it as open) so it is a conscious choice, not a silent drop.

### GAP 4 — Email delivery of confirmations + download links is an adapter, not an invariant
- **Input:** PRD FR-10 (order confirmation "by email"), FR-13 (Download Link "delivered to the Customer by email"), §10 "Transactional email" NFR (deliverability matters for re-download); EXPERIENCE surfaces 7/8 and Digital-delivery state.
- **Spine status:** Resend appears in the Stack, the integration layer, and the structural seed (`SVC --> MAIL`), so the *adapter* has a home. But no AD or convention states the *behavioral invariant*: that confirmations and post-Paid Download Links are emailed (AD-6 mints the presigned URL but never says it is emailed; AD-3 never mentions confirmation email). The requirement itself is unbound.
- **Suggested addition:** One line on AD-3 (order confirmation email on order creation) and AD-6 (the presigned Download Link is delivered by email on reaching *Paid*), or a Conventions row: "Order confirmations and Download Links are delivered via the Resend adapter; email is required, not best-effort."

### GAP 5 — Payment divergence is Deferred but NOT flagged as a PRD conflict
- **Input:** PRD FR-8, §4.3, §6.1, SM-1, UJ-1 (pays with Momo), UJ-2 (ZaloPay) all treat **Momo + ZaloPay** as in-scope v1 methods; EXPERIENCE checkout payment selector still lists "Momo, ZaloPay, bank transfer, COD" as the enabled radio set.
- **Spine status:** The Deferred section correctly moves Momo/ZaloPay wallets post-launch and ties them to a future `PaymentProvider` (AD-4) — so it *landed as Deferred*. But it is framed as a neutral phasing decision, **not flagged as a divergence** from a PRD that lists them as MVP. The downstream consequence — EXPERIENCE's payment selector must be reconciled to payOS(VietQR)+COD for v1 — is not called out.
- **Suggested addition:** Mark the Deferred bullet as a **divergence flag**: "DIVERGES from PRD FR-8/§6.1/UJ-1–2 which list Momo+ZaloPay as MVP methods; v1 restricts to payOS(VietQR) + COD. UX checkout payment selector (EXPERIENCE) must be updated to match." Route back to PRD/UX owners for sign-off.

### MINOR 1 — License (FR-15) mapped but ungoverned
- Capability map lists FR-15 under "Digital delivery & licensing," but no AD governs it and there is no `License` entity in the ER diagram or Conventions entity list. In v1 it is a single static personal-use license shown on the product/checkout page (PRD §4.5), so treating it as static bilingual content is defensible — but the spine should say so explicitly (one Conventions/Deferred line: "single personal-use License is static bilingual content, no data model in v1") so it is a decision, not an omission.

### MINOR 2 — Published/unpublished visibility rule is only implied
- FR-1/FR-2/FR-19 hinge on a published flag that filters the storefront, and EXPERIENCE requires a calm "This piece isn't available" page (not a raw 404) for stale links to unpublished Products. No AD or convention states that storefront queries filter by published state or that unavailable Products render a soft state. Implied by the product service but worth one Conventions line.

### MINOR 3 — Contact form submission mechanism unspecified
- FR-18 / EXPERIENCE surface 12 allows a contact form. If a form (vs listed channels), it needs a Route Handler/Server Action and likely an email via Resend. Not addressed in any AD or the map beyond the generic Portfolio row. Low risk (PRD allows "listed channels" as an alternative), but note it.

---

## Summary table

| # | Item | Input ref | Where it should live | Status |
|---|---|---|---|---|
| 1 | Digital qty = 1 | PRD FR-4; DESIGN cart-line; EXP variant-selector | AD-8 rule / Conventions | MISSING |
| 2 | Image performance & public-image serving | PRD §10; EXP Responsive | New AD / Conventions | MISSING |
| 3 | SEO / OpenGraph / lang-URL decision | PRD §10; EXP i18n | Conventions + Deferred | MISSING |
| 4 | Email-delivery invariant (confirmations + links) | PRD FR-10, FR-13, §10 | AD-3 / AD-6 / Conventions | UNDERSPECIFIED (adapter only) |
| 5 | Momo/ZaloPay divergence flag | PRD FR-8/§6.1/UJ-1–2; EXP checkout | Deferred (add flag) | UNDERSPECIFIED (deferred, unflagged) |
| 6 | License = static content | PRD FR-15 | Conventions/Deferred | MINOR |
| 7 | Published-state filtering + soft-unavailable | PRD FR-1/2/19; EXP states | Conventions | MINOR |
| 8 | Contact form submission | PRD FR-18; EXP surface 12 | Portfolio map / note | MINOR |
