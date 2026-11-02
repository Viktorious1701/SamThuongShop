// app/[locale]/about/page.tsx
//
// About — portfolio-only revamp (R6): portrait + biography, the professional
// record (Exhibitions / Awards / Press as plain lists), and the Contact block
// (#contact — the nav's "Contact" link lands here). All content comes from
// /admin/site; English falls back to Vietnamese (AD-7).

import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { pickLocalized } from "@/lib/format";
import { getSiteContent, parseRecord } from "@/lib/server/site-content";
import { Record } from "@/components/about/record";
import { ContactLinks } from "@/components/about/contact-links";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale, site] = await Promise.all([getTranslations("About"), getLocale(), getSiteContent()]);
  const bio = pickLocalized(locale, site.bioVi, site.bioEn);
  return {
    title: t("title"),
    description: bio ? bio.slice(0, 160) : t("metaDescription"),
  };
}

export default async function AboutPage() {
  const [t, tNav, locale, site] = await Promise.all([
    getTranslations("About"),
    getTranslations("Nav"),
    getLocale(),
    getSiteContent(),
  ]);
  const local = (vi: string | null, en: string | null) => pickLocalized(locale, vi, en);
  const bio = local(site.bioVi, site.bioEn);

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-16 md:px-margin-desktop md:py-20">
      <section
        aria-labelledby="about-title"
        className={`grid items-start gap-10 md:gap-14 ${
          site.portrait ? "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : "max-w-3xl"
        }`}
      >
        {/* No portrait yet → no empty grey box; the text takes the width. */}
        {site.portrait ? (
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-surface-sunken">
            <Image
              src={site.portrait.url}
              alt={t("portraitAlt", { name: tNav("wordmark") })}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              {...(site.portrait.blurDataUrl
                ? { placeholder: "blur" as const, blurDataURL: site.portrait.blurDataUrl }
                : {})}
              preload
              className="object-cover"
            />
          </div>
        ) : null}

        <div>
          <h1 id="about-title" className="text-h1 text-ink">
            {t("title")}
          </h1>
          <div className="mt-6 space-y-4 text-body-lg text-ink">
            {(bio || t("bioPlaceholder")).split(/\n\s*\n/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-12">
            <Record
              newTabLabel={t("opensInNewTab")}
              sections={[
                { id: "exhibitions", title: t("exhibitions"), entries: parseRecord(local(site.exhibitionsVi, site.exhibitionsEn)) },
                { id: "awards", title: t("awards"), entries: parseRecord(local(site.awardsVi, site.awardsEn)) },
                { id: "press", title: t("press"), entries: parseRecord(local(site.pressVi, site.pressEn)) },
              ]}
            />
          </div>
        </div>
      </section>

      <div className="mt-20">
        <ContactLinks
          title={t("contactTitle")}
          intro={t("contactIntro")}
          email={site.email}
          facebookUrl={site.facebookUrl}
          zalo={site.zalo}
          labels={{ email: t("email"), facebook: t("facebook"), zalo: t("zalo"), empty: t("contactEmpty") }}
        />
      </div>
    </div>
  );
}
