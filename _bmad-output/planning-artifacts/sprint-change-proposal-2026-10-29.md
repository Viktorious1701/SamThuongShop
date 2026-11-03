---
title: Sprint Change Proposal — Portfolio-first pivot
project: SamThuongShop
date: 2026-10-29
author: Thinh An (with Developer agent)
status: approved 2026-10-29
mode: batch
scope: moderate
affects:
  - prds/prd-SamThuongShop-2026-07-18/prd.md
  - epics.md
  - architecture/architecture-SamThuongShop-2026-07-18/ARCHITECTURE-SPINE.md
  - ux-designs/ux-SamThuongShop-2026-07-18/EXPERIENCE.md
---

# Sprint Change Proposal — Portfolio-first pivot

## 1. Issue Summary

**Trigger:** a strategic pivot from the stakeholder, not a failure in a story. It was raised on 2026-10-29, after Story 3.4 (COD + minimal order loop, commit `df71fe9`) on branch `cod-and-orders`.

**Problem statement:** the plan treats SamThuongShop as *an online store that doubles as a portfolio*: Shop and Portfolio are peers, and the success metrics are about sales. The owner now wants the opposite. The site is a **portfolio and achievements showcase for Sam Thuong**. Visitors should land on, and be led through, the galleries, pictures and achievements first. The **shop is optional and secondary**: it stays available as one quiet nav item, not the headline.

**Evidence / current state:**
- Built so far: the shop path (catalog, product detail, cart, checkout, COD, operator order loop).
- The showcase is all placeholder. `app/[locale]/page.tsx`, `portfolio/`, `about/` and `contact/` render "coming soon" stubs.
- The nav (`components/site-nav.tsx`) is ordered Home · Shop · Portfolio · About · Contact, with a cart icon and Login always visible.
- The PRD §1 vision, §6 MVP scope and §7 SM-1/SM-2 are all store-first. EXPERIENCE.md says outright that *"Shop and Portfolio are peers."*

**Decisions taken with the owner (2026-10-29):**

| # | Decision |
|---|---|
| D1 | "Client gallery" means **public showcase galleries** (no private per-client delivery galleries). |
| D2 | The shop **stays working and reachable as a secondary nav item**. Remaining shop work is deprioritised until the showcase ships. |
| D3 | Achievements cover **Awards & competitions, Exhibitions, Publications & press, Honours & memberships** (4th kind added after research, R-a). |
| D4 | Home = **hero + featured gallery selection + achievements highlights**, with a quiet shop link. |
| D5 | Achievements get **their own page and nav item**. Nav: **Portfolio · Achievements · About · Contact · Shop**. |
| D6 | The **cart icon shows only when the cart is non-empty**. Login/Account moves out of the top bar (to the footer and shop surfaces). |
| D7 | Within the shop, **physical prints still lead**; digital downloads stay a minor add-on. |

## 2. Impact Analysis

### 2.1 Epic impact

| Epic | Status today | Impact |
|---|---|---|
| **1 — Foundation, Portfolio, Accounts & Operator Access** | 1.1–1.5 done; 1.6–1.8 not started | **Becomes the active epic.** Rename it to lead with the showcase. 1.6/1.7/1.8 are rewritten for the portfolio-first framing. **Two new stories:** 1.9 Achievements, 1.10 Portfolio-led Home & navigation. |
| **2 — Product Catalog** | 2.1–2.5 done; 2.6 open | Done work is untouched. **2.6 Search is deferred** to the post-showcase shop phase. |
| **3 — Cart, Checkout, Payment & Digital Delivery** | 3.1, 3.2, 3.4 done; 3.3, 3.5–3.7 open | **3.3, 3.5, 3.6 and 3.7 are deferred.** One new small story is needed (**3.8 Interim prints-only, COD-only shop**, see 2.4). |
| **4 — Operator Order Fulfillment** | minimal 4.1/4.2 done (via 3.4 plan); 4.3 open | **4.3 Cancel is deferred.** 4.1/4.2 are good enough for COD print orders. |

**Rollback:** none. All shipped shop code stays and keeps working.

**New execution order:**
1. **3.8** Interim shop guard (small, protects the live shop)
2. **1.6** Portfolio galleries (manage + view)
3. **1.9** Achievements (manage + view)
4. **1.7** About / profile
5. **1.10** Portfolio-led Home & navigation (depends on 1.6 + 1.9 for its teasers)
6. **1.8** Contact (OQ-1 must be resolved first)
7. *Post-showcase shop phase:* 3.3 → 3.5 → 3.6 → 3.7 → 4.3 → 2.6

### 2.2 Artifact conflicts

| Artifact | Conflict | Change size |
|---|---|---|
| **PRD** | Vision, JTBD order, journeys, MVP scope and success metrics are all store-first. No *Achievement* concept. | Medium: rewrites §0, §1, §2.1, §2.3, §3, §4.6, §4.7, §6, §7, §9, §12. Adds FR-26, FR-27. |
| **Architecture spine** | The entity model has Gallery/PortfolioImage but no Achievement, and the scope line is store-first. | Small: adds the `Achievement` entity, updates the scope line, the ER diagram and the capability map. **No AD rule changes; no stack changes.** |
| **UX — EXPERIENCE.md** | Says Shop and Portfolio are peers. Nav order and Home purpose are store-first. No Achievements surface. Flow 3 is labelled "lighter." | Medium: Foundation nav rule, sitemap, surfaces table, new Achievements surface, Home redefined, flows reordered, nav component rule (cart visibility). |
| **UX — DESIGN.md** | None found. The Sky & Sedge visual system is "photography leads," which fits the pivot better than before. | None |
| **Implementation-story files / sprint-status.yaml** | No `sprint-status.yaml` exists. Existing story files (1-1 … 3-2) are for done work. | N/A |

### 2.3 Technical impact (for the stories, not this proposal)

- **Schema:** new tables `Gallery`, `PortfolioImage` (1.6) and `Achievement` (1.9). These are bilingual per AD-7, with images in the **public** R2 tier per AD-15. This is additive only, with no migration risk to Orders/Products.
- **Reuse:** the `lib/server/storage.ts` upload path, the `ProductImage` pattern and the admin editor patterns (`product-editor.tsx`, `collection-editor.tsx`) carry over directly.
- **Nav/Home:** `components/site-nav.tsx`, `components/site-footer.tsx`, `app/[locale]/page.tsx` and `messages/{vi,en}.json`.
- **Seed:** the `public/placeholders/portfolio.json` + `bird-01…12.jpg` set already exists and can seed galleries for dev.

### 2.4 Risk the pivot exposes: the live shop has paths that can't complete

Deferring 3.3 (VietQR) and 3.6 (digital delivery) leaves two dead ends in the shop **that is already reachable today**:
1. Checkout offers **VietQR**, but no payment provider exists. Such orders sit at *Pending Payment* forever.
2. A cart with a **Digital Download** cannot use COD (AD-8), so it is forced to VietQR, which leads to the same dead end. Even if paid, nothing would deliver the file.

If the shop stays visible during the showcase phase, a visitor can place an order that can never be fulfilled. Proposed fix: **Story 3.8**, a small interim guard. While payOS and digital delivery are off, checkout offers **COD only** and the storefront **hides Digital Download variants**. It uses a config switch, so 3.3/3.6 turn it back on later.

### 2.5 Reference research (owner-supplied sites, 2026-10-29)

Two Vietnamese photographer sites were reviewed by rendering them in a headless browser, as a visitor sees them (screenshots in the session scratchpad).

| | **Hoàng Thế Nhiệm** (hoangnhiemphoto.photoshelter.com) | **Huỳnh Thanh Danh — Birders Vietnam** (huynhthanhdanh.com) |
|---|---|---|
| Platform | PhotoShelter Beam template (client-rendered) | Custom site |
| First view | Full-bleed **single cover photo**; left sidebar lists every gallery | Top bar + left category sidebar; **photo grids per category**, each with "Xem tất cả" (View all) |
| Nav | 15 galleries listed flat, then ALL GALLERY · About · Contact | Trang chủ · Thư viện ảnh · **Báo chí** (press) · Tùy bút (essays) · Videos · Tác giả (about) |
| Gallery taxonomy | **Collection → Gallery** (theme or country: Japan, Iceland, B&W, Landscape of Vietnam…) | **Category → location**: *Chim Việt Nam* → Đà Lạt, Tràm Chim NP, Yok Don NP… · *Chim Thế Giới* → Costa Rica, West Papua… · *Bạn bè* (friends' photos) |
| Captions | Long SEO alt text | **Vietnamese name \| English name** (e.g. "Bồng chanh đỏ \| Black-backed Kingfisher"); sex marked "(trống)/(mái)" |
| Achievements | **About page is a CV**: biography → memberships/titles (HOPA, VAPA, **A.FIAP**) → ambassadorships (Sony Vietnam 2017–2024) → **Exhibitions by year** → **Awards by year** | **Báo chí** page: press cards (outlet, title, excerpt → external article). Also essays and YouTube videos |
| Selling | **Per-image "Buy this image → Print/product · Royalty-free license"** inside the image viewer. There is no shop in the nav | None. About says non-commercial; "contact for permission to use" |
| Contact | Persistent sidebar line "Gửi các thông tin yêu cầu đến tác giả" + email; contact form page | Email + Facebook at the foot of About |
| Mobile | Template-dependent | Hamburger menu; 2-column photo grid |
| Weak spots | Flat 15-item nav doesn't scale; heavy grey frame; typo in site title | Public visitor counter; placeholder/joke captions; small corner watermark on every image |

**What we adopt (folded into the proposals below):**
1. **Photos before words.** Both sites open straight onto photography. This confirms D4 (hero + featured grid, no marketing copy block).
2. **Two-level galleries.** Both use *group → gallery* (Collection→Gallery; Category→location). Sam Thuong's natural shape is the birder one: **Chim Việt Nam → by site / national park**, **Chim Thế Giới → by country**. → Story 1.6 and the spine get an optional parent Gallery.
3. **Bilingual species naming on every caption.** Birders read both names regardless of UI language: "Bồng chanh đỏ · Black-backed Kingfisher". → caption convention updated (alt text keeps "{Species} — {location}" in the active locale).
4. **Home = grids per gallery group with "View all".** This is the HTD pattern, below our hero. → Story 1.10.
5. **The professional record has more shapes than our three kinds.** HN's CV lists **memberships/titles and ambassadorships** (A.FIAP, VAPA, Sony ambassador) alongside exhibitions and awards. HTD's press entries carry an **excerpt + outlet + external link**. → Achievement gets an excerpt field; a fourth kind, "Honours & memberships", is offered for the owner to decide (see §5).
6. **Selling happens inside the image viewer, not in the nav.** HN's "Buy this image" in the lightbox is exactly our "View this print" bridge, and validates the shop as secondary. HN also offers **licensing** per image, which supports a licensing path through Contact.
7. **Contact = short enquiry form + listed channels.** HN uses form + email; HTD uses email + Facebook. → recommended answer for OQ-1: a form (name, email, enquiry type *print / licensing / collaboration / other*, message → email to the operator via Resend) plus listed email, Facebook and Zalo.

**What we avoid:** visitor counters, a flat gallery list as primary nav, placeholder captions, corner watermarks on portfolio display images (keep the watermark for digital-download previews only), and other photographers' galleries (PRD non-goal: single-artist).

**Noted, not adopted yet:** *Tùy bút* (essays/field notes) and *Videos*. Both reference birders have them and they suit a portfolio, but they are new scope. Offered to the owner as a possible later "Journal" story (see §5).

## 3. Recommended Approach

**Selected: Option 1 — Direct Adjustment, with a light MVP re-scope (Option 3 for metrics/scope only).**

| Option | Verdict | Why |
|---|---|---|
| 1 Direct adjustment | **Viable — chosen** | The showcase stories already exist (1.6–1.8) and the architecture already anticipated Gallery/PortfolioImage. Adding two stories and reordering covers the pivot. Effort **Medium**, risk **Low**. |
| 2 Rollback | Not viable | Nothing built conflicts with the pivot. The shop becomes secondary but stays functional, so reverting it would destroy working value. |
| 3 MVP review | Partially used | The MVP *definition* changes: launch = showcase + the existing COD print shop. The *requirements* mostly survive and are re-prioritised, not cut. |

**Effort:** 5 showcase stories (1.6, 1.7, 1.8, 1.9, 1.10) + 1 small guard story (3.8). That is about the same size as Epic 2.
**Risk:** low. Additive schema; no change to payment/order invariants.
**Timeline impact:** launch no longer waits on payOS registration (R-1). The showcase can go live first, which **removes the biggest external blocker from the launch path**.

## 4. Detailed Change Proposals

### 4.1 PRD — `prds/prd-SamThuongShop-2026-07-18/prd.md`

**P1. Frontmatter** — `updated: 2026-07-18` → `updated: 2026-10-29`; add `revision: portfolio-first pivot (sprint-change-proposal-2026-10-29)`.

**P2. §0 Document Purpose**

OLD:
> This PRD defines **SamThuongShop**, an online store and portfolio built for **Sam Thuong**, a professional birder… Scope is deliberately lean: a standard e-commerce store plus a portfolio, kept simple because one person runs it.

NEW:
> This PRD defines **SamThuongShop**, a portfolio and achievements showcase for **Sam Thuong**, a professional birder, with an optional print shop, operated by a single manager (Thinh An). […unchanged middle…] Scope is deliberately lean: a portfolio-first site with a small, secondary shop, kept simple because one person runs it.

*Rationale:* the purpose statement sets how every downstream reader frames the product.

**P3. §1 Vision (full replacement)**

NEW:
> SamThuongShop is the online home of **Sam Thuong's bird photography**. It is a calm, image-forward **portfolio** that presents him as a serious, professional birder through curated **Galleries**, a record of his **Achievements** (awards and competitions, exhibitions, publications and press) and a short profile. Visitors, whether fellow bird lovers, potential collaborators, editors or organisers, should arrive, be pulled straight into the pictures, and leave understanding the quality and standing of his work.
>
> Selling is **secondary**. An optional **Shop** lets visitors who fall for an image buy it as a **Physical Print** (wall / wood-print décor, the primary product), with **Digital Downloads** as a minor add-on. The shop is one quiet path out of the portfolio, never the headline.
>
> It exists because Sam Thuong's photography has no dedicated home that does justice to it. A social feed scatters the work and a marketplace listing strips away the story. SamThuongShop gathers the best images and the recognition they've earned in one place, bilingual for Vietnamese and English audiences, simple enough that one operator can keep it current.
>
> Success looks like: visitors land on the galleries, explore them, see the achievements, and reach out. A small, reliable print shop is there for those who want to take a picture home.

**P4. §2.1 Jobs To Be Done (reordered + one added)**

NEW order:
1. **See who Sam Thuong is and judge the quality of his work** — *(moved from 3rd to 1st)* unchanged text.
2. **Verify his professional standing** — *(new)* an editor, organiser, collaborator or fan wants to see the awards he has won, where he has exhibited and where his work has been published.
3. **Get in touch** — *(new, split out)* a visitor wants to reach Sam Thuong about his work, a collaboration or a print.
4. **Buy a piece of Sam Thuong's bird art** *(optional)* — unchanged text, prefixed "*(secondary)*".
5. **Get the image delivered (physical) or now (digital)** — unchanged text, prefixed "*(secondary)*".
6. **Run the site single-handedly** — OLD "Run the shop single-handedly… add/edit products, process and fulfill orders, and update portfolio content" → NEW "…keep galleries, achievements and About current, and, when the shop is used, manage products and orders…".

**P5. §2.3 Key User Journeys (reordered)**

- Current **UJ-3** becomes **UJ-1** and is expanded (no longer "lighter"):
  > **UJ-1. A visitor discovers Sam Thuong's work.**
  > - **Persona + context:** Hà, a nature-magazine editor, gets a shared link to the site.
  > - **Entry state:** unauthenticated, on her phone, arriving at Home.
  > - **Path:** Home opens on a full-bleed photograph and a featured selection from the Galleries. She opens the **Portfolio**, browses a Gallery and steps through images in the lightbox. She checks **Achievements** (awards, exhibitions, publications) and reads **About**.
  > - **Climax:** within a minute she has seen enough of the work and its recognition to judge him a serious professional.
  > - **Resolution:** she uses **Contact** to ask about licensing an image for an article. **Branch:** a different visitor sees "View this print" on a gallery image and continues into UJ-2.
- Current **UJ-1** (Lan, print, VietQR) → **UJ-2**. Her entry state changes to *arriving from a gallery image's "View this print" link* (social-link entry is still valid). The payment step reads "*pays by **COD** (VietQR when enabled)*".
- Current **UJ-2** (Minh, digital) → **UJ-3**, marked "*(secondary — enabled once digital delivery ships)*".

**P6. §3 Glossary**

ADD:
> - **Achievement** — a recorded recognition of Sam Thuong's work, of one of four kinds: **Award** (a prize or placing in a competition), **Exhibition** (a show where the work was displayed), **Publication** (a magazine, book, article or press feature), or **Honour** (a membership, distinction or title, e.g. an association membership, a FIAP distinction, a brand ambassadorship). Has bilingual title/description, a year/date, an organiser/venue/outlet, an optional link and an optional image. Shown on the Achievements page.
> - **Featured** — an Operator-set flag on a Gallery image or Achievement that surfaces it on Home.

CHANGE:
> - **Portfolio** — OLD "the non-commercial showcase area of the site: Sam Thuong's galleries and profile." → NEW "the primary, non-commercial showcase area of the site: Sam Thuong's Galleries, Achievements and profile. It is the default destination for every visitor."
> - **Operator** — OLD "…manages Products, Orders, and Portfolio content." → NEW "…manages Portfolio content (Galleries, Achievements, About) and, for the Shop, Products and Orders."

**P7. §4 Features — reorder**

Move **§4.6 Portfolio & About** to become **§4.1 Portfolio, Achievements & About**. The current §4.1–§4.5 shift down one (to §4.2–§4.6) and each gets a one-line lead-in: "*Secondary: the optional Shop.*" FR numbers stay as they are (stable global references).

**P8. §4.1 (new position) Portfolio, Achievements & About — description**

OLD:
> The showcase area presenting Sam Thuong as a professional birder: curated Galleries of his work and a short profile/bio, plus a way to contact him. Portfolio images are for viewing; some may link to a purchasable Product. Realizes UJ-3.

NEW:
> **The heart of the site.** It presents Sam Thuong as a professional birder through a portfolio-led Home, curated Galleries, a record of Achievements, a short profile/bio and a way to contact him. Every visitor lands here first. Portfolio images are for viewing; some may link to a purchasable Product, which is the only bridge into the Shop. Realizes UJ-1.

FR-16 ADD consequence:
> - The Portfolio is reachable in one tap from every page and is the first item in the primary navigation.

**P9. New FRs (in §4.1)**

> #### FR-26: Browse achievements
> A visitor can see Sam Thuong's Achievements, grouped by kind. Realizes UJ-1.
>
> **Consequences (testable):**
> - The Achievements page lists Awards & competitions, Exhibitions, Publications & press, and Honours & memberships as separate groups, each newest-first.
> - Each Achievement shows its title, year/date and organiser/venue/outlet in the active language (Vietnamese fallback). Where present it also shows a description, an external link (opens in a new tab) and an image.
> - An empty group is hidden, not shown as an empty heading.
>
> #### FR-27: Portfolio-led landing and navigation
> Every visitor is led to the Portfolio first. Realizes UJ-1.
>
> **Consequences (testable):**
> - Home opens on a full-bleed photograph and a featured selection of Gallery images, followed by highlighted Achievements and a short About hook. Any Shop entry on Home is a single secondary link, never above the fold.
> - Primary navigation order is **Portfolio · Achievements · About · Contact · Shop**.
> - The Cart indicator appears only when the Cart is non-empty. Account sign-in is reachable from the footer and from Shop surfaces, not from the top bar.

**P10. FR-22 (manage portfolio content) — extended**

OLD title/consequences:
> The Operator can edit Galleries and the About/profile content.
> - The Operator can add/remove Gallery images and edit About text.
> - The Operator can provide About text (and any captions) in both Vietnamese and English (supports FR-25).

NEW:
> The Operator can edit Galleries, Achievements, and the About/profile content.
> - The Operator can create, order and remove Galleries, and add, reorder, caption and remove Gallery images.
> - The Operator can create, edit, order and delete Achievements of each kind.
> - The Operator can mark Gallery images and Achievements as **Featured** for Home.
> - The Operator can provide About text, captions and Achievement text in both Vietnamese and English (supports FR-25).

**P11. §6.1 MVP In Scope (rewritten, two tiers)**

NEW:
> **Launch (showcase):**
> - Portfolio-led Home and navigation (FR-27).
> - Portfolio Galleries with lightbox, Achievements, About and Contact (FR-16, FR-26, FR-17, FR-18).
> - Operator admin for Galleries, Achievements and About (FR-22, FR-23).
> - Bilingual Vietnamese + English (FR-25), responsive, SEO and share previews.
>
> **Launch (secondary shop — already built, kept live):**
> - Catalog, product detail, Collections (FR-1, FR-2, FR-19, FR-20); cart and guest/account checkout with conditional shipping (FR-4–FR-7).
> - **COD for Physical Prints** (FR-8, COD path); Operator order view / advance / mark paid (FR-11, FR-21).
> - Optional Customer accounts (FR-24).
> - Interim guard: Physical Prints only, COD only, until the post-launch shop phase.
>
> **Post-launch shop phase (deferred, still planned):**
> - VietQR via payOS (FR-8 online path, FR-9), blocked on payOS registration (R-1).
> - Order confirmation email (FR-10 email consequence).
> - Digital Download delivery, re-download and License (FR-13–FR-15).
> - Operator cancel (FR-12); basic search (FR-3).

**P12. §7 Success Metrics (re-weighted)**

NEW:
> **Primary**
> - **SM-1: Showcase live.** Galleries, Achievements and About are published in both languages at launch. Validates FR-16, FR-17, FR-22, FR-26.
> - **SM-2: Portfolio engagement.** Most visitors who land on Home go on to open a Gallery or the lightbox, and a meaningful share view Achievements or About. Validates FR-16, FR-26, FR-27. `[ASSUMPTION: baseline set post-launch.]`
> - **SM-3: Enquiries.** Visitors use Contact to reach Sam Thuong (collaborations, licensing, prints). Validates FR-18.
>
> **Secondary (shop)**
> - **SM-4: First print sale.** A Physical Print Order is placed and fulfilled via COD within the first months after launch. Validates FR-8, FR-11. *(was SM-1)*
> - **SM-5: Digital delivery reliability.** Applies once digital delivery ships: about 100% of Paid Digital Download Orders download without Operator intervention. Validates FR-13, FR-14. *(was SM-3)*
>
> **Counter-metrics:** SM-C1 (Operator effort) and SM-C2 (digital-file leakage) are unchanged. ADD **SM-C3: Shop intrusion.** Shop prompts must not crowd the portfolio. No sales banners, no shop CTA above the fold on Home. Counterbalances SM-4.

**P13. §9 Assumptions Index.** Update the SM-4 line to SM-2. ADD: "§4.1: Achievements have exactly four kinds (Award, Exhibition, Publication, Honour) in v1." ADD: "§6.1: until the post-launch shop phase, the live Shop sells Physical Prints via COD only."

**P14. §12 Aesthetic & Tone.** ADD a sentence: "The portfolio leads; commerce stays quiet and secondary in every layout."

### 4.2 Epics — `epics.md`

**E1. Requirements Inventory.** Add FR-26 and FR-27 (text as P9) and update FR-22 (as P10). Coverage map: `FR-26: Epic 1 — achievements`, `FR-27: Epic 1 — portfolio-led home & navigation`. Change "All 25 FRs mapped" to "All 27 FRs mapped".

**E2. Epic List: Epic 1**

OLD title: `Epic 1: Foundation, Portfolio, Accounts & Operator Access`
NEW title: `Epic 1: Foundation & Portfolio Showcase (galleries, achievements, about, contact)`

NEW description lead:
> The bilingual (VN/EN) site is live and **portfolio-first**. Visitors land on a photo-led Home, browse the galleries, see Sam Thuong's achievements, read About and get in touch. The Operator manages all of it from the admin shell. It also holds the foundation every later epic builds on (scaffold, tokens, i18n, layered structure, one Auth.js system, the guarded admin shell).

**FRs covered:** add FR-26, FR-27.

**E3. Epic List: Epics 2–4.** Add one line to each: "*Secondary (shop). Remaining stories are scheduled after Epic 1's showcase stories — see Sprint Change Proposal 2026-10-29.*"

**E4. Story 1.3 (done).** Add a note only, with no AC change: "*Nav order superseded by Story 1.10 (portfolio-first).*"

**E5. Story 1.6: Portfolio galleries (manage + view) — AC rewrite**

NEW:
> As a visitor,
> I want to browse Sam Thuong's portfolio galleries,
> So that I can experience his work, which is the main reason the site exists. *(FR-16, FR-22)*
>
> **Given** the Operator manages Galleries (bilingual name, order, **optional parent Gallery: one level of grouping, e.g. "Chim Việt Nam" → "Tràm Chim", "Chim Thế Giới" → "Costa Rica"**) and their images (upload to public storage, **species name in Vietnamese and English**, location, order, Featured flag, optional linked Product) from the admin shell
> **When** a visitor opens Portfolio
> **Then** they see the gallery groups, each with its child Galleries and a "View all / Xem tất cả" entry, and can open a Gallery into a responsive masonry/asymmetric grid
> **And** every caption shows both species names ("Bồng chanh đỏ · Black-backed Kingfisher") plus location; alt text follows "{Species} — {location}" in the active locale
> **And** clicking an image opens an accessible lightbox (focus trapped + restored, arrow keys/swipe, `Esc` closes, reduced-motion honored)
> **And** an image linked to a published Product shows "View this print / Xem bản in này"; otherwise no purchase affordance
> **And** images load via next/image with reserved aspect ratios (no layout shift), lazy below the fold
> **And** the Gallery/PortfolioImage tables are created by this story.

**E6. Story 1.7: About / profile.** Add AC:
> **And** About links onward to Portfolio and Achievements (no dead end).

**E7. Story 1.8: Contact.** Unchanged ACs. Add: "*Blocked on OQ-1 (contact mechanism). Resolve before starting.*"

**E8. New Story 1.9: Achievements (manage + view)**

> As a visitor,
> I want to see Sam Thuong's awards, exhibitions and publications,
> So that I can judge his professional standing. *(FR-26, FR-22)*
>
> **Given** the Operator creates, edits, orders and deletes Achievements from the admin shell. Each has a kind (Award / Exhibition / Publication / Honour), bilingual title and optional description/excerpt (a publication shows outlet + excerpt + link, as press cards do), year/date, organiser/venue/outlet, optional external link, optional image (public storage or an existing portfolio image), and a Featured flag
> **When** a visitor opens Achievements in either locale
> **Then** Achievements render grouped as Awards & competitions · Exhibitions · Publications & press · Honours & memberships, newest first, in the active locale with Vietnamese fallback
> **And** empty groups are hidden; external links open in a new tab with an accessible label
> **And** per-locale page metadata / OpenGraph is emitted
> **And** the Achievement table is created by this story.

**E9. New Story 1.10: Portfolio-led Home & navigation**

> As a visitor,
> I want the site to open on Sam Thuong's photographs and lead me through his work,
> So that I see the portfolio before anything else. *(FR-27, FR-16, FR-26)*
>
> **Given** Galleries with Featured images (1.6) and Featured Achievements (1.9)
> **When** I open Home in either locale
> **Then** I see a full-bleed hero photograph (Operator-chosen, or the first Featured image), a one-line bilingual intro, then **one featured grid per gallery group** (e.g. Chim Việt Nam, Chim Thế Giới), each with "View all / Xem tất cả" → that group, a strip of highlighted Achievements → Achievements, and an About hook
> **And** any Shop entry on Home is a single secondary link below the fold (SM-C3)
> **And** the primary nav (desktop + mobile) reads **Portfolio · Achievements · About · Contact · Shop**, with the wordmark linking Home
> **And** the cart icon renders only when the cart is non-empty; Login/Account moves to the footer and Shop surfaces
> **And** the hero is the priority image; the rest lazy-load with reserved aspect ratios; no auto-playing carousel
> **And** Home emits per-locale OpenGraph using the hero image.

**E10. New Story 3.8: Interim prints-only, COD-only shop** *(execute first)*

> As the Operator,
> I want the live shop to offer only what I can actually fulfil today,
> So that no visitor places an order that can never complete. *(AD-4, AD-8, risk §2.4)*
>
> **Given** payOS (3.3) and digital delivery (3.6) are not yet live
> **When** the shop runs with online payment and digital sales switched off (a single server-side config switch)
> **Then** checkout offers **COD only**, with the VietQR option hidden
> **And** Digital Download Variants are hidden from product detail and cannot be added to the cart (the server re-guards)
> **And** a Product whose only Variants are digital does not appear in the storefront
> **And** turning the switch on restores today's behaviour unchanged (3.3/3.6 flip it when they ship).

**E11. Deferred stories.** Mark 2.6, 3.3, 3.5, 3.6, 3.7 and 4.3 with "*Deferred — post-showcase shop phase (Sprint Change Proposal 2026-10-29).*" Their ACs are unchanged.

### 4.3 Architecture spine — `ARCHITECTURE-SPINE.md`

**A1. Frontmatter `scope`**
OLD: `'Whole system — bilingual storefront + portfolio, checkout (physical + digital), orders & fulfillment, digital delivery, single-operator admin'`
NEW: `'Whole system — portfolio-first bilingual showcase (galleries, achievements, about) with a secondary storefront, checkout (physical + digital), orders & fulfillment, digital delivery, single-operator admin'`
`binds: [FR-1..FR-25]` → `[FR-1..FR-27]`; `updated: 2026-10-29`.

**A2. Design Paradigm, first paragraph.** "One codebase holds the bilingual storefront, the portfolio, and the operator admin." → "One codebase holds the bilingual portfolio showcase (primary), the storefront (secondary), and the operator admin."

**A3. AD-7 Rule.** "translatable fields on Product / Portfolio / About" → "translatable fields on Product / Gallery / PortfolioImage / Achievement / About". *(Clarification only, not a new rule.)*

**A4. AD-15 Rule.** "public display/preview assets (product/gallery images, watermarked previews)" → "public display/preview assets (product, gallery and achievement images, watermarked previews)".

**A5. Consistency Conventions — Entity naming.** Add `Achievement`.

**A6. Core entities ER diagram.** ADD:
```
  Achievement }o--o| PortfolioImage : "may show"
```
and `Gallery |o--o{ Gallery : "groups (one level)"`.
Note under the diagram: "`Achievement.kind` ∈ {AWARD, EXHIBITION, PUBLICATION, HONOUR}. A Gallery may have one parent Gallery (grouping only, max depth 2). `Gallery`, `PortfolioImage` and `Achievement` are owned by a `lib/server/portfolio` service (AD-2)."

**A7. Source tree.** Under `app/[locale]/(portfolio)/` add `achievements`. Under `lib/server/` add `portfolio` to the service list.

**A8. Capability → Architecture Map.** Move the Portfolio row to the top and change it to:
`| Portfolio, achievements & about (FR-16..FR-18, FR-26, FR-27) — primary | app/[locale]/(portfolio), home, lib/server/portfolio | AD-2, AD-7, AD-15 |`
Admin row: FR-19..FR-23 now includes Achievements management (FR-22).

**A9. Deferred.** ADD: "**Shop online payment + digital sales**: switched off behind a server-side config flag (Story 3.8) until payOS (R-1) and digital delivery ship; no AD change, as AD-4/AD-6 remain the rules when it is switched on."

### 4.4 UX — `EXPERIENCE.md`

**U1. Foundation — Navigation**

OLD:
> **Navigation:** one unified top nav — **Home · Shop · Portfolio · About · Contact**, plus cart and the EN|VN toggle. **Shop and Portfolio are peers** (the store and the showcase have equal standing).

NEW:
> **Navigation:** one unified top nav — wordmark (→ Home) · **Portfolio · Achievements · About · Contact · Shop**, plus the EN|VN toggle and a cart indicator that appears **only when the cart is non-empty**. **The portfolio leads; the Shop is secondary.** It is the last nav item and is never promoted above the fold on Home. Account sign-in lives in the footer and on Shop surfaces.

**U2. Sitemap.** Reorder the tree as Home → Portfolio → Achievements → About → Contact → Shop (with its sub-tree) → Account. ADD `├── Achievements ── (Awards · Exhibitions · Publications · Honours)`.

**U3. Surfaces → PRD FRs**
- Row 1 **Home / landing**: OLD purpose "Image-led entry; featured Products + Collections, portfolio teaser, brief About hook" → NEW "Photo-led entry: full-bleed hero, featured gallery selection, highlighted Achievements, About hook; one quiet Shop link below the fold". FRs → FR-27, FR-16, FR-26, FR-25.
- Move rows 10/11/12 (Portfolio, About, Contact) directly after Home.
- ADD row **Achievements**: "Awards & competitions, Exhibitions, Publications & press, Honours & memberships, grouped, newest first; links out; optional images" · reached from "Nav 'Achievements', Home highlights, About" · FR-26.
- Surface closure: add `FR-26→Achievements · FR-27→Home + global chrome`.

**U4. Component Patterns — Top nav row.** Replace "Holds Home/Shop/Portfolio/About/Contact + cart + EN|VN" with "Holds Portfolio/Achievements/About/Contact/Shop + EN|VN; the cart indicator renders only when the cart has ≥1 item (with a live count)". Keep the rest.

**U5. Component Patterns — ADD row: Achievement entry.** "A quiet list/card: kind-appropriate meta line (year · organiser / venue / outlet), title (`{typography.h3}`), optional one-paragraph description, optional thumbnail (reserved ratio), optional external link ('Read more' / 'Xem thêm', new tab, `aria-label` names the destination). Grouped under `{typography.h2}` kind headings. No trophy icons or badges; the record speaks for itself."

**U6. State Patterns — Loading row.** Add "Achievements" to the surfaces list.

**U7. Key Flows.** Current **Flow 3** becomes **Flow 1 — A visitor discovers Sam Thuong's work (UJ-1)**, no longer "lighter". Insert step "They open **Achievements** and scan awards, exhibitions and publications" between the gallery and About steps. The climax becomes "*the visitor recognises a serious professional*", with "View this print" as a branch. Current Flows 1 and 2 become **Flow 2 (print, COD; VietQR when enabled)** and **Flow 3 (digital, secondary, enabled once digital delivery ships)**.

**U8a. Gallery grid + caption convention (from §2.5).** Gallery grid row: add "Portfolio is two-level: gallery groups (e.g. Chim Việt Nam / Chim Thế Giới) → Galleries (site, park or country). Each group shows a 'View all / Xem tất cả' entry." Visible captions show **both species names** ("Bồng chanh đỏ · Black-backed Kingfisher") + location in every locale. The Accessibility alt-text rule is unchanged ("{Species} — {location}" in the active locale). Portfolio display images carry **no watermark** (the watermark is for digital-download previews only).

**U8. Mockups note.** Add: "*`mock-shop-catalog.html` and `mock-product-detail.html` predate the portfolio-first pivot; their nav order is superseded by the Foundation rule above.*"

## 5. Implementation Handoff

**Scope classification: Moderate.** Backlog reorganisation plus planning-doc updates. No fundamental replan: the architecture rules and stack are unchanged.

| Role | Responsibility | Deliverable |
|---|---|---|
| **PM / PO (owner: Thinh An)** | Approve this proposal; resolve **OQ-1** (contact mechanism) before 1.8; supply real gallery images and achievement records (or approve placeholders for dev). | Approval; OQ-1 answer; content. |
| **Developer agent** | Apply the approved doc edits (§4.1–§4.4). Then implement in order: **3.8 → 1.6 → 1.9 → 1.7 → 1.10 → 1.8**, each with a checklist plan in `docs/plans/` reviewed before coding. | Updated PRD / epics / spine / EXPERIENCE; story plans; code. |
| **Architect** | No action required. The spine edits are additive (A1–A9) and are applied by the Developer agent. | — |

**Success criteria**
1. The PRD, epics, spine and EXPERIENCE all describe a portfolio-first product with no remaining "Shop and Portfolio are peers" language.
2. After 3.8, the live shop cannot produce an un-fulfillable order (no VietQR option, no digital Variants).
3. After 1.10, a first-time visitor to `/vi` or `/en` sees photography above the fold, the nav reads Portfolio · Achievements · About · Contact · Shop, and no shop CTA appears above the fold.
4. The Galleries, Achievements and About content are bilingual and editable by the Operator without code changes.

**Owner decisions from the research (§2.5), resolved 2026-10-29:**
- **R-a ✅ Yes.** Add a fourth Achievement kind, **Honours & memberships** (e.g. association titles, FIAP distinctions, brand ambassadorships)? Recommended: yes. It is cheap (one enum value) and it's how established VN photographers present standing.
- **R-b ✅ Backlog.** Add a later **Journal** story (field notes / *tùy bút* + embedded videos)? Recommended: park it in the backlog after 1.8, not in this change.
- **R-c ✅ Accepted.** Accept the OQ-1 recommendation (enquiry form via Resend + listed email/Facebook/Zalo)?

**Open items carried forward:** OQ-1 *(resolved: R-c)*, OQ-2 (download policy, blocks 3.7), OQ-3 (print sizes and tiers, operator content), R-1 (payOS registration, now **off the launch path**).

## 6. Approval

Approved by Thinh An on 2026-10-29, with the R-a (fourth kind: Honour), R-b (Journal to backlog) and R-c (contact form + listed channels) resolutions above. Edits §4.1–§4.4 applied to the PRD, epics, architecture spine and EXPERIENCE.md on the same date. Next: the checklist plan for Story 3.8, then 1.6.
