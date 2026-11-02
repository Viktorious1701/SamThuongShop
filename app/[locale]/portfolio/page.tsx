// app/[locale]/portfolio/page.tsx
//
// Story 1.6 — the Portfolio landing: one section per gallery group (e.g.
// "Chim Việt Nam", "Chim Thế Giới") showing its galleries as cover cards plus
// a "View all / Xem tất cả" entry into the group page; standalone galleries
// follow. Only published galleries with images appear (D3).

import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/format";
import { getPortfolioOverview } from "@/lib/server/portfolio";
import { GalleryCard } from "@/components/portfolio/gallery-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Portfolio");
  return { title: t("title"), description: t("intro") };
}

export default async function PortfolioPage() {
  const [t, locale, overview] = await Promise.all([
    getTranslations("Portfolio"),
    getLocale(),
    getPortfolioOverview(),
  ]);

  const isEmpty = overview.groups.length === 0 && overview.standalone.length === 0;
  let cardIndex = 0; // first few covers load eagerly (above the fold)

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-16 md:px-margin-desktop md:py-24">
      <header className="max-w-2xl">
        <h1 className="text-h1 text-ink">{t("title")}</h1>
        <p className="mt-4 text-body text-ink-muted">{t("intro")}</p>
      </header>

      {isEmpty ? (
        <p className="mt-16 text-body text-ink-muted">{t("empty")}</p>
      ) : null}

      {overview.groups.map((group) => {
        const name = pickLocalized(locale, group.nameVi, group.nameEn);
        const description = pickLocalized(locale, group.descriptionVi, group.descriptionEn);
        return (
          <section key={group.slug} className="mt-20" aria-labelledby={`group-${group.slug}`}>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
              <div className="max-w-2xl">
                <h2 id={`group-${group.slug}`} className="text-h2 text-ink">
                  {name}
                </h2>
                {description ? (
                  <p className="mt-2 text-body text-ink-muted">{description}</p>
                ) : null}
              </div>
              <Link
                href={`/portfolio/${group.slug}`}
                className="text-caption text-sky-deep underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-deep"
              >
                {t("viewAll")} →
              </Link>
            </div>
            <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {group.galleries.map((g) => (
                <li key={g.slug}>
                  <GalleryCard
                    gallery={g}
                    locale={locale}
                    countLabel={t("imageCount", { count: g.imageCount })}
                    eager={cardIndex++ < 3}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {overview.standalone.length > 0 ? (
        <section className="mt-20" aria-labelledby="standalone-galleries">
          <h2
            id="standalone-galleries"
            className={`border-b border-border pb-4 text-h2 text-ink ${
              overview.groups.length === 0 ? "sr-only" : ""
            }`}
          >
            {t("otherGalleries")}
          </h2>
          <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {overview.standalone.map((g) => (
              <li key={g.slug}>
                <GalleryCard
                  gallery={g}
                  locale={locale}
                  countLabel={t("imageCount", { count: g.imageCount })}
                  eager={cardIndex++ < 3}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
