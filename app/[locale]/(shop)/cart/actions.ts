"use server";

// app/[locale]/cart/actions.ts — Story 3.1 cart mutations (AD-1). All state
// lives in the cart cookie; each action delegates to lib/server/cart.ts. The
// cart page's qty/remove forms bind these directly; the product page's
// add-to-cart calls addToCartAction and then refreshes to update the nav.

import { addItem, setItemQty, removeItem } from "@/lib/server/cart";

export async function addToCartAction(
  variantId: string,
): Promise<{ ok: boolean }> {
  await addItem(variantId, 1);
  return { ok: true };
}

export async function setQtyAction(
  variantId: string,
  qty: number,
): Promise<void> {
  await setItemQty(variantId, qty);
}

export async function removeLineAction(variantId: string): Promise<void> {
  await removeItem(variantId);
}
