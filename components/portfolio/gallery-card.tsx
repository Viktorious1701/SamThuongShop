// components/portfolio/gallery-card.tsx
//
// A gallery's cover card (Home + /work). Whole card is one locale-aware link
// (no hover-only affordances). The cover is cropped to a fixed 4:5 frame so a
// row of cards lines up; the full, uncropped photos live inside the gallery.

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/format";
import type { GalleryCard as GalleryCardData } from "@/lib/server/portfolio";

export function GalleryCard({
  gallery,
  locale,
  countLabel,
  eager = false,
}: {
  gallery: GalleryCardData;
  locale: string;
  countLabel: string;
  eager?: boolean;
}) {
  const name = pickLocalized(locale, gallery.nameVi, gallery.nameEn);
  const coverAlt = pickLocalized(locale, gallery.cover.captionVi, gallery.cover.captionEn) || name;

  return (
    <Link
      href={`/work/${gallery.slug}`}
      className="group block rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-deep focus-visible:ring-offset-4 focus-visible:ring-offset-bg-page"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-surface-sunken">
        <Image
          src={gallery.cover.url}
          alt={coverAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          placeholder="blur"
          blurDataURL={gallery.cover.blurDataUrl}
          loading={eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-h3 text-ink group-hover:underline">{name}</h3>
        <span className="shrink-0 text-caption text-caption-deep">{countLabel}</span>
      </div>
    </Link>
  );
}
