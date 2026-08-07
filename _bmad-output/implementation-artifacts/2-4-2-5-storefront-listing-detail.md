# Stories 2.4 + 2.5 — Storefront: product listing + product detail

**Epic:** 2 (Product Catalog) · **FRs:** FR-1 (2.4), FR-2/FR-15 (2.5) · **Status:** Done — all gates + runtime green.

## Stories
- **2.4 Browse catalog:** shoppers see published Products as cards in the airy editorial grid.
- **2.5 Product detail:** variant selector (print sizes / digital tiers), price updates per variant, images, description, watermarked preview for digital, "Made to order" for print, personal-use License; bilingual with VN fallback.

## Scope (locked with user)
Listing + detail **now**. **Deferred:** Collection grouping/filter (Story 2.3) and the search box (Story 2.6). Included cheaply: the calm "unavailable" state for missing/unpublished products (part of 2.6).

## Key design points
- Storefront is **bilingual** server components (`getTranslations`/`getLocale`), locale-prefixed, VN fallback (AD-7). Prices integer VND (AD-5).
- **Client-safe reads** — new `listPublishedProducts` / `getPublishedProductBySlug` return published-only DTOs that **never expose** `originalKey`/`originalFilename`/`contentType` (AD-6/AD-15); only the public `previewUrl` reaches the client.
- Variant selection is client-side (updates displayed price + fulfilment note); add-to-cart is a **disabled placeholder** (cart is Epic 3).

## Changes
- `lib/server/product.ts` — add `listPublishedProducts()` (cards: `fromPriceVnd` = min variant, `formats` = PRINT/DIGITAL/BOTH) and `getPublishedProductBySlug()` (client-safe detail). New DTOs `StorefrontCard`/`StorefrontProduct`/`StorefrontVariant`.
- `lib/format.ts` (new) — `formatVnd` (`980.000₫`), `pickLocalized` (VN fallback).
- `components/product-card.tsx` (new) — presentational card; whole card links to `/shop/[slug]`.
- `app/[locale]/shop/page.tsx` — replaced stub with the responsive grid (1→4 cols).
- `app/[locale]/shop/[slug]/page.tsx` (new) — two-column detail; calm unavailable state for null.
- `app/[locale]/shop/[slug]/variant-selector.tsx` (new, client) — chip groups, price update, made-to-order / license / watermarked preview, disabled add-to-cart.
- `messages/en.json` + `messages/vi.json` — new `Shop` + `Product` namespaces.

## Verification
- **Static:** `tsc`, `eslint`, `build` all green; route table shows `/[locale]/shop` + `/[locale]/shop/[slug]`.
- **Reads (script):** 3 published cards, `fromPriceVnd` = min, `formats` = BOTH; detail DTO JSON contains **no** private original fields (PASS); unknown slug → null.
- **Runtime:** `/vi/shop` + `/en/shop` render 3 localized cards with VND from-price + type tag; `/vi/shop/demo-common-kingfisher` shows variants (A3 450.000₫ / Web tier 150.000₫), made-to-order note, watermark badge, **no `originalKey` in markup**; `/vi/shop/nope-nope` → calm 200 unavailable state (not 404).
- **Regression:** `/vi`,`/en`,`/styleguide` 200; `/vi/account`,`/admin` guard-redirect; `/api/health` ok; admin CRUD unaffected.

## Not in scope (later)
Collection grouping/filter (2.3); search box (2.6); cart/add-to-cart + checkout + payments (Epic 3).
