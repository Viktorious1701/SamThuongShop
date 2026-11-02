"use server";

// app/admin/(app)/orders/actions.ts
//
// Story 4.2 — operator order-fulfilment Server Actions (AD-1). Each action
// re-checks the operator role (AD-9) before mutating; the (app) layout guards
// the pages but actions are separately callable. All persistence is delegated
// to lib/server/order.ts (AD-2) where the guarded compare-and-set lives.

import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/server/require-operator";
import {
  advanceOrderStatus,
  markOrderPaid,
  recordShipment,
} from "@/lib/server/order";
import type { OrderStatus } from "@/lib/generated/prisma/enums";

function revalidateOrder(reference: string): void {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${reference}`);
}

/** Advance one step along the fulfilment chain (PAID→PROCESSING→…→COMPLETED). */
export async function advanceStatusAction(
  id: string,
  expected: OrderStatus,
  reference: string,
): Promise<void> {
  await requireOperator();
  await advanceOrderStatus(id, expected);
  revalidateOrder(reference);
}

/** Mark PROCESSING → SHIPPED with an optional tracking note (from the form). */
export async function recordShipmentAction(
  id: string,
  reference: string,
  formData: FormData,
): Promise<void> {
  await requireOperator();
  await recordShipment(id, String(formData.get("trackingNote") ?? ""));
  revalidateOrder(reference);
}

/** Confirm manual payment (COD cash / bank transfer) → marks the order paid. */
export async function markPaidAction(
  id: string,
  reference: string,
): Promise<void> {
  await requireOperator();
  await markOrderPaid(id);
  revalidateOrder(reference);
}
