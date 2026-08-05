import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HomePage");
  return { title: t("heading") };
}

// Placeholder home page (Story 1.3 — bilingual shell only). The real
// image-led hero + featured Products/Collections/portfolio teaser land in a
// later story.
export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <div className="mx-auto flex max-w-max-content flex-col items-center gap-4 px-margin-mobile py-24 text-center md:px-margin-desktop">
      <h1 className="text-display text-ink">{t("heading")}</h1>
      <p className="max-w-2xl text-body-lg text-ink-muted">
        {t("subheading")}
      </p>
      <p className="text-caption text-ink-muted">{t("placeholder")}</p>
    </div>
  );
}
