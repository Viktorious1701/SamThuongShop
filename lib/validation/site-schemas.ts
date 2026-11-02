// lib/validation/site-schemas.ts
//
// Portfolio-only revamp (R4) — the /admin/site form: Home hero + tagline,
// About text, the three record lists and the contact channels. Literal
// English messages (admin). Every field is optional so the operator can fill
// the site in gradually; English falls back to Vietnamese on the public site.

import { z } from "zod";

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

export const siteContentSchema = z.object({
  heroImageId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  taglineVi: text(200),
  taglineEn: text(200),
  aboutTeaserVi: text(600),
  aboutTeaserEn: text(600),
  bioVi: text(8000),
  bioEn: text(8000),
  exhibitionsVi: text(8000),
  exhibitionsEn: text(8000),
  awardsVi: text(8000),
  awardsEn: text(8000),
  pressVi: text(8000),
  pressEn: text(8000),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address.")
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  facebookUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "The Facebook link must start with https://")
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  zalo: text(40),
});

export type SiteContentInput = z.infer<typeof siteContentSchema>;
