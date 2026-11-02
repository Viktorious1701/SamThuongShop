// components/portfolio/caption.tsx
//
// Story 1.6 — portfolio caption rules (EXPERIENCE.md → Gallery grid), pure so
// both server pages and the client lightbox share them:
//   • visible caption shows BOTH species names in every locale
//     ("Bồng chanh đỏ · Black-backed Kingfisher") + the location in the
//     active locale (Vietnamese fallback, AD-7);
//   • alt text is "{Species} — {location}" in the active locale.

import { pickLocalized } from "@/lib/format";

export type CaptionFields = {
  speciesVi: string | null;
  speciesEn: string | null;
  locationVi: string | null;
  locationEn: string | null;
};

/** Both species names, de-duplicated, Vietnamese first. */
export function bothSpecies(img: CaptionFields): string {
  const vi = img.speciesVi?.trim();
  const en = img.speciesEn?.trim();
  if (vi && en && vi.toLowerCase() !== en.toLowerCase()) return `${vi} · ${en}`;
  return vi || en || "";
}

export function localLocation(locale: string, img: CaptionFields): string {
  return pickLocalized(locale, img.locationVi, img.locationEn);
}

/** "{Species} — {location}" in the active locale; `fallback` (e.g. the
 * gallery name) when the image has no caption at all. */
export function imageAlt(locale: string, img: CaptionFields, fallback: string): string {
  const species = pickLocalized(locale, img.speciesVi, img.speciesEn);
  const location = localLocation(locale, img);
  if (species && location) return `${species} — ${location}`;
  return species || location || fallback;
}

export function Caption({
  locale,
  image,
  className,
  id,
}: {
  locale: string;
  image: CaptionFields;
  className?: string;
  id?: string;
}) {
  const species = bothSpecies(image);
  const location = localLocation(locale, image);
  if (!species && !location) return null;
  return (
    <p id={id} className={className}>
      {species ? <span className="text-ink">{species}</span> : null}
      {species && location ? <span aria-hidden="true"> — </span> : null}
      {location ? <span className="text-caption-deep">{location}</span> : null}
    </p>
  );
}
