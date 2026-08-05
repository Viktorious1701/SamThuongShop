---
name: 'SamThuongShop — Adversarial Architecture Review'
type: architecture-review
reviews: ./ARCHITECTURE-SPINE.md
created: '2026-08-04'
method: 'two-units-one-level-down incompatibility construction'
---

# Adversarial Review — SamThuongShop Architecture Spine

**Method.** For each finding I construct two units built one level below the spine, each obeying *every* AD to the letter, that still integrate incompatibly. Each surviving incompatibility is a missing or too-loose AD. Judged as a lean solo-built launch system — no enterprise demands.

**Verdict.** The layering, auth, money-unit, and payment-verification invariants are solid. But the spine leaves the **Order money model, the mixed physical+digital fulfillment split, purchase-time snapshotting, and webhook/transition concurrency** under-specified. These are exactly the seams where two independently-built units will diverge. 4 Critical, 4 High, 3 Medium below.

---

## CRITICAL

### C1 — Order money decomposition and shipping placement are undefined; "authoritative total" has no single owner
**AD-5** fixes integer VND and the convention says "recompute price from the DB," but nothing fixes the *shape* of an Order's money: is there `subtotal`, `shippingFee`, `discount`, `total` — and which field is the amount sent to payOS?

**Two units, both compliant, incompatible:**
- *Checkout/order service* builds the Order storing only line unit-prices and computes total on the fly; it models the flat shipping fee (AD-8, Deferred Q2) as an **OrderLine** with no Variant.
- *Payment service* (behind the `PaymentProvider` interface, AD-4) reads `order.total` to mint the payОС amount.

Clash 1: the order service's shipping-as-OrderLine **violates the ER cardinality** `OrderLine }o--|| Variant` (every line must reference a Variant). Clash 2: the payment service expects a materialized `order.total` that includes shipping; the order service never persisted one → payOS is charged the subtotal, buyer underpays, or the two compute shipping at different moments (cart vs webhook time) and disagree. Neither unit broke an AD.

**Fix — new AD-10 (Order money is a persisted, decomposed snapshot).** The Order persists integer-VND `subtotal`, `shippingFee`, `discountTotal`, `grandTotal` (VAT excluded for v1 — state this explicitly). `grandTotal` is the **sole** amount handed to any `PaymentProvider`. Shipping is an **Order-level field, never an OrderLine** (keeps the Variant FK total). The order service is the only writer of these fields; they are computed once at order creation from DB prices and frozen (see C2).

### C2 — OrderLine live-references the Variant; there is no purchase-time snapshot of price or bilingual name
The ER models `OrderLine }o--|| Variant` as a **live FK**, and AD-7 stores name/label per-locale *on the Variant/Product*. No AD requires the OrderLine to snapshot anything.

**Two units, both compliant, incompatible:**
- *Checkout service* writes an OrderLine holding only `variantId` + `quantity` (price "recomputed from DB" per the convention — satisfied).
- *Order-history / invoice / confirmation-email renderer* reads the OrderLine and **joins live to Variant** for name and price.

The operator then edits a Variant's price or renames the Product (an everyday admin action, AD-9). Every historical order silently re-prices and re-labels; the invoice no longer matches what payOS charged; an EN buyer whose order rendered from the `vi` fallback now shows different text. Both units obeyed every AD; the Order is simply not immutable. This is the **order/price-snapshot dimension the spine is entirely silent on** — a whole structural concern at this altitude.

**Fix — extend AD-3 / new AD-11 (Orders are immutable purchase snapshots).** At creation, each OrderLine snapshots `unitPriceVnd`, `variantFormat` (physical/digital), and the **display name/label for the locale the buyer purchased in** (plus SKU/variant key). Post-creation reads MUST use the snapshot, never a live Variant join. Variant edits never mutate placed orders.

### C3 — The single linear status machine cannot represent a mixed physical+digital order; AD-3 and AD-6 directly conflict for it
**AD-3** defines *one* linear status on the Order (Pending→Paid→Processing→Shipped→Completed | Cancelled) and says a **digital-only** order goes to *Completed* when its link is issued. **AD-8** allows one Order to contain both formats. **AD-6** says the download link is minted "after the Order is *Paid*."

**Two units, both compliant, incompatible, on a mixed order:**
- *Order service (fulfillment)* follows the physical track: Paid → Processing → Shipped → Completed, issuing the DownloadGrant only at *Completed* (reading AD-3's "digital → Completed on link issue").
- *Digital-delivery unit* follows AD-6 literally and mints the grant/link at *Paid*.

So for the mixed order the buyer either gets the digital file weeks late (waits for the print to ship) or the two units issue grants at different transitions and fire duplicate delivery. The single status field **physically cannot** encode "digital delivered, physical still processing." AD-3 says nothing about mixed timing; AD-6 says Paid; they contradict. Additionally **partial cancellation is unrepresentable**: a made-to-order print the operator cannot fulfill, on an order whose digital half is already downloaded — one `Order.status` cannot be both *Cancelled* and *Completed*, and there is no refund/partial path.

**Fix — new AD-12 (Fulfillment is tracked per line-group, not per Order).** Digital lines and physical lines carry independent fulfillment state. On *Paid*, digital DownloadGrants issue immediately (aligning AD-6). The Order's headline status reflects the **physical** track (digital-only orders shortcut to *Completed*). Add per-group *Cancelled/Refunded* states and a rule that cancelling a physical group after Paid triggers a partial refund of that group's line total + `shippingFee` (see C1) via the `PaymentProvider`, leaving delivered digital lines intact.

### C4 — payOS webhook has no idempotency or ordering rule → duplicate/out-of-order webhooks double-fulfill
**AD-4** requires a signature-verified webhook to reach *Paid*; **AD-3** says transitions happen in the order service. Neither says the webhook path is idempotent or how out-of-order events are handled. payOS (like any gateway) can retry, replay, and deliver events out of order.

**Two units, both compliant, incompatible:**
- *Webhook Route Handler* verifies the signature and calls `orderService.markPaid(orderId)` on **every** delivery.
- *Order service `markPaid`* transitions to Paid and, per AD-6/AD-3, issues DownloadGrants and sends the Resend confirmation — assuming it is called once.

A retried webhook → a **second** presigned grant and a **duplicate** confirmation email (double fulfillment, and for digital a second downloadable link — the exact leak AD-6 exists to prevent). A late "expired/cancelled" event arriving after "paid" could flip a Paid order back. Both units honored every AD.

**Fix — new AD-13 (Idempotent, keyed payment events).** The `Payment` entity carries a **unique** payОС transaction/order reference; the webhook handler upserts on that key inside one DB transaction and treats a re-seen key as a no-op. State transitions are **monotonic** — a terminal/Paid order ignores lower-precedence events. Grant issuance and email dispatch are keyed so they fire at most once per (order, event).

---

## HIGH

### H1 — Concurrent transitions are not guarded: an operator cancel racing the webhook is a lost update
**AD-3** localizes transitions to the order service but mandates no concurrency control. Scenario: operator clicks **Cancel** (Pending→Cancelled) in the admin Server Action at the same instant the **payОС webhook** posts (Pending→Paid). Two units, both routing through the order service, read status = Pending, both write. Result: money captured but order shows *Cancelled* (no fulfillment, buyer paid), or *Paid* overwriting an intended cancel. Same class: two admin tabs both marking *Shipped*.

**Fix — new AD-14 (Guarded, atomic transitions).** Every status change is a single DB transaction performing a **compare-and-set on the expected current status** (optimistic version or `WHERE status = :expected`); a failed CAS returns a typed conflict error, never a silent overwrite. Precedence rule: a verified *Paid* event always wins over a concurrent cancel (cancel-after-Paid must go through the refund path, C3).

### H2 — DownloadGrant model is ambiguous: one-shot token vs durable entitlement, re-download limits, guest identity
**AD-6** specifies a "short-lived presigned URL," and FR-14/15 require **re-download** (incl. guest). But the spine never says whether a `DownloadGrant` is a *consumable one-shot* or a *durable entitlement* re-mintable on demand, nor any download-count/expiry-window on the grant itself, nor how a **guest** (no Customer) re-authenticates for re-download.

**Two units, both compliant, incompatible:**
- *Download Route Handler* treats the grant as consumed: mints the URL once, marks it used.
- *Account/guest re-download page* treats the grant as durable and re-mints anytime.

The first breaks re-download; or the second, if the handler enforces single-use, always fails. And guest re-download has no defined credential.

**Fix — tighten AD-6 / new AD-15 (Entitlement = durable grant, URL = ephemeral).** A `DownloadGrant` is a **durable entitlement** (per Order+Variant) that mints a fresh short-lived presigned URL on each authorized request, subject to an explicit policy: expiry window and/or max re-download count (state the v1 values). Authorization = logged-in owning Customer, **or** guest presenting **order code + purchaser email** (never code alone — see H3).

### H3 — Guest lookup / re-download keyed on a short order code alone is an enumerable entitlement bypass
The convention makes the human-facing Order reference "a short uppercase code (used for guest lookup, FR-10)." If guest order lookup **and** guest re-download (H2) are gated by that code alone, short codes are guessable/enumerable → an attacker reads strangers' orders (PII, addresses) and, worse, redeems their **digital downloads** — defeating AD-6. Two units: the *code generator* (optimizing for short/human-friendly) and the *guest-lookup handler* (trusting the code as the sole secret) each comply, and together open the door.

**Fix — new AD-16 (Two-factor guest access + code entropy).** Guest order lookup and re-download require **order code + the purchaser's email**. The code is not a bearer secret; it needs sufficient entropy and rate-limited attempts. (Ties the "webhook-security / entitlement" dimension closed on the download side.)

### H4 — Watermark-preview vs original: bucket placement, object-key ownership, and pathing are unspecified
**AD-6** says originals live private and the watermarked preview is "a separate derivative generated at upload," but not **where the preview lives** (public CDN bucket vs private+presigned) nor **who owns the Variant→original-key and Variant→preview-key mapping**.

**Two units, both compliant, incompatible:**
- *Upload/storage service* writes `original.jpg` and a derived `original-wm.jpg` **in the same private bucket**, expecting the storefront to presign previews too.
- *Storefront rendering unit* expects preview URLs it can emit publicly (a public bucket / stable CDN path).

Previews then either fail to render or are served from a location the other unit never populated. And if the preview key is derived from the original key by a **public rule** (`original` → `original-wm`), a public/predictable preview path lets an attacker infer/enumerate original keys — reintroducing the "guessable asset URL" AD-6 forbids.

**Fix — new AD-17 (Storage pathing + key ownership).** Fix the two-bucket model: originals in the private bucket (presigned only), watermarked previews in a **separately-namespaced** public-safe location with **non-derivable** keys. The Variant record is the single owner of both object keys (stored, not derived by convention); no code reconstructs one key from the other.

---

## MEDIUM

### M1 — Guest→account order linking is undefined
A guest checkout creates an Order with a null Customer + email (`Customer |o--o{ Order` is optional). If that email later registers an account, the *checkout unit* (writes null customerId) and the *account order-history unit* (queries by customerId) never reconcile — past purchases and their download entitlements are invisible in the account. **Fix:** define claim-on-registration (or on login) that links prior guest Orders by verified email; state whether entitlements transfer.

### M2 — COD / bank-transfer "Paid" semantics and Payment record are under-specified
AD-3 enters COD at *Processing* (skipping *Paid*); AD-4 says operator confirmation marks bank-transfer/COD paid. It's unclear whether a COD Order ever gets a `Payment` row / paid-timestamp, and what the operator-confirmation transition is for offline bank transfer. **Fix:** specify that non-gateway payments create a `Payment` record via an operator action with an audit timestamp, and define the confirm→Paid/Processing transition explicitly.

### M3 — Operator bootstrap and seed/migration strategy are silent
Auth.js email/password with a single privileged **Operator** (AD-9), but no self-signup for operator — the spine never says how the first operator account is seeded, nor the seed/migration approach for bilingual reference content. Deferred covers backups but not initial data. **Fix:** define an operator-bootstrap seed (env-driven, one-time) and a Prisma seed/migration convention for per-locale content, so environments provision identically.

---

## Dimensions checked and found adequately covered
- Layering / dependency direction (AD-1, AD-2) — tight.
- Money unit (AD-5) — solid, but decomposition was the gap (C1).
- Payment verification & provider abstraction (AD-4) — solid; idempotency was the gap (C4).
- Secrets/config (convention) — env-var rule is sufficient for this altitude.
- i18n content model (AD-7) — fine for live content; the gap was the *purchase-time snapshot* (C2).
