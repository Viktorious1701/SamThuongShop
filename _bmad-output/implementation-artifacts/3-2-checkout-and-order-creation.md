# Story 3.2 — Checkout details + order summary + Order creation

**Epic:** 3 · **FRs:** FR-5, FR-6, FR-7 (+ FR-10 order/reference) · **Status:** Done — all gates + runtime green. Branch `checkout-flow`.

## Story
Enter details, see server-computed totals, and on submit create the first **Order**. The Order aggregate is born here (`Order`/`OrderLine` tables).

## Scope
Checkout + order creation **only**. Order is created at **`PENDING_PAYMENT`**, cart cleared, redirect to a summary with a "payment next" placeholder. **Not** in 3.2: payment/payОS (3.3), COD (3.4), confirmation email + status pill + email-gated guest lookup (3.5), downloads (3.6), `Payment` model, account-creation-during-checkout.

## Key rules honored
- **AD-10:** decomposed integer-VND `subtotal/shipping/discount/grandTotal`, **recomputed server-side** in the order service — client total never trusted.
- **AD-8:** shipping applies iff any physical line; digital-only skips the address form + fee (0); digital qty pinned to 1.
- **AD-11:** each OrderLine snapshots `productName` (buyer locale), `format`, `unitPriceVnd`, `qty`, `lineTotalVnd`; `variantId` is a **soft FK (SetNull)** so deleting a variant never destroys order history.
- **AD-3:** status machine begins at `PENDING_PAYMENT`. **AD-14:** `customerEmail` stored + high-entropy `reference` for future guest lookup.

## Changes
- `prisma/schema.prisma` (migration `add_orders`): `OrderStatus` enum; `Order` (reference unique, status, locale, customerEmail, userId? SetNull, decomposed money, nullable shipping); `OrderLine` (soft `variantId` SetNull, snapshots); back-relations `User.orders`, `ProductVariant.orderLines`.
- `lib/server/order.ts`: `createOrder` (recompute + snapshot + unambiguous 8-char reference w/ retry + `$transaction`), `getOrderByReference`.
- `lib/validation/checkout-schemas.ts`: `checkoutSchema` (translation-key messages); shipping enforced by the action only when physical.
- `lib/server/cart.ts`: `getCartItems()`.
- `app/[locale]/checkout/{page,checkout-form,actions}.tsx`: summary + details form (`useActionState`); `placeOrder` (auth guest/account, validate, create, `clearCart`, redirect).
- `app/[locale]/order/[reference]/page.tsx`: summary + status + payment-next placeholder + calm not-found.
- `app/[locale]/cart/page.tsx`: enabled the real Checkout link.
- `messages/en.json` + `vi.json`: `Checkout` namespace.

## Verification
- **Static:** tsc, eslint, build green.
- **Service (script):** physical qty2 → PENDING_PAYMENT, 900k+30k=930k, line qty2; digital-only → qty pinned 1, shipping 0, no address; mixed → shipping once (600k+30k=630k); physical w/o shipping → rejected `shipping-required`; **soft FK: OrderLine survives variant delete with `variantId=null` and snapshot intact**.
- **Runtime (cookie-jar):** `/vi/checkout` physical shows address form (`name="shipName"` present) + shipping fee; digital-only omits the address input (`shipName` count 0) + shows "Miễn phí"; empty cart → 307 `/vi/cart`; `/vi/order/TYSEBLJ2` → summary with 930.000₫ + "Chờ thanh toán" + "Tiếp theo: thanh toán"; unknown reference → calm not-found (200). Test order cleaned up.
- Bilingual (`vi`/`en`).

## Not in scope (later)
Payment (3.3 payОS / 3.4 COD), confirmation email + status pill + guest lookup (3.5), digital delivery (3.6/3.7).
