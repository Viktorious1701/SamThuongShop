// lib/validation/checkout-schemas.ts
//
// Checkout form validation. Storefront is bilingual, so messages are
// translation KEYS resolved client-side against the Checkout namespace
// (matches auth-schemas.ts). Shipping fields are optional here; the action
// enforces them only when the cart has a Physical Print (AD-8).

import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().trim().min(1, "required").email("invalidEmail").max(200),
  shipName: z.string().trim().max(120).optional(),
  shipPhone: z.string().trim().max(40).optional(),
  shipAddress: z.string().trim().max(500).optional(),
  shipCity: z.string().trim().max(120).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const SHIP_FIELDS = [
  "shipName",
  "shipPhone",
  "shipAddress",
  "shipCity",
] as const;
