# Story 1.6: Portfolio galleries (manage + view)

> **Epic:** 1 · **FR:** FR-16, FR-22 · **AD:** AD-1, AD-2, AD-7, AD-9, AD-15 · **Status:** Done — gates + runtime green (2026-11-02) · **Branch:** `cod-and-orders` (suggest a new `portfolio-galleries` branch) · **Commit:** —
> **Source story:** `_bmad-output/planning-artifacts/epics.md#story-16` · **UX:** `EXPERIENCE.md` → Gallery grid, Lightbox, Loading (image-heavy), Overlay focus management

**As a** visitor, **I want** to browse Sam Thuong's portfolio galleries, **so that** I can experience his work, which is the main reason the site exists.

The story replaces the `/portfolio` "coming soon" stub with:
- two-level galleries (group → gallery);
- a masonry grid with bilingual species captions;
- an accessible lightbox;
- an admin section to build all of it.

It also creates the `Gallery` / `PortfolioImage` tables that 1.9 (Achievements image) and 1.10 (Home featured grids) build on.

---

## 1. Gaps & Decisions

| ID | Area | Decision | Status |
|----|------|----------|--------|
| D1 | Data | **One level of grouping.** `Gallery.parentId` is optional. A gallery with children is a **group** (e.g. *Chim Việt Nam*). A gallery without children holds images (e.g. *Tràm Chim*), and so does a gallery with no parent (a standalone gallery). The service enforces depth: a parent can't itself have a parent, and a gallery that has children can't hold images. | ✅ Proposed |
| D2 | Data | **Images live only in leaf galleries.** A group's page ("View all / Xem tất cả") shows the images of all its children. Group pages are sectioned by child gallery, each section headed by the child's name, rather than one flat list. | ✅ Proposed |
| D3 | Data | **Gallery.published** (default `false`) lets Sam build a gallery quietly before it goes live. A group is visible only if it's published **and** at least one published child has images. There's no per-image publish flag: every image in a published gallery shows. | ✅ Proposed |
| D4 | Data | **Captions are bilingual.** Species and location each have a vi and an en field (`speciesVi/En`, `locationVi/En`), because place names translate (*Vườn quốc gia Cát Tiên* / *Cat Tien National Park*). The caption shows **both species names** in every locale. Location uses the active locale with Vietnamese fallback (AD-7, `pickLocalized`). All caption fields are optional; when an image has no caption, its alt text falls back to the gallery name. | ✅ Proposed |
| D5 | Upload | **The browser uploads the original to the PRIVATE bucket** via a presigned PUT. This reuses Story 2.1's `createUploadUrl` pattern and avoids Vercel's ~4.5 MB body cap. A server action then uses sharp to **resize it to ≤ 2400 px on the long edge** (auto-rotated from EXIF, metadata stripped, high-quality JPEG). The resized copy goes to the **PUBLIC** bucket under `portfolio/<uuid>.jpg`, and the action records its width, height and a tiny blur placeholder. This mirrors `watermark.ts`, without the watermark. The full-resolution original stays private as Sam's archive and is never served. | ✅ Proposed |
| D6 | Upload | **Multi-file upload.** You pick or drop many files. The client runs presign → PUT → process for each, **3 at a time**, with a progress list. Each image appears as soon as it finishes, with empty captions to fill in. A failure affects only that one file, which gets a "Retry" button. | ✅ Proposed |
| D7 | Admin UX | **Reorder with ↑/↓ buttons**, for galleries and images both. They're accessible and need no extra library. Drag-and-drop can come later. Captions are edited inline per image with a per-row Save. | ✅ Proposed |
| D8 | UI | **The lightbox is built in-house** (no dependency): `role="dialog"`, `aria-modal`, focus trapped while open and restored on close, `Esc` closes, ←/→ and swipe navigate, `prefers-reduced-motion` turns off transitions. The URL updates with `?image=<id>`, so a lightbox view can be shared and Back closes it. | ✅ Proposed |
| D9 | UI | **The masonry layout uses CSS columns** (`columns-1 sm:columns-2 lg:columns-3`) with the stored width/height. That gives no layout shift and needs no JS layout library. Reading order is top-to-bottom per column, which is acceptable for a photo wall. | ✅ Proposed |
| D10 | Images | **Next 16 `next/image`.** The existing `remotePatterns` (R2 host) is reused. The default `qualities: [75]` is kept. `priority` is deprecated in v16, so the first row uses `loading="eager"` + `fetchPriority="high"` and everything below loads lazily. `placeholder="blur"` uses the stored `blurDataUrl`. Every image gets a `sizes` value. | ✅ Proposed |
| D11 | Shop link | **"View this print / Xem bản in này"** shows only if the linked Product is **published and has at least one sellable variant**. That reuses 3.8's `sellableVariantWhere()` (to be exported), so a link never leads to an "unavailable" page. Linking a product is optional, and the admin picks it from a product dropdown. | ✅ Proposed |
| D12 | Data | **Featured flag** on `PortfolioImage` (default `false`). This story only stores and edits it; 1.10 reads it for the Home page. | ✅ Proposed |
| D13 | Delete | **Deleting an image** removes its row and makes a best-effort delete of both the public and the private R2 object. **Deleting a gallery** is blocked while it still has images or child galleries, with a "Move or delete its images first" message, so a misclick can't wipe a gallery. | ✅ Proposed |
| D14 | Scope | **Out of scope:** Home featured grids and the nav reorder (1.10), Achievements (1.9), About (1.7), Contact (1.8), EXIF camera data, drag-and-drop, moving images between galleries (delete and re-upload instead), and SEO/OG images per gallery. | ✅ Proposed |

---

## 2. Architecture

### 2.1 Source-tree layout

```text
prisma/
├── schema.prisma                                   # (mod) Gallery, PortfolioImage; Product.portfolioImages back-relation
└── migrations/{ts}_add_portfolio_galleries/        # (new) creates both tables (additive only)

lib/
├── server/
│   ├── portfolio.ts                                # (new) gallery + image service: admin CRUD/reorder, public reads, depth/leaf rules
│   ├── portfolio-image.ts                          # (new) processPortfolioUpload(): private original → sharp resize → public key + dims + blur
│   └── product.ts                                  # (mod) export sellableVariantWhere(); add listProductOptions() for the link dropdown
└── validation/
    └── portfolio-schemas.ts                        # (new) gallerySchema, imageCaptionSchema (literal English — admin)

app/
├── admin/(app)/
│   ├── layout.tsx                                  # (mod) "Portfolio" placeholder → live link to /admin/galleries
│   └── galleries/
│       ├── page.tsx                                # (new) tree list: groups → galleries, ↑/↓, publish toggle, image counts
│       ├── actions.ts                              # (new) "use server": save/reorder/publish/delete gallery; upload/process/caption/reorder/delete image
│       ├── gallery-editor.tsx                      # (new) client: names, slug, parent select, description
│       ├── new/page.tsx                            # (new) create gallery
│       └── [id]/page.tsx                           # (new) edit gallery + image manager
│           └── image-manager.tsx                   # (new) client: multi-upload queue, caption rows, featured, product link, ↑/↓, delete
└── [locale]/portfolio/
    ├── page.tsx                                    # (mod) stub → groups with child-gallery cards + "View all"
    └── [slug]/page.tsx                             # (new) gallery or group page → masonry grid + lightbox; notFound() if unpublished

components/portfolio/
├── gallery-card.tsx                                # (new) cover image + bilingual name → gallery
├── masonry-grid.tsx                                # (new) server: CSS-columns grid of image tiles (buttons)
├── caption.tsx                                     # (new) "Bồng chanh đỏ · Black-backed Kingfisher — Tràm Chim"
└── lightbox.tsx                                    # (new) client: dialog, focus trap/restore, keys, swipe, ?image=, reduced motion

messages/
├── en.json                                         # (mod) Portfolio namespace
└── vi.json                                         # (mod) Portfolio namespace
```

### 2.2 Data model

| Model | Table | Key fields | Notes |
|-------|-------|------------|-------|
| `Gallery` | `Gallery` | `id`, `slug @unique`, `nameVi`, `nameEn`, `descriptionVi?`, `descriptionEn?`, `parentId?` (self-relation, `onDelete: Restrict`), `position Int @default(0)`, `published Boolean @default(false)`, timestamps; `@@index([parentId])` | Depth ≤ 1 and leaf-only images are enforced in the service (D1/D2). **Change during build:** dropped `coverImageId` (it would make a circular FK). A card's cover is the gallery's first **Featured** image, else its first image. |
| `PortfolioImage` | `PortfolioImage` | `id`, `galleryId` (`onDelete: Restrict`), `key` (public, resized), `originalKey` (private), `width`, `height`, `blurDataUrl`, `speciesVi?`, `speciesEn?`, `locationVi?`, `locationEn?`, `position Int @default(0)`, `featured Boolean @default(false)`, `productId?` (`onDelete: SetNull`), `createdAt`; `@@index([galleryId])`, `@@index([featured])` | The product link is soft, so deleting a product just unlinks the image. |

Migration `prisma/migrations/{ts}_add_portfolio_galleries/` only **creates** tables; it doesn't change existing ones apart from Prisma's back-relation, which needs no column. **It runs against the live Supabase DB, and you run it:** `npx prisma migrate dev --name add_portfolio_galleries`. I'll give you the exact command when we get there.

### 2.3 Layer responsibilities

| Layer | Owns | File(s) |
|-------|------|---------|
| RSC pages | Read DTOs and render; no mutation | `app/[locale]/portfolio/**`, `app/admin/(app)/galleries/**/page.tsx` |
| Server Actions | `requireOperator()` → Zod → delegate → `revalidatePath` | `app/admin/(app)/galleries/actions.ts` |
| `lib/server/portfolio.ts` | Rules (D1–D3, D11, D13) and the only Prisma access for these tables (AD-2) | — |
| `lib/server/portfolio-image.ts` | sharp resize, blur placeholder, R2 private→public (AD-15 keys) | reuses `storage.ts` |
| Client components | Upload queue, editors, lightbox interaction | `image-manager.tsx`, `gallery-editor.tsx`, `lightbox.tsx` |

### 2.4 Business rules & invariants

| Rule | Source | Enforced in |
|------|--------|-------------|
| Max one level of nesting; a parent can't have a parent | D1 | `portfolio.ts` `saveGallery()` |
| Images only in leaf galleries; a gallery with images can't become a parent | D1/D2 | `portfolio.ts` `addImage()` / `saveGallery()` |
| Public reads return only published galleries, and groups only with visible children | D3 | `portfolio.ts` public reads |
| Public bucket gets only the resized copy; the original stays private | D5, AD-15 | `portfolio-image.ts` |
| Print link only when the product is published and sellable | D11, 3.8 | `portfolio.ts` via `sellableVariantWhere()` |
| Every mutation is operator-only | AD-9 | `actions.ts` (`requireOperator()` in each) |
| Bilingual content with vi fallback | AD-7 | `pickLocalized` in pages/components |
| Gallery delete blocked while it has images or children | D13 | `portfolio.ts` `deleteGallery()` |

### 2.5 Sequence: image upload (admin)

```mermaid
sequenceDiagram
    actor Op as Operator
    participant UI as image-manager (client)
    participant Act as actions.ts
    participant Svc as portfolio-image.ts / portfolio.ts
    participant R2p as R2 private
    participant R2 as R2 public
    participant DB as Postgres

    Op->>UI: drop N files
    loop each file (3 concurrent)
        UI->>Act: createPortfolioUploadUrl(type, ext)
        Act->>Act: requireOperator + type check
        Act-->>UI: { key: originals/portfolio/<uuid>.<ext>, url }
        UI->>R2p: PUT file (presigned)
        UI->>Act: processPortfolioImage(galleryId, originalKey)
        Act->>Svc: process + add
        Svc->>R2p: getObject(original)
        Svc->>Svc: sharp rotate → resize ≤2400 → jpeg; 16px blur
        Svc->>R2: putObject(portfolio/<uuid>.jpg)
        Svc->>DB: insert PortfolioImage (position = last + 1)
        Act-->>UI: { ok, image DTO } | { ok:false, error }
    end
```

### 2.6 Result / error flows

| Scenario | Outcome | Where |
|----------|---------|-------|
| Invalid gallery input / duplicate slug | `{ ok:false, error: "<English>" }` | `actions.ts` |
| Wrong file type (non-JPEG/PNG/WebP/AVIF) | Rejected before upload | `createPortfolioUploadUrl` |
| sharp fails (corrupt or unsupported file) | That file shows an error and "Retry"; the others continue | `processPortfolioImage` |
| Upload into a group gallery | `{ ok:false, error: "Groups can't hold images — add them to a gallery inside it." }` | `portfolio.ts` |
| Unknown or unpublished slug | `notFound()` | `[slug]/page.tsx` |
| Not operator | Redirect to `/admin/login` | layout + each action |

### 2.7 Convention compliance

| Rule | Note |
|------|------|
| AD-1 | All mutations are Server Actions |
| AD-2 | Prisma only in `lib/server/portfolio*.ts` and `product.ts` |
| AD-7 | Per-locale content columns with vi fallback, not message keys |
| AD-9 | `requireOperator()` in every action |
| AD-15 | Random UUID keys; original private, display copy public |
| Next 16 (`AGENTS.md`) | `preload`/`loading`/`fetchPriority` instead of `priority`; `qualities` default `[75]`; read bundled `node_modules/next/dist/docs` before writing image and route code |

### 2.8 Components & i18n keys

**i18n namespace `Portfolio`** (en + vi): `title`, `intro`, `viewAll` ("View all" / "Xem tất cả"), `imageCount`, `viewPrint` ("View this print" / "Xem bản in này"), `lightboxLabel`, `close`, `previous`, `next`, `imageOf` ("{current} of {total}"), `empty` (no galleries yet), `backToPortfolio`.

---

## 3. Tasks (checklist)

| ID | Task | File |
|----|------|------|
| T01 | Schema: `Gallery`, `PortfolioImage`, `Product` back-relation; `prisma generate` | `prisma/schema.prisma` |
| T02 | Migration `add_portfolio_galleries`. **You run it** against Supabase; I give the command and check the SQL first | `prisma/migrations/…` |
| T03 | Zod schemas: gallery (names, slug, parent, description) and image caption (species/location vi+en, featured, productId) | `lib/validation/portfolio-schemas.ts` |
| T04 | Export `sellableVariantWhere()`; add `listProductOptions()` for the link dropdown | `lib/server/product.ts` |
| T05 | `processPortfolioUpload()`: private original → sharp resize ≤2400 + blur → public put → dims | `lib/server/portfolio-image.ts` |
| T06 | Portfolio service: gallery CRUD/reorder/publish/delete rules; image add/caption/feature/link/reorder/delete; public reads (`listPortfolioGroups`, `getGalleryPageBySlug`) | `lib/server/portfolio.ts` |
| T07 | Admin actions (each with `requireOperator()`) | `app/admin/(app)/galleries/actions.ts` |
| T08 | Admin list page (tree, ↑/↓, publish toggle, counts) + nav link | `galleries/page.tsx`, `(app)/layout.tsx` |
| T09 | Gallery editor + new/edit pages | `gallery-editor.tsx`, `new/page.tsx`, `[id]/page.tsx` |
| T10 | Image manager: multi-upload queue (3 concurrent, progress, retry), caption rows, featured, product link, ↑/↓, delete | `[id]/image-manager.tsx` |
| T11 | Public `/portfolio`: groups → child gallery cards + "View all"; empty state | `app/[locale]/portfolio/page.tsx`, `gallery-card.tsx` |
| T12 | Public `/portfolio/[slug]`: gallery grid, or a group sectioned by child | `[slug]/page.tsx`, `masonry-grid.tsx`, `caption.tsx` |
| T13 | Lightbox: dialog, focus trap/restore, ←/→/swipe, `Esc`, `?image=`, reduced motion, "View this print" | `components/portfolio/lightbox.tsx` |
| T14 | i18n `Portfolio` keys en + vi | `messages/{en,vi}.json` |
| T15 | Gates via **Windows Node**: `tsc`, `lint`, `build` | — |
| T16 | Runtime walk, with you running `npm run dev`: create a group and child, upload ~5 real photos, caption them, link one to a print, publish; check `/vi` and `/en` portfolio, the lightbox via keyboard only, mobile width, no layout shift, and that the R2 public object is ≤2400 px with no EXIF | — |

- [x] T01 [x] T02 [x] T03 [x] T04 [x] T05 [x] T06 [x] T07 [x] T08 [x] T09 [x] T10 [x] T11 [x] T12 [x] T13 [x] T14 [x] T15 [x] T16

---

## 4. Verification

- **Static gates:** `cmd.exe /c "npx tsc --noEmit && npm run lint && npm run build"` (Windows Node; see memory *run-on-windows-not-wsl*).
- **Static gates:** ✅ tsc · eslint · `npm run build` (Next 16.4.3).
- **Migration:** ✅ `20261102062526_add_portfolio_galleries` applied (`prisma migrate status` up to date).
- **Runtime (headless Chromium vs the dev server, 31 checks, all green after triage):**
  - operator login on the first attempt;
  - create a group and a child gallery;
  - **multi-upload of 6 photos in 14 s**;
  - caption, Featured and print link save;
  - ↑ reorder persists;
  - deleting a non-empty group is blocked with its message;
  - publishing;
  - `/vi` and `/en` portfolio show the group and "View all";
  - the group page has sections;
  - **CLS = 0.0000**;
  - the caption shows both species and the location;
  - alt = "{Species} — {location}";
  - the lightbox is a modal dialog with focus on Close, `?image=`, →/←, Tab trapped, Esc closes and focus returns to the tile, Back closes, and a shared link opens it;
  - "View this print" appears only on the linked image and opens the product;
  - phone width has no horizontal scroll;
  - an unknown slug returns 404;
  - no console errors.
- **R2-live:** ✅
  - public copies are ≤2400 px (2400×2400, 2400×1600, 2400×800, 1600×2400, 1107×738);
  - **no EXIF/GPS** on the public copies;
  - the EXIF orientation-6 photo is stored upright (1600×2400);
  - `Cache-Control: public, max-age=31536000, immutable`.
- **Fixes found by the walk:**
  1. *Lightbox photo was invisible until loaded.* The `w-auto/h-auto` image had no size before load. It's now an aspect-ratio box fitted to the free space, so the blur shows instantly. The backdrop is now opaque.
  2. *Admin sign-in failed on the first attempt (pre-existing, outside 1.6).* `auth()` straight after `signIn()` can't see the new cookie. The role is now checked via `authenticateUser()` **before** `signIn`, so non-operators never get a session (`app/admin/login/actions.ts`).

---

## 5. Dev Agent Record — File List

| File | Created / Modified | Role |
|------|--------------------|------|
| `prisma/schema.prisma` | Modified | `Gallery`, `PortfolioImage`; `Product.portfolioImages` back-relation |
| `prisma/migrations/20261102062526_add_portfolio_galleries/migration.sql` | Created | Additive: 2 tables, 5 indexes, 3 FKs |
| `lib/validation/portfolio-schemas.ts` | Created | `gallerySchema`, `imageDetailsSchema` |
| `lib/server/portfolio.ts` | Created | Gallery/image service: rules D1–D3, D11, D13; admin + public DTOs |
| `lib/server/portfolio-image.ts` | Created | sharp resize ≤2400 + blur; private → public; key-prefix guard |
| `lib/server/product.ts` | Modified | Export `sellableVariantWhere()`; `listProductOptions()` |
| `lib/server/storage.ts` | Modified | `putObject` takes an optional `cacheControl` (immutable portfolio copies) |
| `app/admin/(app)/layout.tsx` | Modified | "Portfolio" nav is now a live link |
| `app/admin/(app)/galleries/actions.ts` | Created | Operator Server Actions (gallery + image) |
| `app/admin/(app)/galleries/page.tsx` | Created | Tree list |
| `app/admin/(app)/galleries/gallery-row-controls.tsx` | Created | ↑/↓, publish, delete (with blocked-delete reason) |
| `app/admin/(app)/galleries/gallery-editor.tsx` | Created | Create/edit form |
| `app/admin/(app)/galleries/new/page.tsx` | Created | New gallery |
| `app/admin/(app)/galleries/[id]/page.tsx` | Created | Edit gallery; image manager or child list; `maxDuration = 60` |
| `app/admin/(app)/galleries/[id]/image-manager.tsx` | Created | Multi-upload queue + caption rows |
| `app/[locale]/portfolio/page.tsx` | Modified | Stub → groups + cards + "View all" |
| `app/[locale]/portfolio/[slug]/page.tsx` | Created | Gallery or group page |
| `components/portfolio/caption.tsx` | Created | Caption/alt rules |
| `components/portfolio/gallery-card.tsx` | Created | Cover card |
| `components/portfolio/gallery-viewer.tsx` | Created | Masonry grid + URL-driven lightbox state |
| `components/portfolio/lightbox.tsx` | Created | Accessible dialog |
| `messages/en.json`, `messages/vi.json` | Modified | `Portfolio` namespace |
| `app/admin/login/actions.ts` | Modified | *(bug fix, not 1.6 scope)* role checked before `signIn`; first-attempt login works |

**Plan deviations:** `masonry-grid.tsx` became `gallery-viewer.tsx` (the grid and lightbox share URL state); there's an extra `gallery-row-controls.tsx`; `coverImageId` was dropped (see §2.2).

**Not in scope (later stories):** Home featured grids + nav reorder → 1.10 · Achievements → 1.9 · About → 1.7 · Contact → 1.8 · drag-and-drop reorder, move image between galleries, EXIF display, per-gallery OG images → backlog.
