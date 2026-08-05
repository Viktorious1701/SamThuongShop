---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - prds/prd-SamThuongShop-2026-07-18/prd.md
  - architecture/architecture-SamThuongShop-2026-07-18/ARCHITECTURE-SPINE.md
  - ux-designs/ux-SamThuongShop-2026-07-18/DESIGN.md
  - ux-designs/ux-SamThuongShop-2026-07-18/EXPERIENCE.md
---

# SamThuongShop - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for SamThuongShop, decomposing the requirements from the PRD, the UX Design contract (DESIGN.md + EXPERIENCE.md), and the Architecture spine into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: A Customer can browse Products, grouped/filtered by Collection.
FR-2: A Customer can view a Product detail page — Variants (print sizes / digital tiers), VND price, images, description, watermarked digital preview, made-to-order availability.
FR-3: A Customer can find a Product by name or Collection (basic search).
FR-4: A Customer can add/update/remove Variants in the Cart; a Digital Download line is fixed at quantity 1.
FR-5: A Customer can check out as a guest or while signed in to an Account.
FR-6: The system requires a shipping address only when the Cart contains a Physical Print (digital-only carts skip shipping).
FR-7: A Customer sees an itemized total (items + shipping if any) in VND before paying.
FR-8: A Customer can pay for an Order using a supported Payment Method (v1: VietQR via payOS, or COD).
FR-9: For VietQR, the Customer scans a QR; the Order is confirmed Paid automatically on the payOS webhook.
FR-10: A Customer receives an Order confirmation (on-screen + email) and can see Order Status.
FR-11: The Operator can advance an Order's status and record shipment for Physical Prints.
FR-12: The Operator can cancel an Order that is unpaid or cannot be fulfilled.
FR-13: On a Digital Download Order reaching Paid, the Customer receives a secure Download Link (on-screen + email).
FR-14: A Customer can re-download a purchased file (via Account, or a fresh time-limited link via Order reference + email).
FR-15: The personal-use License is presented at/before purchase of a Digital Download.
FR-16: A visitor can browse the Portfolio Galleries; an image may link to a related Product.
FR-17: A visitor can read Sam Thuong's profile/About.
FR-18: A visitor can reach Sam Thuong / the shop (contact).
FR-19: The Operator can create/edit/publish/unpublish/delete Products and Variants (name+description in vi+en), prices, images, and upload the digital file + preview.
FR-20: The Operator can organize Products into Collections and configure store settings (flat shipping fee).
FR-21: The Operator can view and act on Orders (confirm payment, advance status, record shipment, cancel).
FR-22: The Operator can edit Portfolio Galleries and About content (vi+en).
FR-23: The Operator signs in to a protected admin area (single privileged role).
FR-24: A Customer can create and sign in to an optional Account (order history + digital re-download).
FR-25: A Customer can switch the UI language (Vietnamese ⇄ English) via a site-wide toggle; Vietnamese is the fallback.

### NonFunctional Requirements

NFR-1: Responsive web, mobile-first (buyers arrive from phones and social links); no native app; light mode only.
NFR-2: Image performance — optimized/responsive image serving with reserved aspect ratios and lazy-loading.
NFR-3: Payment security — card/payment credentials handled by the provider, never stored by SamThuongShop.
NFR-4: Digital-file protection — un-watermarked originals stored privately; served only via short-lived presigned URLs (counter-metric SM-C2).
NFR-5: Basic SEO & shareability — Product/Portfolio pages indexable with good OpenGraph link previews, per active locale.
NFR-6: Reliable digital delivery — payment-confirmed downloads delivered automatically without operator intervention.
NFR-7: Simplicity/maintainability — the whole system operable by one non-technical operator.
NFR-8: Privacy — collect minimal customer PII (contact + shipping for prints); store securely; not exposed beyond the Operator.
NFR-9: Bilingual UI (VN/EN) throughout; reliable transactional email deliverability (confirmations + download links).
NFR-10: Accessibility floor — WCAG 2.1 AA (all deep/text tokens pass AA), keyboard nav + visible focus, overlay focus management, skip-link/landmarks, alt text, required-field markers, reduced-motion, lang switching.

### Additional Requirements

*(from the Architecture spine — govern implementation; AD refs cite the spine)*

- AR-1: Scaffold a **Next.js 16 App Router** full-stack monolith (create-next-app; no external commerce starter). One codebase for storefront + portfolio + admin. — Epic 1, Story 1.
- AR-2: Provision the stack seed: **Postgres (Neon, Singapore `sin1`) + Prisma 7**, **next-intl**, **Auth.js v5 (beta)**, **Cloudflare R2**, **Resend**, **Tailwind CSS 4**; deploy target **Vercel `sin1`** (Pro plan for region pin). Dev mocks the PaymentProvider (payOS has no public sandbox).
- AR-3: Enforce the **layered paradigm** (AD-1, AD-2): presentation never touches the DB; only `lib/server/*` imports Prisma; mutations via Server Actions, webhooks/downloads/auth via Route Handlers; RSC by default.
- AR-4: **Order money model** (AD-5, AD-10, AD-11): integer VND everywhere; Order persists decomposed subtotal/shipping/discount/grandTotal; grandTotal is the sole amount to the PaymentProvider; shipping is an Order field (not a line); OrderLine snapshots unit price + format + locale name at creation.
- AR-5: **Order status machine** (AD-3): Pending Payment → Paid → Processing → Shipped → Completed (+ Cancelled); COD enters at Processing; transitions only in the order service.
- AR-6: **Payment integration** (AD-4, AD-13): payOS behind a `PaymentProvider` interface; Paid set only by a signature-verified webhook (idempotent, atomic compare-and-set; unique payOS ref; once-per-(order,purpose) dispatch).
- AR-7: **Digital delivery** (AD-6, AD-12, AD-14, AD-15): two-tier R2 storage with non-derivable keys; watermark derivative generated at upload; DownloadGrant entitlement issued at Paid; presigned URLs minted per-request under an expiry/count policy; guest redemption needs order-ref + purchaser email + rate limiting.
- AR-8: **i18n** (AD-7): per-locale (vi/en) content fields on Product/Portfolio/About; VN fallback; locale-prefixed routes; per-locale OG metadata; next-intl for UI strings.
- AR-9: **Auth** (AD-9): Auth.js v5, single Operator role gating all `app/admin/*` + operator actions; optional Customer accounts. Operator bootstrapped via a Prisma seed script (no self-serve operator signup).
- AR-10: **Email module** (Resend): one service sends all transactional mail (order confirmation, download link), bilingual per the order's locale.
- AR-11: **Variant format** (AD-8): each Variant is Physical Print (size) or Digital Download (tier); shipping iff any physical line; COD disabled iff any digital line; digital qty=1; prints made-to-order (no stock).

### UX Design Requirements

*(from DESIGN.md + EXPERIENCE.md — first-class, story-generating)*

- UX-DR1: Implement the **Sky & Sedge design-token system** as the Tailwind theme — 15 color tokens (soft/deep accent split, status colors), 7-role type ramp (Lora headings + Inter body, Vietnamese subset), spacing/rounded/shadow scales.
- UX-DR2: Build the **12 specced components** with their states: top-nav, language-toggle, button-primary, button-secondary, product-card, variant-selector, watermark-badge, cart-line, status-pill (ink label + colored dot), gallery-item, text-input, footer.
- UX-DR3: Implement the **10 state patterns**: empty cart, loading (image-heavy skeletons), made-to-order availability (never "out of stock"), payment-pending (VietQR/COD), payment-failed/abandoned, digital-delivery success, download-link-expired → re-download, form validation errors, guest order-lookup, search-no-results & unpublished-product.
- UX-DR4: Meet the **accessibility floor**: contrasting focus rings (ink on sky-deep buttons), overlay focus-trap + restore (lightbox, cart drawer, mobile menu), skip-link + landmarks + single-h1 heading order, "{Species} — {location}" alt-text convention, non-color required-field markers, ≥44px targets, `prefers-reduced-motion`, `lang` attribute switching.
- UX-DR5: Implement **bilingual UX**: EN|VN toggle acting in place (no nav-away), session persistence, `lang` attribute, per-locale content + VN fallback, locale-prefixed URLs, per-locale OpenGraph.
- UX-DR6: Implement **responsive behavior**: mobile-first layouts, nav collapse to menu on `<md`, grid reflow, image loading strategy (reserved aspect ratios, lazy-load below the fold).
- UX-DR7: Realize the **three key flows** end-to-end: Lan buys a physical print (VietQR), Minh buys + downloads a digital image, visitor evaluates the portfolio → product.
- UX-DR8: **Media handling**: next/image for public display/gallery images; watermarked-preview generation pipeline; portfolio gallery grid + accessible lightbox.

### FR Coverage Map

FR-1: Epic 2 — browse catalog by Collection
FR-2: Epic 2 — product detail (variants, VND, preview, availability)
FR-3: Epic 2 — basic search
FR-4: Epic 3 — cart (digital qty=1)
FR-5: Epic 3 — guest/account checkout
FR-6: Epic 3 — conditional shipping (physical only)
FR-7: Epic 3 — order summary & totals (VND)
FR-8: Epic 3 — pay (VietQR / COD)
FR-9: Epic 3 — VietQR webhook confirmation
FR-10: Epic 3 — order created + email confirmation + status
FR-11: Epic 4 — operator advances status / records shipment
FR-12: Epic 4 — operator cancels order
FR-13: Epic 3 — digital download delivered on Paid
FR-14: Epic 3 — re-download (account / fresh link)
FR-15: Epic 2 — license terms shown
FR-16: Epic 1 — portfolio galleries
FR-17: Epic 1 — profile / About
FR-18: Epic 1 — contact
FR-19: Epic 2 — manage products & variants (bilingual)
FR-20: Epic 2 — manage collections & store settings (shipping fee)
FR-21: Epic 4 — operator manages orders
FR-22: Epic 1 — manage portfolio content
FR-23: Epic 1 — operator authentication
FR-24: Epic 1 — optional customer accounts
FR-25: Epic 1 — bilingual language toggle

**All 25 FRs mapped, none orphaned.** (Revised after party-mode validation: FR-24 moved to Epic 1 to resolve the account-checkout dependency inversion; FR-13/FR-14 placed in Epic 3 so the buy→receive→re-download loop is one standalone epic.)

### Open Questions & Risks

*Surfaced by the party-mode validation round; resolve before the cited stories.*

**Open questions (owner decision needed):**
- OQ-1 — **Contact form (FR-18) target:** email-to-operator via Resend, an admin inbox, or listed Zalo/email links? *(Epic 1)*
- OQ-2 — **Download-link policy:** expiry window + re-download count (PRD Open Q5). *(Epic 3)*
- OQ-3 — **Print sizes & digital tiers:** concrete Variant options (PRD Open Q4). *(Epic 2)*

**Risks / prerequisites:**
- R-1 — **payOS household-business registration** is an external launch prerequisite; no payment works until it clears. Track as a visible prerequisite to Epic 3. *(external)*
- R-2 — **Watermark generation (AR-7)** is a spike (image pipeline + library/font/positioning), not a checkbox — size as real work. *(Epic 2)*
- R-3 — **No payOS sandbox** → the real webhook first fires in production; plan a live-money smoke test before launch. *(Epic 3)*

## Epic List

### Epic 1: Foundation, Portfolio, Accounts & Operator Access
The bilingual (VN/EN) SamThuongShop site is live, responsive, and styled in the Sky & Sedge system; visitors browse the portfolio galleries, read About, and use contact; customers can create and sign in to optional accounts; and the Operator signs into a single admin shell to manage portfolio & About content. Establishes the foundation every later epic builds on — the Next.js scaffold, design tokens, i18n, the layered structure, one Auth.js system (operator + customer), and the guarded admin shell (built **once** here; later epics drop screens into it).
**FRs covered:** FR-16, FR-17, FR-18, FR-22, FR-23, FR-24, FR-25
**Build notes:** AR-1/AR-2/AR-3 (scaffold, stack, layered paradigm), AR-8 (i18n), AR-9 (Auth.js — operator role + customer accounts, operator seeded), UX-DR1 (tokens), UX-DR2/UX-DR8 (nav, language-toggle, footer, gallery + lightbox), UX-DR5/UX-DR6 (bilingual, responsive), UX-DR4 (a11y floor). Split Story 1 (do not bundle scaffold + tokens + shell + auth into one story).

### Epic 2: Product Catalog (manage + browse)
The Operator creates and edits Products, Variants, and Collections from the admin shell — bilingual name/description, VND prices, images, the digital file + a watermarked preview — and customers browse the catalog, search, and open a Product detail showing variants (print sizes / digital tiers), VND price, watermarked preview, made-to-order availability, and the license.
**FRs covered:** FR-1, FR-2, FR-3, FR-15, FR-19, FR-20
**Build notes:** AR-11 (variant format), AR-7 (watermark pipeline — see R-2 spike), UX-DR2 (product-card, variant-selector, watermark-badge), UX-DR3 (made-to-order, search-no-results, unpublished-product states). Depends on Epic 1 (foundation + admin shell + auth). Needs OQ-3 (sizes/tiers).

### Epic 3: Cart, Checkout, Payment & Digital Delivery
A customer adds items to a cart, checks out as a guest or signed-in account, pays via **VietQR or COD**, receives an order + email confirmation, and — for digital items — immediately receives a secure download link and can re-download it later. The complete buy → receive loop in one standalone epic.
**FRs covered:** FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-13, FR-14
**Build notes:** AR-4 (money model), AR-5 (order status machine), AR-6 (payOS webhook integration — see R-1 registration, R-3 no sandbox), AR-7 (delivery/grant), AR-10 (confirmation + download-link email), UX-DR2/UX-DR3 (cart-line, empty-cart, payment-pending/failed, digital-success, expired→re-download, guest lookup), UX-DR7 (Lan + Minh flows). Depends on Epic 2 (products) + Epic 1 (accounts). Needs OQ-2 (download policy).

### Epic 4: Operator Order Fulfillment
The Operator views orders, advances status, records shipment for prints, confirms manual payments, and cancels orders — all from the admin shell.
**FRs covered:** FR-11, FR-12, FR-21
**Build notes:** AR-5 (status machine), UX-DR2 (status-pill), UX-DR3 (order states). Depends on Epic 3 (orders exist). Standalone: operator order management.

## Epic 1: Foundation, Portfolio, Accounts & Operator Access

Establish the running, bilingual, styled site; the one auth system; the admin shell; and the visitor-facing portfolio, About, and contact.

### Story 1.1: Scaffold and deploy the application

As the developer (building for the Operator),
I want a running, deployable Next.js 16 app wired to the database and hosting,
So that every later story ships onto a live foundation.

**Acceptance Criteria:**

**Given** an empty repository
**When** the app is scaffolded (Next.js 16 App Router, TypeScript, Tailwind 4) and connected to Neon Postgres via Prisma 7
**Then** it builds and runs locally, and a placeholder page renders at a public URL on Vercel (`sin1` region)
**And** the layered structure exists (`app/`, `lib/server/`, `components/`) with lint/typecheck passing
**And** no domain tables are created yet (only the Prisma connection + a health check).

### Story 1.2: Sky & Sedge design-token system

As the Operator,
I want the site's visual identity implemented as reusable tokens,
So that every screen looks consistent and on-brand.

**Acceptance Criteria:**

**Given** the DESIGN.md spec
**When** the Tailwind theme is configured
**Then** the 15 color tokens, the 7-role type ramp (Lora headings + Inter body, Vietnamese subset loaded), and the spacing/rounded/shadow scales are available as theme tokens
**And** a styleguide page renders each token, with all deep/text tokens passing WCAG AA contrast
**And** Vietnamese diacritics render correctly in both fonts.

### Story 1.3: Bilingual shell and language toggle

As a visitor,
I want to use the site in Vietnamese or English and switch between them,
So that I can read it in my language. *(FR-25)*

**Acceptance Criteria:**

**Given** next-intl configured with locale-prefixed routes (`/vi`, `/en`, `vi` default)
**When** I load any page
**Then** the top nav (Home · Shop · Portfolio · About · Contact + cart + EN|VN toggle) and footer render in the active locale
**And** toggling EN|VN switches the UI in place on the current page (no redirect to Home) and persists for the session, setting `lang="vi"`/`lang="en"`
**And** a missing translation falls back to Vietnamese
**And** the layout survives longer Vietnamese strings without breaking.

### Story 1.4: Customer accounts

As a customer,
I want to create and sign in to an optional account,
So that I can see my orders and re-download purchases later. *(FR-24)*

**Acceptance Criteria:**

**Given** Auth.js v5 configured with email/password on Postgres
**When** I register with email + password
**Then** an account is created and I can sign in and sign out
**And** a signed-in customer has a session usable by later checkout/account features
**And** required fields show non-color "Required/Bắt buộc" markers and inline validation errors (not color-only).

### Story 1.5: Operator authentication and admin shell

As the Operator,
I want a single protected admin area,
So that only I can manage the shop, and later epics have one place to add screens. *(FR-23)*

**Acceptance Criteria:**

**Given** the Auth.js system from Story 1.4 and a seeded Operator account (no self-serve operator signup)
**When** an unauthenticated user visits any `/admin/*` route
**Then** they are denied and redirected to operator sign-in
**And** a signed-in Operator sees the guarded admin shell (layout + nav) into which later epics mount screens
**And** the Operator role is checked in a shared server guard.

### Story 1.6: Portfolio galleries (manage + view)

As a visitor,
I want to browse Sam Thuong's portfolio galleries,
So that I can experience his work. *(FR-16, FR-22)*

**Acceptance Criteria:**

**Given** the Operator manages Galleries and their images from the admin shell
**When** a visitor opens the Portfolio
**Then** a responsive gallery grid renders the images with "{Species} — {location}" captions and alt text
**And** clicking an image opens an accessible lightbox (focus trapped + restored, `Esc` closes, reduced-motion honored) that may link to a related Product
**And** images load via next/image with reserved aspect ratios (no layout shift).

### Story 1.7: About / profile (manage + view)

As a visitor,
I want to read Sam Thuong's profile,
So that I can judge his professional standing. *(FR-17, FR-22)*

**Acceptance Criteria:**

**Given** the Operator edits bilingual (vi/en) About content from the admin shell
**When** a visitor opens About in either locale
**Then** the profile/bio renders in that locale (Vietnamese fallback if untranslated)
**And** per-locale page metadata / OpenGraph is emitted.

### Story 1.8: Contact

As a visitor,
I want to reach Sam Thuong / the shop,
So that I can ask about his work. *(FR-18)*

**Acceptance Criteria:**

**Given** the contact surface *(mechanism per OQ-1 — email via Resend, admin inbox, or listed channels)*
**When** a visitor uses Contact
**Then** they can reach the shop through the chosen mechanism
**And** any form uses labelled fields with non-color required markers and inline validation.

## Epic 2: Product Catalog (manage + browse)

The Operator populates the catalog; customers browse, search, and view product detail.

### Story 2.1: Manage products and variants

As the Operator,
I want to create and edit Products with their Variants,
So that I have items to sell. *(FR-19)*

**Acceptance Criteria:**

**Given** the admin shell (Epic 1)
**When** I create a Product
**Then** I can enter name + description in both Vietnamese and English, set VND (integer) prices, upload display images, and add Variants that are each a Physical Print (size) or a Digital Download (tier)
**And** for a Digital Download Variant I upload the original file to private storage (non-derivable key)
**And** I can publish/unpublish a Product (unpublished is preserved in admin, hidden from storefront)
**And** the Product/Variant/ProductImage tables are created by this story.

### Story 2.2: Watermarked preview generation

As the Operator,
I want a watermarked preview generated when I upload a digital file,
So that customers can preview without the original leaking. *(AR-7, NFR-4, R-2)*

**Acceptance Criteria:**

**Given** a Digital Download original is uploaded (Story 2.1)
**When** the upload completes
**Then** a watermarked preview derivative is generated and stored as a public/preview asset, separate from the private original
**And** the original is never served before purchase
**And** the preview is what the storefront displays.

### Story 2.3: Collections and store settings

As the Operator,
I want to group Products into Collections and set the shipping fee,
So that the catalog is organized and checkout can total correctly. *(FR-20)*

**Acceptance Criteria:**

**Given** existing Products
**When** I create a Collection and assign Products
**Then** the Collection and its membership persist (Collection table created here)
**And** I can set a single flat shipping fee (integer VND) used later by checkout
**And** a Product's storefront availability is driven only by published state (no stock).

### Story 2.4: Browse catalog by Collection

As a customer,
I want to browse Products grouped by Collection,
So that I can find work I like. *(FR-1)*

**Acceptance Criteria:**

**Given** published Products and Collections
**When** I open Shop
**Then** product cards render (photo, species title, Print/Digital availability, from-price in VND, sage "Digital" tag where applicable) in the airy editorial grid
**And** I can filter to a Collection and see only its Products
**And** only published Products appear; the grid is mobile-usable without horizontal scroll.

### Story 2.5: View product detail

As a customer,
I want to see a Product's full detail,
So that I can choose a variant and decide to buy. *(FR-2, FR-15)*

**Acceptance Criteria:**

**Given** a published Product with Variants
**When** I open its detail page
**Then** I see the variant selector (print sizes / digital tiers), the price updating in VND per selected Variant, images, description, and — for digital — the watermarked preview
**And** a Physical Print shows a "Made to order" note (never "out of stock", no stock count)
**And** the personal-use License terms are shown for a Digital Download
**And** content renders in the active locale with Vietnamese fallback.

### Story 2.6: Search and not-found states

As a customer,
I want to search for a bird and get graceful results,
So that I'm never stuck on a blank or broken page. *(FR-3)*

**Acceptance Criteria:**

**Given** the catalog
**When** I search by Product name or Collection
**Then** matching published Products are returned
**And** an empty result shows "No birds match that search / Không tìm thấy…" with a one-tap clear back to the full catalog
**And** a stale/unpublished Product link shows a calm "This piece isn't available right now / Tác phẩm này hiện không có sẵn" with links to Shop and Portfolio (not a raw 404).

## Epic 3: Cart, Checkout, Payment & Digital Delivery

The complete buy → pay → receive → re-download loop.

### Story 3.1: Manage the cart

As a customer,
I want to add, adjust, and remove items in a cart,
So that I can assemble an order. *(FR-4)*

**Acceptance Criteria:**

**Given** products in the catalog
**When** I add a Variant to the Cart
**Then** the cart shows each line (thumbnail, name, Variant, unit price, line total) and a running total in VND
**And** a Digital Download line is fixed at quantity 1 (stepper disabled with a bilingual note); print lines allow quantity changes
**And** removing the last line shows the empty-cart state ("Your cart is empty / Giỏ hàng… trống") linking back to Shop.

### Story 3.2: Checkout details and order summary

As a customer,
I want to enter my details and see what I'll pay,
So that I can confirm before paying. *(FR-5, FR-6, FR-7)*

**Acceptance Criteria:**

**Given** a non-empty cart
**When** I check out as a guest or signed-in customer
**Then** a shipping address is required only if the cart contains a Physical Print; a digital-only cart skips shipping entirely
**And** the summary shows item subtotal + shipping fee (0 for digital-only) + grand total, all integer VND, recomputed server-side (a client-sent total is never trusted)
**And** on submit an Order with decomposed money fields and per-line snapshots (unit price, format, locale name) is created (Order/OrderLine tables created here).

### Story 3.3: Pay by VietQR (payOS)

As a customer,
I want to pay by scanning a VietQR code,
So that I can complete my purchase the way I normally pay. *(FR-8, FR-9)*

**Acceptance Criteria:**

**Given** an Order at *Pending Payment* and payOS behind a `PaymentProvider` interface *(prereq R-1: payOS registration; R-3: no sandbox → provider mocked in dev)*
**When** I choose VietQR and pay
**Then** the grand total (integer VND) is sent to payOS and a QR + Order reference are shown
**And** the Order becomes *Paid* **only** on a signature-verified payOS webhook — never a client redirect
**And** a duplicate/replayed webhook is idempotent (unique payOS reference, upsert-no-op, monotonic compare-and-set)
**And** a failed/abandoned payment leaves the Order *Pending Payment*, not fulfilled, with a resume-payment path and no duplicate Order.

### Story 3.4: Pay by Cash on Delivery

As a customer buying a print,
I want to pay cash on delivery,
So that I don't need to pay online. *(FR-8)*

**Acceptance Criteria:**

**Given** a cart containing a Physical Print and no Digital Download
**When** I select COD
**Then** the Order is placed at *Processing* and COD is offered
**And** COD is disabled/hidden for any cart containing a Digital Download, with a bilingual reason
**And** the Operator later marks it *Paid* on cash receipt (Epic 4).

### Story 3.5: Order confirmation, email, and status

As a customer,
I want confirmation and a way to check my order,
So that I know it went through. *(FR-10)*

**Acceptance Criteria:**

**Given** a submitted Order
**When** it is created
**Then** I see an on-screen confirmation with a unique Order reference, and an order-confirmation email is sent via Resend in the order's locale
**And** a signed-in customer sees the Order in account history; a guest can look it up via Order reference **plus** purchaser email (rate-limited)
**And** the order status pill shows the correct state with an ink label + colored dot (not color alone).

### Story 3.6: Digital delivery on payment

As a customer who bought a digital image,
I want to receive my download as soon as I've paid,
So that I get what I paid for immediately. *(FR-13)*

**Acceptance Criteria:**

**Given** an Order containing a Digital Download reaches *Paid*
**When** payment is confirmed
**Then** a DownloadGrant is issued for each digital line and a secure, short-lived presigned URL is delivered on-screen and by email
**And** the link serves the un-watermarked original from private storage via an entitlement-checked route handler; the file is inaccessible without a valid link
**And** a digital-only Order moves to *Completed* once grants issue
**And** grant/email dispatch is once-per-(order, purpose).

### Story 3.7: Re-download

As a customer,
I want to get my file again if the link expires,
So that I don't lose my purchase. *(FR-14)*

**Acceptance Criteria:**

**Given** a purchased Digital Download *(policy per OQ-2: expiry window + count)*
**When** the original link has expired
**Then** a signed-in customer re-downloads from account order history, and a guest requests a fresh link via Order reference + purchaser email
**And** an expired link shows a neutral "This link has expired / Liên kết đã hết hạn" with a re-issue action (not an error)
**And** a cancelled Order's grants are invalidated and cannot be re-issued.

## Epic 4: Operator Order Fulfillment

The Operator runs orders through fulfillment from the admin shell.

### Story 4.1: View orders

As the Operator,
I want to see all orders and their details,
So that I can act on them. *(FR-21)*

**Acceptance Criteria:**

**Given** orders exist (Epic 3)
**When** I open Orders in the admin shell
**Then** I see a list with status pill, reference, items, customer, and (for prints) shipping address
**And** I can open an Order to see its lines (snapshot prices/names), payment, and any DownloadGrants.

### Story 4.2: Advance status and record fulfillment

As the Operator,
I want to progress an order and record shipment,
So that customers know their print is on the way. *(FR-11)*

**Acceptance Criteria:**

**Given** a *Paid* or *Processing* Order with a Physical Print
**When** I advance it
**Then** I can move it *Paid → Processing → Shipped → Completed* and record a shipment (optional tracking note), reflected in the customer's status view
**And** I can confirm manual payment (bank transfer / COD cash receipt) to mark an Order *Paid*
**And** transitions are guarded (atomic compare-and-set on expected status; a late webhook cannot regress state).

### Story 4.3: Cancel orders

As the Operator,
I want to cancel orders that can't be fulfilled,
So that the order list reflects reality. *(FR-12)*

**Acceptance Criteria:**

**Given** an unpaid or unfulfillable Order
**When** I cancel it
**Then** it moves to *Cancelled* and is not fulfilled
**And** any digital DownloadGrants on it are invalidated
**And** a Cancel racing a *Paid* webhook resolves safely (Paid wins → routes to a refund path rather than a lost update).
