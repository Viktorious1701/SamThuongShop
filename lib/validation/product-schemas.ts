// lib/validation/product-schemas.ts
//
// Zod schema for the product editor payload. Admin is outside next-intl, so
// messages are literal English (matching app/admin/login/actions.ts). The
// editor uploads files to R2 first (presigned PUT) and submits only the
// resulting object KEYS here — never file bytes (AD-15, and Vercel's ~4.5 MB
// server-body cap). Prices are integer VND (AD-5).

import { z } from "zod";

const priceVnd = z
  .number({ message: "Price is required." })
  .int("Price must be a whole number of VND.")
  .positive("Price must be greater than 0.")
  .max(2_000_000_000, "Price is too large.");

const imageSchema = z.object({
  key: z.string().min(1, "Image key is required."),
  alt: z.string().trim().max(300).optional().nullable(),
  position: z.number().int().min(0).default(0),
});

const baseVariant = {
  label: z.string().trim().min(1, "Variant label is required.").max(120),
  priceVnd,
  position: z.number().int().min(0).default(0),
};

// A Digital Download variant carries its private original's key + metadata;
// a Physical Print carries none. Discriminated on `format` (AD-8).
const variantSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("PRINT"),
    ...baseVariant,
  }),
  z.object({
    format: z.literal("DIGITAL"),
    ...baseVariant,
    originalKey: z.string().min(1, "Upload the digital original file."),
    originalFilename: z.string().trim().max(300).optional().nullable(),
    contentType: z.string().trim().max(150).optional().nullable(),
    sizeBytes: z.number().int().positive().optional().nullable(),
    // Story 2.2 — watermarked public preview key (generated on upload).
    previewKey: z.string().optional().nullable(),
  }),
]);

export const productSchema = z.object({
  nameVi: z.string().trim().min(1, "Vietnamese name is required.").max(200),
  nameEn: z.string().trim().min(1, "English name is required.").max(200),
  descriptionVi: z.string().trim().max(5000).optional().nullable(),
  descriptionEn: z.string().trim().max(5000).optional().nullable(),
  published: z.boolean().default(false),
  images: z.array(imageSchema).max(20).default([]),
  variants: z
    .array(variantSchema)
    .min(1, "Add at least one variant (a print size or a digital tier)."),
});

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type ProductImageInput = z.infer<typeof imageSchema>;
