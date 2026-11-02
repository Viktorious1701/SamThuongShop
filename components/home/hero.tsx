// components/home/hero.tsx
//
// Portfolio-only revamp (R5) — the Home hero: one full-bleed photograph with
// the photographer's name and a one-line tagline over a soft bottom gradient.
// It's the page's largest image, so it loads eagerly with high priority
// (Next 16: `preload`/`fetchPriority` instead of the deprecated `priority`).

import Image from "next/image";
import { Caption, imageAlt } from "@/components/portfolio/caption";
import type { PublicImage } from "@/lib/server/portfolio";

export function Hero({
  photo,
  locale,
  name,
  tagline,
}: {
  photo: PublicImage | null;
  locale: string;
  name: string;
  tagline: string;
}) {
  if (!photo) {
    // No photos published yet — a calm text-only header instead of an empty box.
    return (
      <section className="mx-auto max-w-max-content px-margin-mobile py-24 md:px-margin-desktop">
        <h1 className="text-display text-ink">{name}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-ink-muted">{tagline}</p>
      </section>
    );
  }

  return (
    <section aria-label={name} className="relative h-[min(86vh,860px)] min-h-[420px] overflow-hidden bg-[#14171a]">
      <Image
        src={photo.url}
        alt={imageAlt(locale, photo, name)}
        fill
        sizes="100vw"
        placeholder="blur"
        blurDataURL={photo.blurDataUrl}
        preload
        fetchPriority="high"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-32 pb-10 md:pb-14">
        <div className="mx-auto max-w-max-content px-margin-mobile text-white md:px-margin-desktop">
          <h1 className="text-display">{name}</h1>
          <p className="mt-3 max-w-xl text-body-lg text-white/85">{tagline}</p>
          <Caption
            locale={locale}
            image={photo}
            className="mt-5 flex flex-wrap gap-x-2 text-caption text-white/75"
            placeClassName="text-white/60"
          />
        </div>
      </div>
    </section>
  );
}
