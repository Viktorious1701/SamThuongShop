// app/[locale]/work/page.tsx
//
// Work — every published gallery as a cover card, in the order set in admin.
// Portfolio-only revamp: one level of categories (no groups).

import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { listGalleryCards } from "@/lib/server/portfolio";
import { GalleryCard } from "@/components/portfolio/gallery-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Portfolio");
  return { title: t("title"), description: t("intro") };
}

export default async function WorkPage() {
  const [t, locale, galleries] = await Promise.all([
    getTranslations("Portfolio"),
    getLocale(),
    listGalleryCards(),
  ]);

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-16 md:px-margin-desktop md:py-20">
      <header className="max-w-2xl">
        <h1 className="text-h1 text-ink">{t("title")}</h1>
        <p className="mt-4 text-body text-ink-muted">{t("intro")}</p>
      </header>

      {galleries.length === 0 ? (
        <p className="mt-16 text-body text-ink-muted">{t("empty")}</p>
      ) : (
        <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((g, i) => (
            <li key={g.slug}>
              <GalleryCard
                gallery={g}
                locale={locale}
                countLabel={t("imageCount", { count: g.imageCount })}
                eager={i < 3}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
