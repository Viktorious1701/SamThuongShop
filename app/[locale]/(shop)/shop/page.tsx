import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { listPublishedProducts, type ProductFormats } from "@/lib/server/product";
import { formatVnd, pickLocalized } from "@/lib/format";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Nav");
  return { title: t("shop") };
}

// Story 2.4 — browse the catalog. Lists all published Products as cards in
// the airy editorial grid. Collection grouping/filter arrives with Story 2.3.
export default async function ShopPage() {
  const [t, locale, products] = await Promise.all([
    getTranslations("Shop"),
    getLocale(),
    listPublishedProducts(),
  ]);

  const tagFor = (formats: ProductFormats) =>
    formats === "BOTH"
      ? t("tagBoth")
      : formats === "DIGITAL"
        ? t("tagDigital")
        : t("tagPrint");

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-16 md:px-margin-desktop">
      <h1 className="text-h1 text-ink">{t("title")}</h1>

      {products.length === 0 ? (
        <p className="mt-6 text-body text-ink-muted">{t("empty")}</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const title = pickLocalized(locale, p.nameVi, p.nameEn);
            const other = locale === "en" ? p.nameVi : p.nameEn;
            return (
              <li key={p.slug}>
                <ProductCard
                  href={`/shop/${p.slug}`}
                  imageUrl={p.imageUrl}
                  imageAlt={title}
                  title={title}
                  sub={other && other !== title ? other : ""}
                  tagLabel={tagFor(p.formats)}
                  priceLabel={`${t("fromPrice")} ${formatVnd(p.fromPriceVnd)}`}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
