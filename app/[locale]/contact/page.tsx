import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Nav");
  return { title: t("contact") };
}

// Placeholder — the real Contact content/form lands in a later story.
// This stub only exists so the nav link resolves.
export default async function ContactPage() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-24 md:px-margin-desktop">
      <h1 className="text-h1 text-ink">{t("Nav.contact")}</h1>
      <p className="mt-4 max-w-2xl text-body text-ink-muted">
        {t("ComingSoon.note")}
      </p>
    </div>
  );
}
