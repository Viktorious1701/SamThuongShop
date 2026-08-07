import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedProductBySlug } from "@/lib/server/product";
import { pickLocalized } from "@/lib/format";
import { VariantSelector } from "./variant-selector";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [product, locale] = await Promise.all([
    getPublishedProductBySlug(slug),
    getLocale(),
  ]);
  if (!product) return {};
  return { title: pickLocalized(locale, product.nameVi, product.nameEn) };
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const [t, locale, product] = await Promise.all([
    getTranslations("Product"),
    getLocale(),
    getPublishedProductBySlug(slug),
  ]);

  // Calm "unavailable" state instead of a raw 404 (part of Story 2.6).
  if (!product) {
    return (
      <div className="mx-auto max-w-max-content px-margin-mobile py-24 text-center md:px-margin-desktop">
        <h1 className="text-h2 text-ink">{t("unavailableTitle")}</h1>
        <p className="mx-auto mt-4 max-w-md text-body text-ink-muted">
          {t("unavailableBody")}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464]"
          >
            {t("backToShop")}
          </Link>
          <Link
            href="/portfolio"
            className="rounded-full border border-border px-5 py-3 text-caption text-ink transition-colors hover:bg-surface-sunken"
          >
            {t("viewPortfolio")}
          </Link>
        </div>
      </div>
    );
  }

  const name = pickLocalized(locale, product.nameVi, product.nameEn);
  const description = pickLocalized(
    locale,
    product.descriptionVi,
    product.descriptionEn,
  );
  const hero = product.images[0] ?? null;

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-16 md:px-margin-desktop">
      <Link
        href="/shop"
        className="text-caption text-ink-muted hover:underline"
      >
        ← {t("backToShop")}
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        {/* Image (left) */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-border bg-surface-sunken">
            {hero ? (
              <Image
                src={hero.url}
                alt={hero.alt ?? name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : null}
          </div>
        </div>

        {/* Buy panel (right) */}
        <div className="space-y-6">
          <h1 className="text-h1 text-ink">{name}</h1>
          {description ? (
            <div className="space-y-1">
              <p className="text-body text-ink-muted whitespace-pre-line">
                {description}
              </p>
            </div>
          ) : null}

          <VariantSelector
            variants={product.variants}
            labels={{
              printSizes: t("printSizes"),
              digitalTiers: t("digitalTiers"),
              price: t("price"),
              madeToOrder: t("madeToOrder"),
              digitalNote: t("digitalNote"),
              license: t("license"),
              watermarkBadge: t("watermarkBadge"),
              addToCart: t("addToCart"),
              addToCartSoon: t("addToCartSoon"),
            }}
          />
        </div>
      </div>
    </div>
  );
}
