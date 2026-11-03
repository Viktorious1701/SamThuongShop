"use client";

// components/portfolio/gallery-viewer.tsx
//
// Story 1.6 — a gallery's masonry grid + its lightbox.
//
// Grid (D9): CSS columns using each photo's stored width/height, so space is
// reserved before the image arrives (no layout shift) with a blur
// placeholder; the first row loads eagerly, the rest lazily (D10 — Next 16
// deprecates `priority`, so `loading`/`fetchPriority` are used instead).
//
// Lightbox state lives in the URL (`?image=<id>`): a viewed photo can be
// shared, and the browser Back button closes the viewer. Updates go through
// window.history, which Next keeps in sync with useSearchParams without a
// server round-trip.

import Image from "next/image";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Caption, imageAlt } from "@/components/portfolio/caption";
import { Lightbox } from "@/components/portfolio/lightbox";
import type { PublicImage } from "@/lib/server/portfolio";

const EAGER_COUNT = 3;

function urlWith(id: string | null): string {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("image", id);
  else url.searchParams.delete("image");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function GalleryViewer({
  images,
  galleryName,
}: {
  images: PublicImage[];
  galleryName: string;
}) {
  const t = useTranslations("Portfolio");
  const locale = useLocale();
  const searchParams = useSearchParams();
  // True when this viewer pushed the ?image= history entry (so closing can
  // simply go Back); false when the page was opened from a shared link.
  const pushed = useRef(false);

  const openId = searchParams.get("image");
  const openIndex = openId ? images.findIndex((i) => i.id === openId) : -1;

  function open(id: string) {
    window.history.pushState(null, "", urlWith(id));
    pushed.current = true;
  }

  function close() {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", urlWith(null));
    }
  }

  function show(index: number) {
    const target = images[index];
    if (target) window.history.replaceState(null, "", urlWith(target.id));
  }

  return (
    <>
      <ul className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {images.map((img, i) => {
          const alt = imageAlt(locale, img, galleryName);
          return (
            <li key={img.id} className="mb-8 break-inside-avoid">
              <figure>
                <button
                  type="button"
                  data-portfolio-image={img.id}
                  onClick={() => open(img.id)}
                  aria-label={t("openImage", { name: alt })}
                  className="group block w-full overflow-hidden rounded-sm bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-deep focus-visible:ring-offset-4 focus-visible:ring-offset-bg-page"
                >
                  <Image
                    src={img.url}
                    alt={alt}
                    width={img.width}
                    height={img.height}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL={img.blurDataUrl}
                    loading={i < EAGER_COUNT ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
                    className="h-auto w-full transition-transform duration-500 motion-safe:group-hover:scale-[1.015]"
                  />
                </button>
                <figcaption>
                  <Caption
                    locale={locale}
                    image={img}
                    className="mt-2 text-caption text-ink"
                  />
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>

      {openIndex >= 0 ? (
        <Lightbox
          images={images}
          index={openIndex}
          fallbackAlt={galleryName}
          onClose={close}
          onIndex={show}
        />
      ) : null}
    </>
  );
}
