# Story 3.4: Cash on Delivery (+ minimal operator order loop, Epic 4.1/4.2)

> **Epic:** 3 (+4) · **FR:** FR-8 (COD), FR-21 (view orders), FR-11 (advance status) · **AD:** AD-8, AD-10 (+ AD-2, AD-5, AD-7) · **Status:** Done — static gates green (tsc/eslint/build); runtime walkthrough pending · **Branch:** `cod-and-orders` (suggested) · **Commit:** _pending_
> **Source story:** `_bmad-output/planning-artifacts/epics.md` → Story 3.4, 4.1, 4.2 · **Impl artifact:** this file

**As a** customer buying a print, **I want** to pay cash on delivery, **so that** I don't need to pay online — **and as** the operator, **I want** to see orders and move them through fulfilment, **so that** COD orders don't get stuck.

COD is the first *real* payment path (payOS/3.3 is blocked on registration). No money flows through the app: the courier collects cash on delivery and remits it to the operator, who marks the order **Paid**. This story adds the customer COD choice **and** the minimum operator loop (view + advance + mark paid) so the physical-print flow works end-to-end.

---

## 1. Gaps & Decisions (Resolved)

| ID | Area | Decision | Status |
|----|------|----------|--------|
| D1 | Fulfilment | COD **skips `PENDING_PAYMENT`** — order enters at `PROCESSING` (payment guaranteed on delivery). Online/VIETQR still enters at `PENDING_PAYMENT`. | ✅ Resolved |
| D2 | Scope | COD offered **only for prints-only carts** (AD-8). Hidden + bilingual reason when any digital line is present; server re-guards (`cod-not-allowed`). | ✅ Resolved |
| D3 | Money | **No money moves through the app.** `isPaid`/`paidAt` are bookkeeping only; the operator flips them on cash receipt. | ✅ Resolved |
| D4 | Concurrency | Status transitions use **atomic compare-and-set** on the expected status (`updateMany where {id,status}`); a stale/duplicate submit updates 0 rows → `stale-status`, never regresses state (AC 4.2). | ✅ Resolved |
| D5 | Payment confirm | Marking a still-pending (VIETQR) order paid also moves it `PENDING_PAYMENT → PAID`; a COD order (already PROCESSING) just flips the flag. | ✅ Resolved |
| D6 | Scope cut | Deferred: payOS/3.3, cancel/4.3, digital DownloadGrants, Resend email. Existing `PENDING_PAYMENT` orders unaffected. | ✅ Resolved |

---

## 2. Architecture

### 2.1 Source-tree layout

```text
prisma/
├── schema.prisma                                          # (mod) enum PaymentMethod; Order.paymentMethod/isPaid/paidAt/trackingNote
└── migrations/20260810063231_add_payment_method_cod/      # (new) migration

lib/
├── server/order.ts                                        # (mod) COD branch in createOrder; listOrders, getOrderForAdmin,
│                                                          #       advanceOrderStatus, recordShipment, markOrderPaid
└── validation/checkout-schemas.ts                         # (mod) + paymentMethod enum

app/[locale]/
├── checkout/page.tsx                                      # (mod) compute canCod, pass to form
├── checkout/checkout-form.tsx                             # (mod) payment-method radio + digital note
├── checkout/actions.ts                                    # (mod) read/validate paymentMethod → createOrder
└── order/[reference]/page.tsx                             # (mod) status pill + COD confirmation copy

app/admin/(app)/
├── layout.tsx                                             # (mod) Orders nav link now live
└── orders/
    ├── page.tsx                                           # (new) operator order list (4.1)
    ├── [reference]/page.tsx                               # (new) order detail + fulfilment controls (4.1/4.2)
    └── actions.ts                                         # (new) advanceStatus / recordShipment / markPaid actions

components/order-status-pill.tsx                           # (new) status pill (label + colored dot) + EN label map
messages/{en,vi}.json                                     # (mod) Checkout payment keys
```

Reused unchanged: `getVariantsByIds`, `getStoreSettings`, `requireOperator`, `formatVnd`, `pickLocalized`, the `getOrderByReference` DTO (extended).

### 2.2 Data model

| Model / Enum | Table | Key fields | Notes |
|--------------|-------|------------|-------|
| `PaymentMethod` | — (enum) | `COD VIETQR` | Discriminates settlement path. |
| `Order` (extended) | `Order` | `paymentMethod PaymentMethod @default(VIETQR)`, `isPaid Boolean @default(false)`, `paidAt DateTime?`, `trackingNote String?` | Additive columns (existing rows default to VIETQR/unpaid). Money still integer VND (AD-5). |

Migration: `prisma/migrations/20260810063231_add_payment_method_cod/`.

### 2.3 Layer responsibilities

| Layer | Owns (for this story) | File(s) |
|-------|-----------------------|---------|
| RSC page (storefront) | compute `canCod`, render method choice + summary | `checkout/page.tsx`, `order/[reference]/page.tsx` |
| RSC page (admin) | list/detail render; offer only the legal next transition | `admin/(app)/orders/{page,[reference]/page}.tsx` |
| Server Action (storefront) | validate + pass `paymentMethod`; server-truth `canCod` | `checkout/actions.ts` |
| Server Action (admin) | `requireOperator()` → delegate → `revalidatePath` | `admin/(app)/orders/actions.ts` |
| `lib/server/order.ts` | **all money/status logic + guarded compare-and-set** | `lib/server/order.ts` |

### 2.4 Business rules & invariants

| Rule | Source | Enforced in |
|------|--------|-------------|
| COD only on prints-only carts | AD-8 / AC 3.4 | `createOrder` (`cod-not-allowed`) + `placeOrder` server-truth `canCod` |
| COD → `PROCESSING`; VIETQR → `PENDING_PAYMENT` | AC 3.4 | `createOrder` (`status` by method) |
| Money recomputed from DB; client total never trusted | AD-10 | `createOrder` |
| Status advances forward-only, one legal step | AC 4.2 | `NEXT_STATUS` map in `order.ts` |
| Transitions atomic; no regress on stale/duplicate | AC 4.2 | `updateMany where {id, status: expected}` → `stale-status` |
| Mark-paid idempotent | AC 4.2 | `markOrderPaid` compare-and-set on `isPaid:false` |
| Only `lib/server` touches Prisma | AD-2 | all reads/writes in `order.ts`; actions delegate |

### 2.5 Sequence diagram

```mermaid
sequenceDiagram
    actor Cust as Customer
    participant Form as checkout-form (client)
    participant Act as placeOrder (action)
    participant Ord as lib/server/order.ts
    participant DB as Prisma / DB
    actor Op as Operator
    participant Adm as admin/orders (action)

    Note over Cust,DB: Place COD order
    Cust->>Form: choose COD (prints-only) + submit
    Form->>Act: placeOrder(FormData)
    Act->>Act: server-truth canCod; paymentMethod=COD
    Act->>Ord: createOrder({..., paymentMethod:"COD"})
    Ord->>Ord: reject if hasDigital (cod-not-allowed)
    Ord->>DB: order.create @ PROCESSING, isPaid=false
    DB-->>Ord: { reference }
    Act-->>Cust: redirect /order/REF (COD copy)

    Note over Op,DB: Fulfil
    Op->>Adm: Mark shipped (PROCESSING→SHIPPED) + note
    Adm->>Ord: recordShipment(id) [compare-and-set]
    Ord->>DB: updateMany where status=PROCESSING
    Op->>Adm: Mark paid (cash received)
    Adm->>Ord: markOrderPaid(id) [isPaid:false→true]
    Op->>Adm: Mark completed (SHIPPED→COMPLETED)
    Adm->>Ord: advanceOrderStatus(id, SHIPPED)
```

### 2.6 Result / error flows

| Scenario | Outcome | Where |
|----------|---------|-------|
| COD picked on a digital/mixed cart (tampered) | `createOrder` → `{ok:false,"cod-not-allowed"}` → `formError:"genericError"` | `order.ts`, `checkout/actions.ts` |
| Stale/duplicate status advance | `{ok:false,"stale-status"}` (0 rows updated) | `advanceOrderStatus` / `recordShipment` |
| Mark paid twice | `{ok:false,"already-paid"}` | `markOrderPaid` |
| Unknown reference (admin) | `notFound()` | `admin/(app)/orders/[reference]/page.tsx` |
| Success (customer) | `redirect(/order/REF)` | `placeOrder` |
| Success (operator) | `revalidatePath("/admin/orders" + detail)` | `orders/actions.ts` |

### 2.7 Convention compliance (AD / AR)

| Rule | Status | Note |
|------|--------|------|
| AD-2 — only `lib/server` imports Prisma | ✅ | All new DB access in `order.ts`; admin actions delegate. |
| AD-5 — integer VND | ✅ | No money math changed; totals still recomputed as `Int`. |
| AD-7 — per-locale content | ✅ | New Checkout keys in en+vi; admin literal English (project convention). |
| AD-8 — variant format drives fulfilment | ✅ | `canCod = hasPhysical && !hasDigital`, enforced client + server. |
| AD-10 — recompute money server-side | ✅ | `createOrder` unchanged in its recompute; COD only changes status. |

### 2.8 Components & i18n keys

| Component | Kind | File |
|-----------|------|------|
| `OrderStatusPill` (+ `ORDER_STATUS_LABEL_EN`) | server | `components/order-status-pill.tsx` |
| Payment-method radios | client (in form) | `checkout/checkout-form.tsx` |

**i18n `Checkout`** added (en + vi): `paymentHeading`, `methodCod`, `methodCodHint`, `methodVietqr`, `methodVietqrHint`, `codUnavailableDigital`, `codPlacedTitle`, `codPlacedBody`.

---

## 3. Tasks (checklist)

| ID | Task | File | Done |
|----|------|------|------|
| T01 | Schema + migration + generate | `prisma/*` | [x] |
| T02 | `createOrder` COD branch + operator fns | `lib/server/order.ts` | [x] |
| T03 | `checkoutSchema` paymentMethod | `lib/validation/checkout-schemas.ts` | [x] |
| T04 | Checkout page/form method choice | `checkout/{page,checkout-form}.tsx` | [x] |
| T05 | `placeOrder` pass method | `checkout/actions.ts` | [x] |
| T06 | Confirmation COD copy + pill | `order/[reference]/page.tsx` | [x] |
| T07 | Status pill component | `components/order-status-pill.tsx` | [x] |
| T08 | Admin orders list + detail + actions | `admin/(app)/orders/*` | [x] |
| T09 | Admin nav Orders live | `admin/(app)/layout.tsx` | [x] |
| T10 | i18n keys en + vi | `messages/{en,vi}.json` | [x] |

---

## 4. Verification

- **Static gates:** `npx tsc --noEmit` ✅ · `npx eslint .` ✅ · `npm run build` ✅ (routes `/admin/orders`, `/admin/orders/[reference]` present).
- **Runtime (pending walkthrough):** prints-only cart → COD + VietQR shown; pick COD → order at `PROCESSING`, confirmation shows COD copy, cart cleared. Digital/mixed cart → COD hidden + bilingual reason. `/admin/orders` lists it; detail → Mark paid flips `isPaid`; Mark shipped (PROCESSING→SHIPPED) records note; advance SHIPPED→COMPLETED; a stale transition is rejected.
- **Money integrity:** tampering the cart cookie has no effect (DB recompute, AD-10).

---

## 5. Dev Agent Record — File List

| File | Created / Modified | Role |
|------|--------------------|------|
| `prisma/schema.prisma` | Modified | `PaymentMethod` enum + `Order` payment fields |
| `prisma/migrations/20260810063231_add_payment_method_cod/migration.sql` | Created | Migration |
| `lib/server/order.ts` | Modified | COD branch; `listOrders`, `getOrderForAdmin`, `advanceOrderStatus`, `recordShipment`, `markOrderPaid`; DTO adds payment fields |
| `lib/validation/checkout-schemas.ts` | Modified | `paymentMethod` enum |
| `app/[locale]/checkout/page.tsx` | Modified | `canCod` computation |
| `app/[locale]/checkout/checkout-form.tsx` | Modified | Payment-method radio + digital note |
| `app/[locale]/checkout/actions.ts` | Modified | Read/validate `paymentMethod` |
| `app/[locale]/order/[reference]/page.tsx` | Modified | Status pill + COD confirmation copy |
| `components/order-status-pill.tsx` | Created | Status pill + EN label map |
| `app/admin/(app)/orders/page.tsx` | Created | Operator order list |
| `app/admin/(app)/orders/[reference]/page.tsx` | Created | Order detail + fulfilment controls |
| `app/admin/(app)/orders/actions.ts` | Created | Guarded operator actions |
| `app/admin/(app)/layout.tsx` | Modified | Orders nav link live |
| `messages/en.json` / `messages/vi.json` | Modified | Checkout payment keys |

**Not in scope (later stories):** payOS/VietQR online payment (3.3); order cancellation + refund path (4.3); digital DownloadGrants + delivery (3.6/3.7); confirmation email via Resend (3.5); customer account order-history list.
