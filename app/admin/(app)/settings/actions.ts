"use server";

// app/admin/(app)/settings/actions.ts — Story 2.3 store settings (AD-1).
// Guarded; delegates to lib/server/settings.ts (AD-2).

import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/server/require-operator";
import { updateShippingFee } from "@/lib/server/settings";
import { shippingFeeSchema } from "@/lib/validation/collection-schemas";

export async function updateShippingFeeAction(
  formData: FormData,
): Promise<void> {
  await requireOperator();
  const parsed = shippingFeeSchema.safeParse({
    shippingFeeVnd: Number(formData.get("shippingFeeVnd")),
  });
  if (!parsed.success) return; // input is type=number/min=0; ignore invalid
  await updateShippingFee(parsed.data.shippingFeeVnd);
  revalidatePath("/admin/settings");
}
