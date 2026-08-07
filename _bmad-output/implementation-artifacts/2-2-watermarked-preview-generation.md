# Story 2.2 — Watermarked preview generation

**Epic:** 2 (Product Catalog) · **Refs:** AR-7, NFR-4, R-2 spike · **Status:** Done — all gates green.

## Story
When a Digital Download original is uploaded, generate a watermarked, downsized **preview** stored publicly, so the storefront can show the image without exposing the sellable original before purchase (AD-6).

## Decisions
- Watermark: **tiled diagonal** repeated wordmark, **"© Sâm Thương"**, low opacity (~0.30 white + thin dark stroke for legibility), ~−35°.
- Preview downsized to **≤1600px** longest edge, JPEG q80.
- No migration — `ProductVariant.previewKey` already existed from Story 2.1.

## Mechanism
Original lives in **private** R2. On upload the server: `getObject` (private) → `sharp` rotate(EXIF) + resize(inside 1600) + composite tiled watermark SVG + jpeg(80) → `putObject` to **public** with a non-derivable key → `previewKey` saved on the variant. Runs server-side (R2→server download is not subject to Vercel's 4.5 MB client-upload cap; sharp on a typical photo is well within free-tier limits).

## Changes
- `package.json` — `sharp` added as explicit dependency (was only bundled via Next).
- `lib/server/storage.ts` — new `getObject({scope,key}) → Buffer`.
- `lib/server/watermark.ts` (new) — `generateWatermarkedPreview(originalKey) → previewKey`.
- `app/admin/(app)/products/actions.ts` — `generatePreviewAction(originalKey)` (guarded).
- `lib/validation/product-schemas.ts` — `previewKey` optional on the DIGITAL variant.
- `lib/server/product.ts` — persist `previewKey`; return `previewKey` + `previewUrl` in DTO; include preview keys in **public** orphan cleanup on update/delete.
- `app/admin/(app)/products/product-editor.tsx` — auto-generate preview after original upload; show the watermarked thumbnail; submit `previewKey`.
- `lib/server/seed-catalog.ts` — generate previews for demo digital variants.

## Verification
- **Static:** `tsc`, `eslint`, `build` all green.
- **Unit path:** `generateWatermarkedPreview` on a seeded original → `previews/…jpg`; public GET 200 image/jpeg, **1600×1067, 62 KB** (downsized, ≤1600px). ✅
- **Seed/cleanup:** deleted 3 demo products (public+private+preview cleanup ran), re-seeded → all 3 digital variants have `previewKey` SET; demo preview GET 200. ✅
- **App:** operator `/admin/products` lists all 3 products on the running server (service returns `previewUrl`). ✅
- **Guard:** admin routes still redirect unauth (unchanged from 2.1).

## Not in scope (later)
Storefront rendering of previews (2.4); original download/delivery (Epic 3); collections + shipping (2.3).
