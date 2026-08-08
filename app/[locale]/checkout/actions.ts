"use server";

// app/[locale]/checkout/actions.ts — Story 3.2. Places the order: validates,
// recomputes server-side (in the order service), creates the Order at
// PENDING_PAYMENT, clears the cart, and redirects to the summary. Error
// strings are translation keys resolved by the client form (Checkout ns).

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { getCartItems, clearCart } from "@/lib/server/cart";
import { getVariantsByIds } from "@/lib/server/product";
import { createOrder } from "@/lib/server/order";
import { checkoutSchema, SHIP_FIELDS } from "@/lib/validation/checkout-schemas";

export type CheckoutState = {
  status: "idle" | "error";
  fieldErrors?: Partial<Record<"email" | (typeof SHIP_FIELDS)[number], string>>;
  formError?: string;
};

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const locale = await getLocale();
  const session = await auth();

  const items = await getCartItems();
  if (items.length === 0) redirect(`/${locale}/cart`);

  // Determine whether shipping is required (any physical line) — server truth.
  const variants = await getVariantsByIds(items.map((i) => i.variantId));
  const hasPhysical = variants.some((v) => v.format === "PRINT");

  const email = session?.user?.email ?? String(formData.get("email") ?? "");
  const raw = {
    email,
    shipName: String(formData.get("shipName") ?? ""),
    shipPhone: String(formData.get("shipPhone") ?? ""),
    shipAddress: String(formData.get("shipAddress") ?? ""),
    shipCity: String(formData.get("shipCity") ?? ""),
  };

  const parsed = checkoutSchema.safeParse(raw);
  const fieldErrors: NonNullable<CheckoutState["fieldErrors"]> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<CheckoutState["fieldErrors"]>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
  }
  // Shipping fields are required only when the cart has a physical print.
  if (hasPhysical) {
    for (const f of SHIP_FIELDS) {
      if (!raw[f].trim() && !fieldErrors[f]) fieldErrors[f] = "required";
    }
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors };
  }

  const result = await createOrder({
    items,
    locale,
    email,
    userId: session?.user?.id ?? null,
    shipping: hasPhysical
      ? {
          name: raw.shipName,
          phone: raw.shipPhone,
          address: raw.shipAddress,
          city: raw.shipCity,
        }
      : null,
  });

  if (!result.ok) {
    if (result.error === "empty-cart") redirect(`/${locale}/cart`);
    return { status: "error", formError: "genericError" };
  }

  await clearCart();
  redirect(`/${locale}/order/${result.reference}`);
}
