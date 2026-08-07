// lib/server/cart.ts
//
// Story 3.1 — the pre-checkout cart. Persisted in an httpOnly cookie holding
// ONLY [{ v: variantId, q: qty }] — never prices or names. Everything shown
// is recomputed server-side from the DB (AD-10: never trust a client total),
// so a tampered cookie can only change which variants/qty, and digital qty is
// re-forced to 1 (AD-8). No Cart DB model — the Order is the first persisted
// entity (Story 3.2). Works for guests (no account needed, FR-5).
//
// Reads (readItems / resolveCart / getCartCount) are RSC-safe. Writes happen
// only in Server Actions (Next 16 only allows cookie writes there) — AD-1.

import { cookies } from "next/headers";
import { getVariantsByIds } from "@/lib/server/product";
import { pickLocalized } from "@/lib/format";

const COOKIE = "cart";
const MAX_LINES = 50;
const MAX_QTY = 99;
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type CartCookieItem = { v: string; q: number };

export type CartLine = {
  variantId: string;
  productSlug: string;
  name: string;
  format: "PRINT" | "DIGITAL";
  label: string;
  unitPriceVnd: number;
  qty: number;
  lineTotalVnd: number;
  imageUrl: string | null;
};

export type ResolvedCart = {
  lines: CartLine[];
  subtotalVnd: number;
  count: number;
};

async function readItems(): Promise<CartCookieItem[]> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is CartCookieItem =>
          !!x &&
          typeof (x as CartCookieItem).v === "string" &&
          Number.isFinite((x as CartCookieItem).q),
      )
      .map((x) => ({
        v: x.v,
        q: Math.max(1, Math.min(MAX_QTY, Math.floor(x.q))),
      }))
      .slice(0, MAX_LINES);
  } catch {
    return [];
  }
}

async function writeItems(items: CartCookieItem[]): Promise<void> {
  const store = await cookies();
  if (items.length === 0) {
    store.delete(COOKIE);
    return;
  }
  store.set(COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

// --- mutations (call only from Server Actions) ----------------------------

export async function addItem(variantId: string, qty = 1): Promise<void> {
  const [variant] = await getVariantsByIds([variantId]);
  if (!variant) return; // invalid / unpublished — ignore silently

  const items = await readItems();
  const existing = items.find((i) => i.v === variantId);

  if (variant.format === "DIGITAL") {
    // Bought once per order — never more than one line, qty pinned to 1.
    if (!existing) items.push({ v: variantId, q: 1 });
  } else if (existing) {
    existing.q = Math.min(MAX_QTY, existing.q + Math.max(1, qty));
  } else if (items.length < MAX_LINES) {
    items.push({ v: variantId, q: Math.max(1, qty) });
  }
  await writeItems(items);
}

export async function setItemQty(
  variantId: string,
  qty: number,
): Promise<void> {
  const items = await readItems();
  const existing = items.find((i) => i.v === variantId);
  if (!existing) return;
  const [variant] = await getVariantsByIds([variantId]);
  existing.q =
    variant?.format === "DIGITAL"
      ? 1
      : Math.max(1, Math.min(MAX_QTY, Math.floor(qty)));
  await writeItems(items);
}

export async function removeItem(variantId: string): Promise<void> {
  await writeItems((await readItems()).filter((i) => i.v !== variantId));
}

export async function clearCart(): Promise<void> {
  await writeItems([]);
}

// --- reads (RSC-safe) -----------------------------------------------------

export async function resolveCart(locale: string): Promise<ResolvedCart> {
  const items = await readItems();
  if (items.length === 0) return { lines: [], subtotalVnd: 0, count: 0 };

  const variants = await getVariantsByIds(items.map((i) => i.v));
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lines: CartLine[] = [];
  for (const item of items) {
    const v = byId.get(item.v);
    if (!v) continue; // no longer published — drop
    const qty = v.format === "DIGITAL" ? 1 : item.q;
    lines.push({
      variantId: v.id,
      productSlug: v.productSlug,
      name: pickLocalized(locale, v.nameVi, v.nameEn),
      format: v.format,
      label: v.label,
      unitPriceVnd: v.priceVnd,
      qty,
      lineTotalVnd: v.priceVnd * qty,
      imageUrl: v.imageUrl,
    });
  }

  const subtotalVnd = lines.reduce((s, l) => s + l.lineTotalVnd, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return { lines, subtotalVnd, count };
}

/** Lightweight badge count (cookie-only, no DB round-trip). */
export async function getCartCount(): Promise<number> {
  return (await readItems()).reduce((s, i) => s + i.q, 0);
}
