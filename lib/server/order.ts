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
import { pickLocalized } from "@/lib/format";

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
  const shippingFeeVnd = hasPhysical
    ? (await getStoreSettings()).shippingFeeVnd
    : 0;

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
