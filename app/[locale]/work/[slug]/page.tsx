// app/[locale]/work/[slug]/page.tsx
//
// One gallery: heading + intro, the masonry grid with captions, the lightbox
// (shareable ?image= links), and a pager to the previous / next gallery so
// visitors keep browsing. Unknown, unpublished or empty → 404.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/format";
import { getGalleryPage } from "@/lib/server/portfolio";
import { GalleryViewer } from "@/components/portfolio/gallery-viewer";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [page, locale] = await Promise.all([getGalleryPage(slug), getLocale()]);
  if (!page) return {};
  const g = page.gallery;
  const description = pickLocalized(locale, g.descriptionVi, g.descriptionEn);
  return {
    title: pickLocalized(locale, g.nameVi, g.nameEn),
    ...(description ? { description } : {}),
  };
}

export default async function GalleryPage({ params }: Params) {
  const { slug } = await params;
  const [t, locale, page] = await Promise.all([
    getTranslations("Portfolio"),
    getLocale(),
    getGalleryPage(slug),
  ]);
  if (!page) notFound();

  const name = pickLocalized(locale, page.gallery.nameVi, page.gallery.nameEn);
  const description = pickLocalized(locale, page.gallery.descriptionVi, page.gallery.descriptionEn);
  const label = (g: { nameVi: string; nameEn: string }) => pickLocalized(locale, g.nameVi, g.nameEn);

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-16 md:px-margin-desktop md:py-20">
      <nav aria-label={t("breadcrumb")} className="text-caption text-ink-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/work" className="hover:underline">
              {t("title")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {name}
          </li>
        </ol>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="text-h1 text-ink">{name}</h1>
        {description ? <p className="mt-4 whitespace-pre-line text-body text-ink-muted">{description}</p> : null}
      </header>

      <div className="mt-12">
        <GalleryViewer images={page.images} galleryName={name} />
      </div>

      {/* GalleryPager — previous / next published gallery */}
      <nav
        aria-label={t("moreGalleries")}
        className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6 text-caption"
      >
        {page.previous ? (
          <Link href={`/work/${page.previous.slug}`} className="text-sky-deep hover:underline">
            ← {label(page.previous)}
          </Link>
        ) : (
          <Link href="/work" className="text-sky-deep hover:underline">
            ← {t("allGalleries")}
          </Link>
        )}
        {page.next ? (
          <Link href={`/work/${page.next.slug}`} className="text-sky-deep hover:underline">
            {label(page.next)} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
