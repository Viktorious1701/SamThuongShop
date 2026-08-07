# Story 2.3 — Collections + store settings (shipping fee)

**Epic:** 2 (Product Catalog) · **FR:** FR-20 · **Status:** Done — all gates + runtime green. (Built on branch `checkout-flow` to unblock checkout.)

## Story
As the Operator, I want to group Products into Collections and set a flat shipping fee, so the catalog is organized and checkout can total correctly.

## Decisions
- **Collections ↔ Products = many-to-many** (user choice) — a photo can be in several collections. Implicit Prisma m-n (`_CollectionToProduct`).
- **Shipping fee = `StoreSetting` singleton** (row id `"store"`, `shippingFeeVnd Int`), operator-editable at runtime (the AC requires "I can set" it). Greenfield.
- **Storefront collection filter deferred to Story 2.4** (its dedicated story). 2.3 = schema + admin CRUD + settings only. Admin is English-only.

## Changes
- `prisma/schema.prisma` (migration `add_collections_and_settings`): `Collection` (slug, bilingual name/description, m-n `products`), `Product.collections`, `StoreSetting` singleton.
- `lib/server/collection.ts`: DTOs + list/get/create/update(membership via `set`)/delete, slugify + P2002 (mirrors product service).
- `lib/server/settings.ts`: `getStoreSettings()` (upsert-read singleton), `updateShippingFee()`.
- `lib/validation/collection-schemas.ts`: `collectionSchema` + `shippingFeeSchema` (English messages).
- `app/admin/(app)/collections/`: list `page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx`, `collection-editor.tsx` (client, checkbox product assignment), `actions.ts` (guarded save/delete).
- `app/admin/(app)/settings/`: `page.tsx` (flat-fee form) + `actions.ts`.
- `app/admin/(app)/layout.tsx`: promoted **Collections** + added **Settings** nav links.

## Verification
- **Static:** `tsc`, `eslint`, `build` all green (routes `/admin/collections{,/new,/[id]/edit}` + `/admin/settings`).
- **Migration:** applied to Supabase; `Collection`, `StoreSetting`, `_CollectionToProduct` join exist; client regenerated.
- **Service (script):** create collection with 2 products → membership persists both directions (m-n verified from the Product side); reassign → 1; shipping fee default 0 → set 30000 persists; cleanup.
- **Admin (operator cookie-jar):** `/admin/collections` empty state + New; `/admin/collections/new` renders editor + product checkboxes; `/admin/settings` shows saved fee (30000); nav shows both links; unauth → 307 `/admin/login`.
- **Regression:** cart/storefront/Epic 1 unaffected.

## Not in scope (later)
Storefront browse/filter by Collection (Story 2.4); checkout's use of the shipping fee (Story 3.2, consumes `getStoreSettings().shippingFeeVnd` iff a physical line, AD-8/AD-10).
