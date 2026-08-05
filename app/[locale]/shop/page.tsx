import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Nav");
  return { title: t("shop") };
}

// Placeholder — the real Shop catalog (Products, Collections, search)
// lands in a later story. This stub only exists so the nav link resolves.
export default async function ShopPage() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-24 md:px-margin-desktop">
      <h1 className="text-h1 text-ink">{t("Nav.shop")}</h1>
      <p className="mt-4 max-w-2xl text-body text-ink-muted">
        {t("ComingSoon.note")}
      </p>
    </div>
  );
}
