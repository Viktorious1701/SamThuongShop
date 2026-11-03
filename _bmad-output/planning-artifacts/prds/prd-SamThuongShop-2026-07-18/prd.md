---
title: SamThuongShop
status: final
created: 2026-07-18
updated: 2026-10-29
revision: portfolio-first pivot (sprint-change-proposal-2026-10-29)
---

# PRD: SamThuongShop
*Working title — confirm.*

## 0. Document Purpose

This PRD defines **SamThuongShop**, a portfolio and achievements showcase for **Sam Thuong**, a professional birder, with an optional print shop, operated by a single manager (Thinh An). It is written for the downstream UX and architecture workflows and for the operator as the product owner. It is organized as: a Glossary that fixes vocabulary, Features grouped with globally-numbered Functional Requirements (FR-N) nested under each, cross-cutting non-functional requirements in their own section, and every inferred decision tagged inline as `[ASSUMPTION: ...]` and collected in the Assumptions Index (§9). It captures *capabilities*, not implementation — the tech stack, hosting, and specific providers are decided in the architecture phase, not here. Scope is deliberately lean: a portfolio-first site with a small, secondary shop, kept simple because one person runs it.

## 1. Vision

SamThuongShop is the online home of **Sam Thuong's bird photography**. It is a calm, image-forward **portfolio** that presents him as a serious, professional birder through curated **Galleries**, a record of his **Achievements** (awards and competitions, exhibitions, publications and press, honours and memberships) and a short profile. Visitors, whether fellow bird lovers, potential collaborators, editors or organisers, should arrive, be pulled straight into the pictures, and leave understanding the quality and standing of his work.

Selling is **secondary**. An optional **Shop** lets visitors who fall for an image buy it as a **Physical Print** (wall / wood-print décor, the primary product), with **Digital Downloads** as a minor add-on. The shop is one quiet path out of the portfolio, never the headline.

It exists because Sam Thuong's photography has no dedicated home that does justice to it. A social feed scatters the work and a marketplace listing strips away the story. SamThuongShop gathers the best images and the recognition they've earned in one place, bilingual for Vietnamese and English audiences, simple enough that one operator can keep it current.

Success looks like: visitors land on the galleries, explore them, see the achievements, and reach out. A small, reliable print shop is there for those who want to take a picture home.

*(Revised 2026-10-29: portfolio-first pivot; see `sprint-change-proposal-2026-10-29.md`.)*

## 2. Target User

### 2.1 Jobs To Be Done

- **See who Sam Thuong is and judge the quality of his work**: a visitor (potential buyer, collaborator, or follower) wants to browse his portfolio and understand his professional standing.
- **Verify his professional standing**: an editor, organiser, collaborator or fan wants to see the awards he has won, where he has exhibited, where his work has been published, and the honours he holds.
- **Get in touch**: a visitor wants to reach Sam Thuong about his work, a collaboration, licensing or a print.
- *(secondary)* **Buy a piece of Sam Thuong's bird art**: a fan or bird enthusiast wants a specific bird image, as a print for their wall or as a digital file, and wants to pay the way they normally pay in Vietnam.
- *(secondary)* **Get the image delivered (physical) or now (digital)**: the buyer wants reliable domestic shipping for a print, or instant access to a downloadable file, and wants to know their order's status.
- **Run the site single-handedly**: the operator (Thinh An) wants to keep galleries, achievements and About current, and, when the shop is used, manage products and orders quickly, alone, without technical overhead.

### 2.2 Non-Users (v1)

- **Other sellers / photographers** — this is a single-artist store, not a marketplace. `[ASSUMPTION: SamThuongShop is exclusively Sam Thuong's work in v1.]`
- **International buyers needing cross-border shipping or non-VND payment** — v1 targets the domestic Vietnam market only.
- **Wholesale / commercial-license buyers** — v1 sells to individual buyers for personal use, not bulk or commercial licensing.

### 2.3 Key User Journeys

- **UJ-1. A visitor discovers Sam Thuong's work.** *(primary)*
  - **Persona + context:** Hà, a nature-magazine editor, gets a shared link to the site.
  - **Entry state:** unauthenticated, on her phone, arriving at Home.
  - **Path:** Home opens on a full-bleed photograph and a featured selection from the Galleries. She opens the **Portfolio**, browses a Gallery and steps through images in the lightbox. She checks **Achievements** (awards, exhibitions, publications, honours) and reads **About**.
  - **Climax:** within a minute she has seen enough of the work and its recognition to judge him a serious professional.
  - **Resolution:** she uses **Contact** to ask about licensing an image for an article. **Branch:** a different visitor sees "View this print" on a gallery image and continues into UJ-2.

- **UJ-2. Lan buys a framed-worthy print of a kingfisher.** *(secondary: Shop)*
  - **Persona + context:** Lan, an amateur birdwatcher in Hanoi, follows Sam Thuong and wants one of his kingfisher shots on her wall.
  - **Entry state:** unauthenticated, on her phone, arriving from a gallery image's "View this print" link (or a social link to a product page).
  - **Path:** she views the product, chooses the **Physical Print** option and a size, adds it to the **Cart**, checks out as a guest, enters her shipping address, and pays by **COD** (or by scanning a **VietQR** code once online payment is enabled). `[ASSUMPTION: COD at launch; VietQR (via payOS) in the post-launch shop phase.]`
  - **Climax:** she sees an order confirmation with an order number and an estimated handling/shipping note; the value landed when she got a clear "we've got your order" screen and a confirmation message.
  - **Resolution:** she waits for delivery; the operator sees the order and ships it. **Edge case:** if her VietQR payment fails or she abandons it, the Order stays *Pending Payment* and is not fulfilled; she can return and pay again.

- **UJ-3. Minh buys and downloads a digital image for his desktop.** *(secondary: enabled once digital delivery ships)*
  - **Persona + context:** Minh wants a high-resolution digital file of a specific heron photo, for personal use.
  - **Entry state:** unauthenticated, on desktop, browsing a Collection.
  - **Path:** he opens the product, chooses the **Digital Download** option (seeing a watermarked preview), adds it to the cart, and checks out. `[ASSUMPTION: previews are watermarked; purchased downloads are not.]` He pays by scanning the **VietQR** code.
  - **Climax:** after payment is confirmed, he receives a secure download link and gets the file; value landed the moment the download starts.
  - **Resolution:** he can re-download the file (for a limited window, or from an account if he made one). **Edge case:** if the download link expires, he can request a fresh link or re-download from his account. `[ASSUMPTION: re-download is available via account and/or a time-limited link.]`


## 3. Glossary

*Downstream workflows and readers must use these terms exactly. FRs, UJs, and SMs use these terms verbatim; synonyms anywhere in the PRD are a discipline violation.*

- **Product** — an item for sale in the store, representing one of Sam Thuong's bird images. A Product may be offered as a Physical Print, a Digital Download, or both, via its Variants.
- **Variant** — a specific purchasable form of a Product: a Physical Print in a given size, or a Digital Download at a given resolution/tier. Each Variant has its own price.
- **Physical Print** — a printed photograph shipped to the Customer. Made to order (no stock limit); requires a shipping address.
- **Digital Download** — a digital image file delivered electronically after payment. No shipping; delivered via a Download Link; governed by a License.
- **Collection** — a curated grouping of Products (e.g. by species, habitat, or theme) used to organize the catalog.
- **Cart** — the set of Variants a Customer has selected but not yet purchased.
- **Order** — a confirmed purchase of one or more Variants by a Customer, with an Order Status and, if it contains any Physical Print, a shipping address.
- **Order Status** — the state of an Order in fulfillment (e.g. *Pending Payment*, *Paid*, *Processing*, *Shipped*, *Completed*, *Cancelled*). `[ASSUMPTION: this status set; refine in UX.]`
- **Customer** — a buyer. May check out as a guest or as a registered Account.
- **Account** — an optional registered Customer profile that stores order history and enables Digital Download re-download.
- **Operator** — the single administrator (Thinh An) who manages Portfolio content (Galleries, Achievements, About) and, for the Shop, Products and Orders. The only privileged role.
- **Portfolio** — the primary, non-commercial showcase area of the site: Sam Thuong's Galleries, Achievements and profile. It is the default destination for every visitor.
- **Gallery** — a set of images within the Portfolio, presented for viewing (not necessarily for sale). A Gallery may sit under one parent Gallery for grouping (e.g. *Chim Việt Nam* → *Tràm Chim*).
- **Achievement** — a recorded recognition of Sam Thuong's work, of one of four kinds: **Award** (a prize or placing in a competition), **Exhibition** (a show where the work was displayed), **Publication** (a magazine, book, article or press feature), or **Honour** (a membership, distinction or title, e.g. an association membership, a FIAP distinction, a brand ambassadorship). Has bilingual title/description, a year/date, an organiser/venue/outlet, an optional link and an optional image.
- **Featured** — an Operator-set flag on a Gallery image or Achievement that surfaces it on Home.
- **Download Link** — a secured, time-limited URL that delivers a purchased Digital Download file.
- **License** — the usage terms granted with a Digital Download (personal, non-commercial use in v1).
- **Payment Method** — a way the Customer pays: **VietQR** bank transfer (via the payOS gateway) or **Cash on Delivery (COD)**. Momo/ZaloPay wallets are deferred post-launch (they require business registration). `[ASSUMPTION: VietQR + COD for v1.]`

## 4. Features

*Each subsection is a coherent feature: behavioral description first, FRs nested. FRs are numbered globally so downstream artifacts have stable references (they are not renumbered when sections move). Glossary terms are used exactly. §4.1 (Portfolio) is primary; §4.2–§4.6 describe the secondary Shop.*

### 4.1 Portfolio, Achievements & About

**Description:** **The heart of the site.** It presents Sam Thuong as a professional birder through a portfolio-led Home, curated Galleries, a record of Achievements, a short profile/bio and a way to contact him. Every visitor lands here first. Portfolio images are for viewing; some may link to a purchasable Product, which is the only bridge into the Shop. Realizes UJ-1.

**Functional Requirements:**

#### FR-16: Browse portfolio galleries

A visitor can browse the Portfolio Galleries. Realizes UJ-1.

**Consequences (testable):**
- Galleries display Sam Thuong's images at good quality on desktop and mobile.
- A Gallery image may optionally link to a related Product.
- The Portfolio is reachable in one tap from every page and is the first item in the primary navigation.
- Captions show the species name in both Vietnamese and English, plus location.

#### FR-17: View profile / about

A visitor can read Sam Thuong's profile/bio.

**Consequences (testable):**
- The About content (bio, professional background) is viewable and Operator-editable.

#### FR-18: Contact

A visitor can reach Sam Thuong / the shop.

**Consequences (testable):**
- An enquiry form (name, email, enquiry type: print / licensing / collaboration / other, message) delivers to the Operator by email, and listed channels (email, Facebook, Zalo) are shown. *(OQ-1 resolved 2026-10-29.)*

#### FR-26: Browse achievements

A visitor can see Sam Thuong's Achievements, grouped by kind. Realizes UJ-1.

**Consequences (testable):**
- The Achievements page lists Awards & competitions, Exhibitions, Publications & press, and Honours & memberships as separate groups, each newest-first.
- Each Achievement shows its title, year/date and organiser/venue/outlet in the active language (Vietnamese fallback). Where present it also shows a description/excerpt, an external link (opens in a new tab) and an image.
- An empty group is hidden, not shown as an empty heading.

#### FR-27: Portfolio-led landing and navigation

Every visitor is led to the Portfolio first. Realizes UJ-1.

**Consequences (testable):**
- Home opens on a full-bleed photograph and a featured selection of Gallery images, followed by highlighted Achievements and a short About hook. Any Shop entry on Home is a single secondary link, never above the fold.
- Primary navigation order is **Portfolio · Achievements · About · Contact · Shop**.
- The Cart indicator appears only when the Cart is non-empty. Account sign-in is reachable from the footer and from Shop surfaces, not from the top bar.

### 4.2 Catalog & Storefront

*Secondary: the optional Shop.*

**Description:** The public store where Customers browse Products. Products are organized into Collections and are individually viewable on a product detail page that shows the available Variants (Physical Print sizes and/or Digital Download tiers), price in VND, imagery, and a short description. Digital previews are shown watermarked. The storefront is image-forward and works well on phones. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-1: Browse catalog

A Customer can browse Products, filtered or grouped by Collection.

**Consequences (testable):**
- The catalog lists all Products marked visible by the Operator; hidden/unpublished Products do not appear.
- A Customer can open a Collection and see only the Products in it.
- The catalog is usable on a mobile viewport without horizontal scrolling.

#### FR-2: View product detail

A Customer can view a Product's detail page showing its Variants, prices in VND, images, and description. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- The page shows each available Variant (print sizes and/or digital tiers) with its price in VND.
- For a Digital Download, a watermarked preview is shown; the un-watermarked file is not accessible before purchase.
- A Physical Print Variant is made to order and purchasable whenever its Product is published; an unpublished Product is not purchasable.

#### FR-3: Search / find a product *(basic)*

A Customer can find a Product by name or Collection.

**Consequences (testable):**
- Entering a Product name returns matching visible Products.
- `[ASSUMPTION: basic name/Collection search is sufficient for v1; no faceted/advanced search.]`

#### FR-25: Switch UI language

A Customer can view the storefront and Portfolio in either Vietnamese or English via a language toggle.

**Consequences (testable):**
- A language toggle is available site-wide; switching it re-renders UI labels, Product content, and Portfolio content in the chosen language.
- The chosen language persists across pages for the session.
- `[ASSUMPTION: Vietnamese and English only; language falls back to Vietnamese if a translation is missing.]`

### 4.3 Cart & Checkout

*Secondary: the optional Shop.*

**Description:** Customers add Variants to a Cart and check out. Checkout is available to guests; an Account is optional. A shipping address is required only when the Cart contains at least one Physical Print; a Cart of only Digital Downloads skips shipping entirely. Prices, subtotals, shipping, and totals are shown in VND. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-4: Manage cart

A Customer can add, update the quantity of, and remove Variants in the Cart.

**Consequences (testable):**
- The Cart shows each line item, quantity, unit price, and a running total in VND.
- Digital Download Variants are constrained to quantity 1 per Order. `[ASSUMPTION: a digital file is bought once per order.]`
- Removing all items empties the Cart.

#### FR-5: Guest and account checkout

A Customer can check out as a guest or while signed in to an Account. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- A guest can complete an Order without creating an Account.
- A Customer may optionally create an Account during or after checkout.
- A signed-in Customer's Order is associated with their Account.

#### FR-6: Conditional shipping details

The system requires a shipping address only when the Cart contains a Physical Print.

**Consequences (testable):**
- A Cart containing any Physical Print requires a valid shipping address before payment.
- A Cart of only Digital Downloads proceeds to payment with no shipping step and no shipping fee.
- A mixed Cart (print + digital) requires a shipping address and ships only the print items.

#### FR-7: Order summary and totals

A Customer sees an itemized total (items + shipping, if any) in VND before paying.

**Consequences (testable):**
- The summary shows item subtotal, the Operator-configured shipping fee (0 for digital-only Carts; see FR-20), and grand total in VND.
- The total the Customer approves equals the amount charged.

### 4.4 Payments

*Secondary: the optional Shop.*

**Description:** Checkout collects payment via local Vietnamese Payment Methods. Card data and payment credentials are handled by the payment provider, not stored by SamThuongShop. `[ASSUMPTION: v1 payment methods are VietQR (via payOS) + COD for physical orders; Momo/ZaloPay wallets deferred — architecture-confirmed.]`

**Functional Requirements:**

#### FR-8: Pay with a local payment method

A Customer can pay for an Order using a supported Payment Method.

**Consequences (testable):**
- The Customer can select among the enabled Payment Methods at checkout.
- On successful VietQR payment (confirmed by the payOS gateway webhook), the Order moves to *Paid*; on failure or abandonment it remains *Pending Payment* and is not fulfilled.
- COD is offered only for Orders that contain a Physical Print **and no Digital Download** (so digital delivery is never gated behind courier cash collection). `[ASSUMPTION: COD is physical-only and excludes mixed carts with digital items.]`
- A COD Order is placed as *Processing* and the Operator marks it *Paid* upon confirmed cash receipt.

#### FR-9: Bank-transfer confirmation

For VietQR, the Customer is shown a QR code to scan with their banking app; the Order is confirmed *Paid* automatically when the payOS webhook reports the transfer.

**Consequences (testable):**
- The Customer is shown the transfer details and a reference for their Order.
- The Order remains unfulfilled (Digital Download not delivered, Physical Print not shipped) until the Operator marks it Paid. `[ASSUMPTION: bank-transfer confirmation is manual by the Operator in v1.]`

### 4.5 Orders & Fulfillment

*Secondary: the optional Shop.*

**Description:** Every completed checkout creates an Order with an Order Status the Customer can see and the Operator can advance. Physical Prints are fulfilled manually by the Operator (packed and shipped domestically); Digital Downloads are delivered automatically on payment (see §4.5). Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-10: Create and track an order

A Customer receives an Order confirmation and can see the Order Status.

**Consequences (testable):**
- On checkout, an Order with a unique identifier is created and confirmed to the Customer on-screen and by email.
- A guest can view their Order Status via the confirmation reference; a signed-in Customer sees it in their Account order history.

#### FR-11: Operator fulfills physical orders

The Operator can advance an Order's Status and record shipment for Physical Prints.

**Consequences (testable):**
- The Operator can move an Order through its statuses (e.g. *Paid* → *Processing* → *Shipped* → *Completed*).
- The Operator can record a shipment (and optional tracking note); the Customer can see the updated status.
- Physical Prints are made to order, so there is no stock to decrement on fulfillment.

#### FR-12: Cancel / handle failed orders

The Operator can cancel an Order that is unpaid or cannot be fulfilled.

**Consequences (testable):**
- An Order can be moved to *Cancelled*; a cancelled Order is not fulfilled.
- A cancelled Digital Download Order has its Download Link invalidated.

### 4.6 Digital Delivery & Licensing

*Secondary: the optional Shop.*

**Description:** When an Order containing a Digital Download is Paid, the Customer is given a secure, time-limited Download Link to the un-watermarked file. Files are protected so they are not publicly guessable or hotlinkable. Each Digital Download is sold under a personal-use License. Realizes UJ-2.

**Functional Requirements:**

#### FR-13: Deliver digital download on payment

On a Digital Download Order reaching *Paid*, the Customer receives a Download Link to the purchased file.

**Consequences (testable):**
- The Download Link is issued only after the Order is *Paid*, and is delivered to the Customer by email.
- The link delivers the un-watermarked file; the file is not accessible without a valid link.
- The link is time-limited and/or use-limited. `[ASSUMPTION: expiry/use-count policy set in architecture.]`
- A Digital-Download-only Order moves to *Completed* once its Download Link has been issued (no shipping step remains).

#### FR-14: Re-download

A Customer can obtain the file again after the original link expires.

**Consequences (testable):**
- A signed-in Customer can re-download their purchased Digital Download from their Account order history.
- `[ASSUMPTION: guests can request a fresh Download Link via their Order reference.]`

#### FR-15: License terms shown

The personal-use License is presented at or before purchase of a Digital Download.

**Consequences (testable):**
- The License terms (personal, non-commercial use) are visible on the product detail page or at checkout for Digital Download Variants.
- `[ASSUMPTION: single personal-use License applies to all Digital Downloads in v1.]`

### 4.7 Operator Admin

**Description:** A simple, single-user administrative area where the Operator manages everything: Portfolio content (Galleries, Achievements, About) and, for the Shop, Products and Variants, prices, Collections and Orders. Designed for one non-technical person; no multi-user roles or permissions. Realizes the operator JTBD.

**Functional Requirements:**

#### FR-19: Manage products and variants

The Operator can create, edit, publish/unpublish, and delete Products, including their Variants, prices, images, and descriptions.

**Consequences (testable):**
- The Operator can add a Product with Physical Print and/or Digital Download Variants and set VND prices.
- The Operator can enter each Product's name and description in both Vietnamese and English (supports FR-25).
- Unpublishing a Product removes it from the storefront but preserves it in admin.
- The Operator can upload the sellable Digital Download file and the display/preview image per Product.

#### FR-20: Manage collections and store settings

The Operator can organize Products into Collections and configure basic store settings. (Physical Prints are made to order, so there is no stock to manage.)

**Consequences (testable):**
- The Operator can create Collections and assign Products to them.
- A Product's storefront availability is controlled by its published/unpublished state (FR-19), not by stock.
- The Operator can configure the shipping fee applied to Physical Print Orders (used by FR-7). `[ASSUMPTION: a flat shipping fee in v1; final rate model per Open Question 2.]`

#### FR-21: Manage orders

The Operator can view and act on Orders (see FR-11, FR-12).

**Consequences (testable):**
- The Operator sees a list of Orders with status, items, Customer, and (for prints) shipping address.
- The Operator can confirm bank-transfer payment, advance status, record shipment, and cancel.

#### FR-22: Manage portfolio content

The Operator can edit Galleries, Achievements, and the About/profile content.

**Consequences (testable):**
- The Operator can create, order and remove Galleries (optionally grouped under a parent Gallery), and add, reorder, caption and remove Gallery images.
- The Operator can create, edit, order and delete Achievements of each kind.
- The Operator can mark Gallery images and Achievements as **Featured** for Home.
- The Operator can provide About text, captions and Achievement text in both Vietnamese and English (supports FR-25).

#### FR-23: Operator authentication

The Operator signs in to a protected admin area.

**Consequences (testable):**
- The admin area is inaccessible without Operator authentication.
- `[ASSUMPTION: single Operator credential; no role hierarchy in v1.]`

### 4.8 Accounts & Authentication

**Description:** Accounts are optional for Customers — checkout works as a guest — but an Account gives a Customer order history and reliable Digital Download re-download. Operator authentication is covered in FR-23.

**Functional Requirements:**

#### FR-24: Optional customer accounts

A Customer can create and sign in to an Account.

**Consequences (testable):**
- A Customer can register, sign in, and sign out.
- A signed-in Customer sees their Order history and can re-download purchased Digital Downloads (FR-14).
- `[ASSUMPTION: email + password registration; social login not required in v1.]`

**Cross-cutting note:** authentication, PII handling, and payment-data boundaries are specified in §10 (Cross-Cutting NFRs) and §11 (Constraints & Guardrails).

## 5. Non-Goals (Explicit)

- **Not a marketplace** — no third-party sellers; only Sam Thuong's work. `[NON-GOAL for MVP]`
- **No print-on-demand / automated fulfillment** — the Operator packs and ships prints manually.
- **No international shipping or multi-currency** — domestic Vietnam, VND only.
- **No native mobile app** — responsive web only.
- **No subscriptions, memberships, or recurring billing.**
- **No commercial/extended licensing or wholesale** — personal-use License only.
- **Not becoming a social platform** — no user comments, feeds, or follower systems beyond a contact option.

## 6. MVP Scope

### 6.1 In Scope

**Launch (showcase):**
- Portfolio-led Home and navigation (FR-27).
- Portfolio Galleries with lightbox, Achievements, About and Contact (FR-16, FR-26, FR-17, FR-18).
- Operator admin for Galleries, Achievements and About (FR-22, FR-23).
- Bilingual Vietnamese + English (FR-25), responsive, SEO and share previews.

**Launch (secondary shop — already built, kept live):**
- Catalog, product detail, Collections (FR-1, FR-2, FR-19, FR-20); cart and guest/account checkout with conditional shipping (FR-4–FR-7).
- **COD for Physical Prints** (FR-8, COD path); Operator order view / advance / mark paid (FR-11, FR-21).
- Optional Customer accounts (FR-24).
- Interim guard: Physical Prints only, COD only, until the post-launch shop phase.

**Post-launch shop phase (deferred, still planned):**
- VietQR via payOS (FR-8 online path, FR-9), blocked on payOS registration.
- Order confirmation email (FR-10 email consequence).
- Digital Download delivery, re-download and License (FR-13–FR-15).
- Operator cancel (FR-12); basic search (FR-3).

### 6.2 Out of Scope for MVP

- Discounts, coupons, promo codes — *deferred to v2.* `[NOTE FOR PM: revisit if a launch promo is wanted.]`
- Ratings/reviews/testimonials.
- Advanced/faceted search and recommendations.
- Automated shipping-carrier integration and live tracking — manual tracking note only in v1.
- Languages beyond Vietnamese and English.
- Analytics dashboards beyond basic web analytics.
- Multiple operator accounts / role permissions.
- A Journal (field notes / essays and embedded videos): backlog, after the showcase.

## 7. Success Metrics

*Lean, stakes-appropriate. Each cross-references the FR(s) it validates. Re-weighted 2026-10-29 for the portfolio-first pivot.*

**Primary**
- **SM-1: Showcase live.** Galleries, Achievements and About are published in both languages at launch. Validates FR-16, FR-17, FR-22, FR-26.
- **SM-2: Portfolio engagement.** Most visitors who land on Home go on to open a Gallery or the lightbox, and a meaningful share view Achievements or About. Validates FR-16, FR-26, FR-27. `[ASSUMPTION: baseline set post-launch.]`
- **SM-3: Enquiries.** Visitors use Contact to reach Sam Thuong (collaborations, licensing, prints). Validates FR-18.

**Secondary (shop)**
- **SM-4: First print sale.** A Physical Print Order is placed and fulfilled via COD within the first months after launch. Validates FR-8, FR-11.
- **SM-5: Digital delivery reliability.** Applies once digital delivery ships: about 100% of Paid Digital Download Orders download without Operator intervention. Validates FR-13, FR-14.

**Counter-metrics (do not optimize)**
- **SM-C1**: **Operator effort per order** should stay low — the store must not become a full-time job for one person. Counterbalances SM-4 (don't chase volume by adding manual overhead).
- **SM-C2**: **Digital-file leakage** — un-watermarked files must not become freely accessible. Counterbalances any push to simplify delivery at the expense of FR-13's protections.
- **SM-C3**: **Shop intrusion** — shop prompts must not crowd the portfolio: no sales banners, no shop CTA above the fold on Home. Counterbalances SM-4.

## 8. Open Questions

0. **Contact mechanism (OQ-1)** — *RESOLVED 2026-10-29:* enquiry form emailed to the Operator + listed email/Facebook/Zalo (FR-18).
1. **Payment providers** — *RESOLVED in architecture:* v1 = **payOS (VietQR) + COD**. Momo/ZaloPay wallet balances need business registration + a VNPay/OnePay contract, so they are **deferred post-launch**.
2. **Shipping-rate model** — flat fee, weight-based, or per-region? Who bears cost? (Drives FR-6, FR-7.)
3. **Digital Download policy** — link expiry window and download-count limits; exact License wording. (Drives FR-13, FR-15.)
4. **Print sizes / digital tiers** — the concrete Variant options Sam Thuong wants to offer.

## 9. Assumptions Index

*Every `[ASSUMPTION]` from the document, for explicit confirmation:*

- §2.1/§2.2 — SamThuongShop sells exclusively Sam Thuong's work in v1 (single-artist, not a marketplace).
- §2.3/§4.4 — v1 Payment Methods are VietQR (via payOS) + COD (physical-only); Momo/ZaloPay wallets deferred post-launch.
- §2.3/§4.2 — Digital previews are watermarked; purchased downloads are un-watermarked.
- §2.3/§4.6 — Re-download is available via Account and/or a fresh time-limited Download Link.
- §3 — The Order Status set is *Pending Payment / Paid / Processing / Shipped / Completed / Cancelled* (refine in UX).
- §4.2 — Basic name/Collection search is sufficient for v1 (no faceted search).
- §4.2 — Language toggle covers Vietnamese and English only; missing translations fall back to Vietnamese.
- §4.7 — A flat shipping fee applies in v1 (final rate model per Open Question 2).
- §4.3 — Digital Download Variants are limited to quantity 1 per Order.
- §4.4 — COD is offered only for Orders containing a Physical Print and no Digital Download; a COD Order is placed as *Processing* and marked *Paid* on cash receipt.
- §4.4 — Bank-transfer payment is confirmed manually by the Operator in v1.
- §4.5 — Physical Prints are made to order; no stock is tracked. *(confirmed)*
- §4.6 — Download Link expiry/use-count policy is set in architecture; guests can request a fresh link via Order reference.
- §4.6 — A single personal-use License applies to all Digital Downloads in v1.
- §4.1 — Contact is an enquiry form + listed channels *(confirmed, OQ-1)*.
- §4.7 — Single Operator credential; no role hierarchy.
- §4.8 — Email + password registration; social login not required in v1.
- §7 — SM-2 (portfolio engagement) baseline is set after launch once real traffic exists.
- §4.1 — Achievements have exactly four kinds (Award, Exhibition, Publication, Honour) in v1.
- §6.1 — Until the post-launch shop phase, the live Shop sells Physical Prints via COD only.
- §10 — Responsive web only (no native app).
- §10 — Bilingual UI (Vietnamese + English); the Operator supplies Product and Portfolio content in both languages.
- §4.5/§4.6 — Order confirmations and Digital Download links are delivered by email. *(confirmed)*

## 10. Cross-Cutting NFRs

*System-wide non-functional requirements not tied to a single feature.*

- **Responsive web** — the storefront and portfolio work well on mobile and desktop; mobile is a first-class experience (buyers arrive from phones). No native app in v1. `[ASSUMPTION]`
- **Bilingual UI (Vietnamese + English)** — all customer-facing UI, Product content, and Portfolio content are presented in both Vietnamese and English, with a language toggle. `[ASSUMPTION: Operator supplies content in both languages.]`
- **Transactional email** — order confirmations and Digital Download links are delivered by email reliably (deliverability matters for re-download).
- **Image performance** — product and gallery images are optimized/served efficiently so image-heavy pages load acceptably on mobile networks.
- **Payment security** — payment credentials/card data are handled by the payment provider and never stored by SamThuongShop.
- **Digital-file protection** — un-watermarked Digital Download files are stored non-publicly and served only via secured, time-limited Download Links (no public/guessable URLs).
- **Basic SEO & shareability** — Product and Portfolio pages are indexable and produce good link previews, so social links (a key traffic source) render well.
- **Reliability of digital delivery** — payment-confirmed Digital Downloads are delivered without manual steps (supports SM-3).
- **Simplicity/maintainability** — the whole system is operable and maintainable by one non-technical person.

## 11. Constraints & Guardrails

- **Privacy (Customer PII)** — collect only what's needed (contact + shipping address for prints); store it securely; do not expose it beyond the Operator.
- **Payment data** — no storage of raw payment credentials; delegate to the provider.
- **Content ownership** — all imagery is Sam Thuong's; the store must protect the sellable digital assets from casual copying (watermarked previews, protected downloads).
- **Cost** — keep running costs low and appropriate for a single-artist store (informs architecture, not specified here).

## 12. Platform & Aesthetic *(light)*

- **Platform** — responsive web (desktop + mobile browsers). `[ASSUMPTION]`
- **Languages** — bilingual Vietnamese + English, with a language toggle.
- **Aesthetic & Tone** — image-forward and clean; the design should get out of the way and let the bird photography lead. Professional and calm, matching a serious birder's portfolio; not busy or "discount-store" loud. The portfolio leads; commerce stays quiet and secondary in every layout.
