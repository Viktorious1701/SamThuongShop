// lib/server/order.ts
//
// The Order aggregate (AD-2/AD-3). Story 3.2 creates orders at
// PENDING_PAYMENT. Money is recomputed from the DB here — the client total is
// never trusted (AD-10). Each line snapshots unit price + format + buyer-
// locale name (AD-11), so later operator edits never re-price history.

import { randomInt } from "node:crypto";
import { prisma } from "@/lib/server/db";
import { getVariantsByIds } from "@/lib/server/product";
import { getStoreSettings } from "@/lib/server/settings";
import { onlinePaymentEnabled } from "@/lib/server/shop-config";
import { pickLocalized } from "@/lib/format";
import type { OrderStatus, PaymentMethod } from "@/lib/generated/prisma/enums";

// Unambiguous alphabet (no O/0/I/1) — readable + enough entropy for guest
// lookup with rate limiting (AD-14).
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REF_LENGTH = 8;

export type ShippingInput = {
  name: string;
  phone: string;
  address: string;
  city: string;
};

export type CreateOrderInput = {
  items: { variantId: string; qty: number }[];
  locale: string;
  email: string;
  userId?: string | null;
  shipping?: ShippingInput | null;
  paymentMethod: PaymentMethod;
};

export type CreateOrderResult =
  | { ok: true; reference: string; id: string }
  | { ok: false; error: string };

export type OrderLineDTO = {
  productName: string;
  format: "PRINT" | "DIGITAL";
  unitPriceVnd: number;
  qty: number;
  lineTotalVnd: number;
};

export type OrderDTO = {
  reference: string;
  status: string;
  locale: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  subtotalVnd: number;
  shippingFeeVnd: number;
  discountVnd: number;
  grandTotalVnd: number;
  hasPhysical: boolean;
  shipping: ShippingInput | null;
  lines: OrderLineDTO[];
  createdAt: Date;
};

function generateOrderReference(): string {
  let out = "";
  for (let i = 0; i < REF_LENGTH; i++) {
    out += REF_ALPHABET[randomInt(0, REF_ALPHABET.length)];
  }
  return out;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  // Story 3.8 — no online provider is wired yet, so a VIETQR order could
  // never be paid. Refuse it rather than create an order stuck pending.
  if (input.paymentMethod === "VIETQR" && !onlinePaymentEnabled()) {
    return { ok: false, error: "payment-unavailable" };
  }

  // Recompute from the DB (AD-10) — published-only; dropped ids simply fall out.
  const variants = await getVariantsByIds(input.items.map((i) => i.variantId));
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lines = input.items.flatMap((it) => {
    const v = byId.get(it.variantId);
    if (!v) return [];
    const qty = v.format === "DIGITAL" ? 1 : Math.max(1, Math.floor(it.qty));
    return [
      {
        variantId: v.id,
        productName: pickLocalized(input.locale, v.nameVi, v.nameEn),
        format: v.format,
        unitPriceVnd: v.priceVnd,
        qty,
        lineTotalVnd: v.priceVnd * qty,
      },
    ];
  });

  if (lines.length === 0) return { ok: false, error: "empty-cart" };

  const hasPhysical = lines.some((l) => l.format === "PRINT");
  const hasDigital = lines.some((l) => l.format === "DIGITAL");

  // COD is cash collected on delivery of physical goods (AD-8) — a digital
  // line has nothing to hand cash over for, so reject COD server-side even if
  // the client somehow offered it.
  if (input.paymentMethod === "COD" && hasDigital) {
    return { ok: false, error: "cod-not-allowed" };
  }

  const shippingFeeVnd = hasPhysical
    ? (await getStoreSettings()).shippingFeeVnd
    : 0;

  // COD orders skip PENDING_PAYMENT — payment is guaranteed-on-delivery, so
  // the order enters fulfilment immediately (the Operator marks it paid on
  // cash receipt, Epic 4.2). VIETQR stays pending until Story 3.3.
  const status: OrderStatus =
    input.paymentMethod === "COD" ? "PROCESSING" : "PENDING_PAYMENT";

  const shipping = input.shipping;
  if (
    hasPhysical &&
    (!shipping ||
      !shipping.name?.trim() ||
      !shipping.phone?.trim() ||
      !shipping.address?.trim() ||
      !shipping.city?.trim())
  ) {
    return { ok: false, error: "shipping-required" };
  }

  const subtotalVnd = lines.reduce((s, l) => s + l.lineTotalVnd, 0);
  const grandTotalVnd = subtotalVnd + shippingFeeVnd;

  // Create with a unique reference; retry a few times on the rare collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const order = await prisma.order.create({
        data: {
          reference: generateOrderReference(),
          status,
          paymentMethod: input.paymentMethod,
          locale: input.locale,
          customerEmail: input.email.toLowerCase(),
          userId: input.userId ?? null,
          subtotalVnd,
          shippingFeeVnd,
          discountVnd: 0,
          grandTotalVnd,
          shipName: hasPhysical ? shipping!.name.trim() : null,
          shipPhone: hasPhysical ? shipping!.phone.trim() : null,
          shipAddress: hasPhysical ? shipping!.address.trim() : null,
          shipCity: hasPhysical ? shipping!.city.trim() : null,
          lines: {
            create: lines.map((l) => ({
              variantId: l.variantId,
              productName: l.productName,
              format: l.format,
              unitPriceVnd: l.unitPriceVnd,
              qty: l.qty,
              lineTotalVnd: l.lineTotalVnd,
            })),
          },
        },
      });
      return { ok: true, reference: order.reference, id: order.id };
    } catch (error) {
      if (isUniqueConstraintError(error)) continue; // reference clash — retry
      throw error;
    }
  }
  return { ok: false, error: "reference-generation-failed" };
}

export async function getOrderByReference(
  reference: string,
): Promise<OrderDTO | null> {
  const o = await prisma.order.findUnique({
    where: { reference },
    include: { lines: true },
  });
  if (!o) return null;

  return {
    reference: o.reference,
    status: o.status,
    locale: o.locale,
    customerEmail: o.customerEmail,
    paymentMethod: o.paymentMethod,
    isPaid: o.isPaid,
    subtotalVnd: o.subtotalVnd,
    shippingFeeVnd: o.shippingFeeVnd,
    discountVnd: o.discountVnd,
    grandTotalVnd: o.grandTotalVnd,
    hasPhysical: o.lines.some((l) => l.format === "PRINT"),
    shipping: o.shipName
      ? {
          name: o.shipName,
          phone: o.shipPhone ?? "",
          address: o.shipAddress ?? "",
          city: o.shipCity ?? "",
        }
      : null,
    lines: o.lines.map((l) => ({
      productName: l.productName,
      format: l.format,
      unitPriceVnd: l.unitPriceVnd,
      qty: l.qty,
      lineTotalVnd: l.lineTotalVnd,
    })),
    createdAt: o.createdAt,
  };
}

// --- Operator fulfilment (Epic 4.1 / 4.2) --------------------------------
// Read + guarded status transitions for the admin order screens. All Prisma
// access stays here (AD-2); the admin actions only guard the role + delegate.

export type AdminOrderListItem = {
  id: string;
  reference: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  customerEmail: string;
  itemCount: number;
  grandTotalVnd: number;
  hasPhysical: boolean;
  shipName: string | null;
  shipCity: string | null;
  createdAt: Date;
};

export type AdminOrderDTO = OrderDTO & {
  id: string;
  paidAt: Date | null;
  trackingNote: string | null;
};

export type OrderMutationResult =
  | { ok: true; status: OrderStatus }
  | { ok: false; error: string };

// The forward-only fulfilment chain. Each key maps to the single legal next
// state; anything not listed here (e.g. COMPLETED, CANCELLED) is terminal for
// the "advance" action. COD enters at PROCESSING, online orders at PAID.
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "COMPLETED",
};

/** Newest-first list for the admin orders screen (Story 4.1). */
export async function listOrders(): Promise<AdminOrderListItem[]> {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { lines: { select: { format: true, qty: true } } },
  });

  return rows.map((o) => ({
    id: o.id,
    reference: o.reference,
    status: o.status,
    paymentMethod: o.paymentMethod,
    isPaid: o.isPaid,
    customerEmail: o.customerEmail,
    itemCount: o.lines.reduce((s, l) => s + l.qty, 0),
    grandTotalVnd: o.grandTotalVnd,
    hasPhysical: o.lines.some((l) => l.format === "PRINT"),
    shipName: o.shipName,
    shipCity: o.shipCity,
    createdAt: o.createdAt,
  }));
}

/** Full order detail for the admin screen — includes id + fulfilment fields. */
export async function getOrderForAdmin(
  reference: string,
): Promise<AdminOrderDTO | null> {
  const base = await getOrderByReference(reference);
  if (!base) return null;
  const meta = await prisma.order.findUnique({
    where: { reference },
    select: { id: true, paidAt: true, trackingNote: true },
  });
  if (!meta) return null;
  return {
    ...base,
    id: meta.id,
    paidAt: meta.paidAt,
    trackingNote: meta.trackingNote,
  };
}

/**
 * Advance an order one step along the fulfilment chain (Story 4.2). Uses an
 * atomic compare-and-set on the EXPECTED status, so a concurrent change or a
 * stale form submit can never regress or skip state — if the row no longer
 * matches `expected`, zero rows update and we report `stale-status`.
 */
export async function advanceOrderStatus(
  id: string,
  expected: OrderStatus,
): Promise<OrderMutationResult> {
  const next = NEXT_STATUS[expected];
  if (!next) return { ok: false, error: "no-transition" };

  const res = await prisma.order.updateMany({
    where: { id, status: expected },
    data: { status: next },
  });
  if (res.count !== 1) return { ok: false, error: "stale-status" };
  return { ok: true, status: next };
}

/**
 * Advance PROCESSING → SHIPPED and record an optional tracking note (4.2).
 * Same compare-and-set guard as `advanceOrderStatus`.
 */
export async function recordShipment(
  id: string,
  trackingNote?: string | null,
): Promise<OrderMutationResult> {
  const note = trackingNote?.trim() || null;
  const res = await prisma.order.updateMany({
    where: { id, status: "PROCESSING" },
    data: { status: "SHIPPED", trackingNote: note },
  });
  if (res.count !== 1) return { ok: false, error: "stale-status" };
  return { ok: true, status: "SHIPPED" };
}

/**
 * Record manual payment — COD cash receipt or bank transfer (4.2). Idempotent
 * compare-and-set on `isPaid: false`. Confirming payment on a still-pending
 * (online/VIETQR) order also moves it PENDING_PAYMENT → PAID so it can enter
 * fulfilment; a COD order (already PROCESSING or later) just flips the flag.
 */
export async function markOrderPaid(id: string): Promise<OrderMutationResult> {
  const current = await prisma.order.findUnique({
    where: { id },
    select: { status: true, isPaid: true },
  });
  if (!current) return { ok: false, error: "not-found" };
  if (current.isPaid) return { ok: false, error: "already-paid" };

  const nextStatus: OrderStatus =
    current.status === "PENDING_PAYMENT" ? "PAID" : current.status;

  const res = await prisma.order.updateMany({
    where: { id, isPaid: false },
    data: { isPaid: true, paidAt: new Date(), status: nextStatus },
  });
  if (res.count !== 1) return { ok: false, error: "already-paid" };
  return { ok: true, status: nextStatus };
}
