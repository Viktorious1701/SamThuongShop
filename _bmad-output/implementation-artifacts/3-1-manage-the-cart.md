# Story 3.1 — Manage the cart

**Epic:** 3 (Cart, Checkout, Payment & Delivery) · **FR:** FR-4 · **Status:** Done — all gates + runtime green.

## Story
As a customer, I want to add/adjust/remove items in a cart so I can assemble an order. Cart shows each line (thumbnail, name, variant, unit price, line total) + running VND total; digital lines fixed at qty 1; removing the last line shows the empty state.

## Key design decision — cart persistence
Specs are silent on cart storage, so: **cookie-based server cart**. An httpOnly cookie holds only `[{ v: variantId, q: qty }]`; the server **recomputes** every price/name/format/total from the DB on read (AD-10 — never trust the client). Works for guests (FR-5), survives refresh, SSR-readable (cart page + nav badge), and needs **no `Cart` DB model** (the Order remains the first persisted entity, created in Story 3.2). Mutations happen only in Server Actions (AD-1; Next 16 restriction). Digital qty is re-forced to 1 server-side (AD-8), so a tampered cookie can't buy multiples.

## Changes
- `lib/server/product.ts` — added `id` to `StorefrontVariant`; new `getVariantsByIds(ids)` (published-only, server-authoritative, drops unpublished/missing; public image only, no private fields).
- `lib/server/cart.ts` (new) — cookie read/write (`await cookies()`, httpOnly, 30d, item/qty caps); `resolveCart(locale)` (lines + subtotal + count, digital qty→1, drops unpublished); `getCartCount()` (lightweight badge).
- `app/[locale]/cart/actions.ts` (new) — `addToCartAction`, `setQtyAction`, `removeLineAction`.
- `app/[locale]/cart/page.tsx` (new) — bilingual cart: line items, qty +/- and remove as server-action forms (work without JS), digital qty disabled + note, subtotal, empty state, disabled "Checkout" placeholder (3.2).
- `app/[locale]/shop/[slug]/variant-selector.tsx` — real Add-to-cart (calls `addToCartAction`, inline "Added ✓ · View cart", `router.refresh()` for the nav badge).
- `components/site-nav.tsx` — cart icon now links to `/cart` with a live count badge.
- `messages/en.json` + `vi.json` — new `Cart` namespace.

## Verification
- **Static:** `tsc`, `eslint`, `build` all green.
- **Service:** `getVariantsByIds([print, digital, bogus])` → 2 rows (bogus dropped), no private fields.
- **Runtime (crafted cookie print q3 + digital q5):** `/vi/cart` shows print line 1.350.000₫, digital forced to qty 1 (150.000₫ + "Số lượng cố định là 1"), **subtotal 1.500.000₫** (proves digital qty coerced server-side); `/en/cart` English; empty-cart state with no cookie; nav badge shows 8. Cart survives refresh (cookie).
- **Regression:** Epic 1/2 routes intact; storefront unchanged except add-to-cart now active.

## Environment note
While verifying, `tsx`/`esbuild` failed under WSL because a Windows-side `npm install` had swapped in the `win32-x64` native binary; restored `@esbuild/linux-x64`. Same cross-platform hazard as `sharp`. Recommend moving the repo to the WSL-native filesystem to end this (and the slow dev compiles on `/mnt/d`).

## Not in scope (later)
Checkout + Order/OrderLine creation + shipping/address (Story 3.2, needs Story 2.3's flat fee); payment (3.3/3.4); confirmation/email (3.5); digital delivery (3.6/3.7).
