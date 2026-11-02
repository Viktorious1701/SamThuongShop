// components/portfolio/caption.tsx
//
// Caption rules, pure so server pages and the client lightbox share them.
// Revamp: photos aren't only birds, so the caption is ONE line in the active
// language (Vietnamese fallback, AD-7) — a bird caption can still be written
// "Sarus Crane · Sếu đầu đỏ" by the operator — with the place & date beneath.
// Alt text: "{caption} — {place}" in the active language.

import { pickLocalized } from "@/lib/format";
import type { CaptionFields } from "@/lib/server/portfolio";

export function captionText(locale: string, img: CaptionFields): string {
  return pickLocalized(locale, img.captionVi, img.captionEn);
}

export function placeText(locale: string, img: CaptionFields): string {
  return pickLocalized(locale, img.locationVi, img.locationEn);
}

/** "{caption} — {place}", or `fallback` (e.g. the gallery name) when empty. */
export function imageAlt(locale: string, img: CaptionFields, fallback: string): string {
  const caption = captionText(locale, img);
  const place = placeText(locale, img);
  if (caption && place) return `${caption} — ${place}`;
  return caption || place || fallback;
}

export function Caption({
  locale,
  image,
  className,
  placeClassName = "text-caption-deep",
  id,
}: {
  locale: string;
  image: CaptionFields;
  className?: string;
  placeClassName?: string;
  id?: string;
}) {
  const caption = captionText(locale, image);
  const place = placeText(locale, image);
  if (!caption && !place) return null;
  return (
    <p id={id} className={className}>
      {caption ? <span className="block">{caption}</span> : null}
      {place ? <span className={`block ${placeClassName}`}>{place}</span> : null}
    </p>
  );
}
