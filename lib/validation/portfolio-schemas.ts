// lib/validation/portfolio-schemas.ts
//
// Story 1.6 — Zod schemas for the gallery editor and the per-image caption
// row. Admin is outside next-intl, so messages are literal English (matches
// product-schemas.ts / collection-schemas.ts). Content is bilingual per-locale
// columns (AD-7); every caption field is optional — an uncaptioned image
// falls back to the gallery name for its alt text.

import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

export const gallerySchema = z.object({
  nameVi: z.string().trim().min(1, "Vietnamese name is required.").max(200),
  nameEn: z.string().trim().min(1, "English name is required.").max(200),
  // Optional: blank → derived from the English name by the service.
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80, "URL name is too long.")
    .regex(
      /^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "URL name may only use a–z, 0–9 and single hyphens.",
    )
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  parentId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  descriptionVi: optionalText(5000),
  descriptionEn: optionalText(5000),
});

export type GalleryInput = z.infer<typeof gallerySchema>;

export const imageDetailsSchema = z.object({
  speciesVi: optionalText(200),
  speciesEn: optionalText(200),
  locationVi: optionalText(200),
  locationEn: optionalText(200),
  featured: z.boolean().default(false),
  productId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
});

export type ImageDetailsInput = z.infer<typeof imageDetailsSchema>;
