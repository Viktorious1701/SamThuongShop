// lib/validation/collection-schemas.ts
//
// Zod schemas for the collection editor + store settings. Admin is outside
// next-intl, so messages are literal English (matches product-schemas.ts).
// Shipping fee is integer VND (AD-5).

import { z } from "zod";

export const collectionSchema = z.object({
  nameVi: z.string().trim().min(1, "Vietnamese name is required.").max(200),
  nameEn: z.string().trim().min(1, "English name is required.").max(200),
  descriptionVi: z.string().trim().max(5000).optional().nullable(),
  descriptionEn: z.string().trim().max(5000).optional().nullable(),
  productIds: z.array(z.string()).default([]),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

export const shippingFeeSchema = z.object({
  shippingFeeVnd: z
    .number({ message: "Shipping fee is required." })
    .int("Shipping fee must be a whole number of VND.")
    .min(0, "Shipping fee cannot be negative.")
    .max(2_000_000_000, "Shipping fee is too large."),
});

export type ShippingFeeInput = z.infer<typeof shippingFeeSchema>;
