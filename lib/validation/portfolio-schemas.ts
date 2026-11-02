// lib/validation/portfolio-schemas.ts
//
// Zod schemas for the gallery editor and the per-photo details row. Admin is
// outside next-intl, so messages are literal English. Content is bilingual
// per-locale columns (AD-7); every photo field is optional — an uncaptioned
// photo falls back to the gallery name for its alt text.
// Revamp: galleries are one level (no parent); "species" is now "caption";
// the print link is gone.

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
    .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, "URL name may only use a–z, 0–9 and single hyphens.")
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  descriptionVi: optionalText(5000),
  descriptionEn: optionalText(5000),
});

export type GalleryInput = z.infer<typeof gallerySchema>;

export const imageDetailsSchema = z.object({
  captionVi: optionalText(200),
  captionEn: optionalText(200),
  locationVi: optionalText(200),
  locationEn: optionalText(200),
  featured: z.boolean().default(false),
});

export type ImageDetailsInput = z.infer<typeof imageDetailsSchema>;
