// app/[locale]/page.tsx
//
// Home — portfolio-only revamp (R5). Four parts, nothing else:
//   1. Hero: one full-bleed photo (chosen in /admin/site, else the first
//      Featured photo) with the name and tagline.
//   2. Selected work: Featured photos from every published gallery, in their
//      natural shapes; click opens the lightbox.
//   3. Galleries: one cover card per published gallery.
//   4. About teaser: two lines + "Read more", if written.

import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/format";
import { getHeroPhoto, listFeaturedPhotos, listGalleryCards } from "@/lib/server/portfolio";
import { getSiteContent } from "@/lib/server/site-content";
import { Hero } from "@/components/home/hero";
import { GalleryViewer } from "@/components/portfolio/gallery-viewer";
import { GalleryCard } from "@/components/portfolio/gallery-card";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale, site] = await Promise.all([getTranslations("Home"), getLocale(), getSiteContent()]);
  return {
    title: { absolute: t("metaTitle") },
    description: pickLocalized(locale, site.taglineVi, site.taglineEn) || t("defaultTagline"),
  };
}

function SectionHead({ id, title, link }: { id: string; title: string; link?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <h2 id={id} className="text-h2 text-ink">
        {title}
      </h2>
      {link ? (
        <Link href={link.href} className="text-caption text-sky-deep underline-offset-4 hover:underline">
          {link.label} →
        </Link>
      ) : null}
    </div>
  );
}

export default async function HomePage() {
  const [t, tNav, tWork, locale, site, featured, galleries] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Nav"),
    getTranslations("Portfolio"),
    getLocale(),
    getSiteContent(),
    listFeaturedPhotos(12),
    listGalleryCards(),
  ]);
  const hero = await getHeroPhoto(site.heroImageId);
  // Don't repeat the hero photo as the first "Selected work" tile.
  const selected = featured.filter((p) => p.id !== hero?.id);
  const tagline = pickLocalized(locale, site.taglineVi, site.taglineEn) || t("defaultTagline");
  const teaser = pickLocalized(locale, site.aboutTeaserVi, site.aboutTeaserEn);

  return (
    <>
      <Hero photo={hero} locale={locale} name={tNav("wordmark")} tagline={tagline} />

      <div className="mx-auto max-w-max-content px-margin-mobile md:px-margin-desktop">
        {selected.length > 0 ? (
          <section aria-labelledby="selected-work" className="pt-20">
            <SectionHead
              id="selected-work"
              title={t("selectedWork")}
              link={{ href: "/work", label: t("allGalleries") }}
            />
            <GalleryViewer images={selected} galleryName={t("selectedWork")} />
          </section>
        ) : null}

        {galleries.length > 0 ? (
          <section aria-labelledby="galleries" className="pt-20">
            <SectionHead id="galleries" title={t("galleries")} />
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {galleries.map((g) => (
                <li key={g.slug}>
                  <GalleryCard
                    gallery={g}
                    locale={locale}
                    countLabel={tWork("imageCount", { count: g.imageCount })}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="pt-20 text-body text-ink-muted">{tWork("empty")}</p>
        )}

        {teaser ? (
          <section aria-labelledby="about-teaser" className="pt-20">
            <SectionHead id="about-teaser" title={t("aboutTitle")} link={{ href: "/about", label: t("readMore") }} />
            <p className="max-w-2xl whitespace-pre-line text-body-lg text-ink-muted">{teaser}</p>
          </section>
        ) : null}
      </div>
    </>
  );
}
