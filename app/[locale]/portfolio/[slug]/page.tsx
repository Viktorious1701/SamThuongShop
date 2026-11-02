// app/[locale]/portfolio/[slug]/page.tsx
//
// Story 1.6 — one portfolio page. Either:
//   • a gallery (e.g. Tràm Chim): masonry grid + lightbox, with a breadcrumb
//     back to its group; or
//   • a group's "View all" (e.g. Chim Việt Nam): every child gallery as its
//     own headed section (D2), each with its own grid + lightbox.
// Unknown, unpublished or empty → notFound() (D3).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/format";
import { getPortfolioPage } from "@/lib/server/portfolio";
import { GalleryViewer } from "@/components/portfolio/gallery-viewer";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [page, locale] = await Promise.all([getPortfolioPage(slug), getLocale()]);
  if (!page) return {};
  const g = page.gallery;
  const description = pickLocalized(locale, g.descriptionVi, g.descriptionEn);
  return {
    title: pickLocalized(locale, g.nameVi, g.nameEn),
    ...(description ? { description } : {}),
  };
}

export default async function PortfolioGalleryPage({ params }: Params) {
  const { slug } = await params;
  const [t, locale, page] = await Promise.all([
    getTranslations("Portfolio"),
    getLocale(),
    getPortfolioPage(slug),
  ]);
  if (!page) notFound();

  const name = pickLocalized(locale, page.gallery.nameVi, page.gallery.nameEn);
  const description = pickLocalized(
    locale,
    page.gallery.descriptionVi,
    page.gallery.descriptionEn,
  );
  const crumb =
    page.kind === "gallery" && page.parent
      ? {
          href: `/portfolio/${page.parent.slug}`,
          label: pickLocalized(locale, page.parent.nameVi, page.parent.nameEn),
        }
      : null;

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-16 md:px-margin-desktop md:py-20">
      <nav aria-label="Breadcrumb" className="text-caption text-ink-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/portfolio" className="hover:underline">
              {t("title")}
            </Link>
          </li>
          {crumb ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={crumb.href} className="hover:underline">
                  {crumb.label}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {name}
          </li>
        </ol>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="text-h1 text-ink">{name}</h1>
        {description ? <p className="mt-4 text-body text-ink-muted">{description}</p> : null}
      </header>

      {page.kind === "gallery" ? (
        <div className="mt-12">
          <GalleryViewer images={page.images} galleryName={name} />
        </div>
      ) : (
        page.sections.map((section) => {
          const sectionName = pickLocalized(locale, section.gallery.nameVi, section.gallery.nameEn);
          return (
            <section
              key={section.gallery.slug}
              className="mt-16"
              aria-labelledby={`section-${section.gallery.slug}`}
            >
              <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4">
                <h2 id={`section-${section.gallery.slug}`} className="text-h2 text-ink">
                  <Link href={`/portfolio/${section.gallery.slug}`} className="hover:underline">
                    {sectionName}
                  </Link>
                </h2>
                <span className="text-caption text-caption-deep">
                  {t("imageCount", { count: section.images.length })}
                </span>
              </div>
              <GalleryViewer images={section.images} galleryName={sectionName} />
            </section>
          );
        })
      )}

      <p className="mt-20">
        <Link href="/portfolio" className="text-caption text-sky-deep hover:underline">
          ← {t("backToPortfolio")}
        </Link>
      </p>
    </div>
  );
}
