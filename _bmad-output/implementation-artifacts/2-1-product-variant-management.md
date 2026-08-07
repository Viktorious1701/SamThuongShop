# Story 2.1 — Manage products and variants

**Epic:** 2 (Product Catalog) · **FR:** FR-19 · **Status:** Done — static gates + R2-live verification all green.

## Story
As the Operator, I want to create and edit Products with their Variants, so that I have items to sell.

## Acceptance Criteria (from epics.md)
1. From the admin shell I can create a Product with name + description in **both Vietnamese and English**, integer **VND** prices, upload display images, and add Variants each of which is a **Physical Print (size)** or a **Digital Download (tier)**.
2. For a Digital Download Variant I upload the **original file to private storage** with a **non-derivable key**.
3. I can **publish/unpublish** a Product (unpublished preserved in admin, hidden from storefront).
4. The **Product / ProductVariant / ProductImage** tables are created by this story.

## Prerequisite — Cloudflare R2 (operator, self-serve)
Two buckets (`samthuong-public`, `samthuong-private`), public access on the public bucket, a CORS policy allowing `PUT`+`GET` from the app origin, and an R2 API token. Values go in `.env`: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_PUBLIC`, `R2_BUCKET_PRIVATE`, `R2_PUBLIC_BASE_URL` (+ optional `R2_ENDPOINT`). Documented in `.env.example`.

## Key design decisions
- **Uploads go browser → R2 via presigned PUT** (`createUploadUrl` issues the URL; the editor `fetch`-PUTs the file; only the object **key** is submitted on save). Rationale: Vercel free-tier caps any server-routed body at ~4.5 MB, and digital originals exceed that. (AD-15, AD-1)
- **Bilingual content is data**, stored per-locale (`nameVi/nameEn`, `descriptionVi/descriptionEn`) on the row, not next-intl keys (AD-7). Admin UI itself is English-only (outside next-intl).
- **Prices are integer VND** everywhere (AD-5). `format` is a Prisma enum `VariantFormat {PRINT|DIGITAL}` — the load-bearing fulfilment discriminator (AD-8).
- **Variant label is operator-defined free text** (OQ-3 stays open — no hardcoded size/tier enum).
- Update replaces variants/images wholesale in a transaction (slug immutable); removed R2 objects are cleaned up best-effort. OrderLine snapshots (AD-11) protect future order history from re-pricing.
- Object keys are **non-derivable** random UUIDs owned by the DB row (AD-15). Only `lib/server/*` touches Prisma/storage (AD-2). Every action re-checks `requireOperator()` (AD-9).

## Tasks
- [x] Schema: `Product`, `ProductVariant` (+ enum `VariantFormat`), `ProductImage` → migration `20260806094815_add_catalog`.
- [x] `lib/server/storage.ts` — R2 S3 client, `presignUpload`, `publicUrl`, `putObject`, `deleteObject`, `randomKey`.
- [x] `lib/server/product.ts` — list/get/create/update/setPublished/delete + DTOs + R2 cleanup.
- [x] `lib/validation/product-schemas.ts` — zod, English messages, variants discriminated on `format`.
- [x] `app/admin/(app)/products/{page,new/page,[id]/edit/page}.tsx` + `actions.ts` + `product-editor.tsx`.
- [x] Shared field components: `textarea-field.tsx`, `select-field.tsx`.
- [x] Promote **Products** nav link; `next.config.ts` `images.remotePatterns` from `R2_PUBLIC_BASE_URL`.
- [x] Deps: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`.
- [x] Idempotent demo seed (`lib/server/seed-catalog.ts`, wired into `prisma/seed.ts`, guarded on R2 config).
- [x] **R2-live verification**: seed uploaded to both buckets + created 3 demo products; public image GET 200 (image/jpeg); presigned public PUT+GET 200; presigned private PUT 200 (no public URL); admin list renders 3 products with next/image optimizer 200.

## Dev Agent Record

### Files
New: `lib/server/storage.ts`, `lib/server/product.ts`, `lib/server/seed-catalog.ts`, `lib/validation/product-schemas.ts`, `app/admin/(app)/products/{page.tsx,new/page.tsx,[id]/edit/page.tsx,actions.ts,product-editor.tsx}`, `components/form/{textarea-field.tsx,select-field.tsx}`.
Edited: `prisma/schema.prisma` (+ migration), `prisma/seed.ts`, `app/admin/(app)/layout.tsx`, `next.config.ts`, `package.json`/lock, `.env.example`.

### Verification
- **Green:** `npx tsc --noEmit`, `npx eslint .`, `npm run build` (route table shows `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, all un-prefixed).
- **Migration** `20260806094815_add_catalog` applied to Supabase; Prisma client regenerated.
- **Guard:** unauthenticated `/admin/products*` → 307 → `/admin/login`.
- **Pending (needs R2 creds):** `npm run db:seed` uploads demo objects + creates 3 demo products; operator cookie-jar CRUD (create with PRINT+DIGITAL variants, image + original upload, edit, publish/unpublish, delete); confirm original lands in the **private** bucket with a non-derivable key; browser presigned PUT succeeds (CORS).

## Not in scope (later stories)
Watermarked preview + `sharp` (2.2); Collections + shipping fee (2.3); storefront browse/detail (2.4); download delivery (Epic 3); payments.
