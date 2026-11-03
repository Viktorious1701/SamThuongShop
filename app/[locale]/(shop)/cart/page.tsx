import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { resolveCart } from "@/lib/server/cart";
import { formatVnd } from "@/lib/format";
import { setQtyAction, removeLineAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Nav");
  return { title: t("cart") };
}

// Story 3.1 — the cart. Server component; every line + total is recomputed
// from the DB (cookie holds only variantId+qty). Qty/remove are server-action
// forms (work without JS). Shipping is a checkout concern (Story 3.2) — this
// shows the subtotal only.
export default async function CartPage() {
  const [t, locale] = await Promise.all([
    getTranslations("Cart"),
    getLocale(),
  ]);
  const cart = await resolveCart(locale);

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-max-content px-margin-mobile py-24 text-center md:px-margin-desktop">
        <h1 className="text-h2 text-ink">{t("title")}</h1>
        <p className="mt-4 text-body text-ink-muted">{t("empty")}</p>
        <div className="mt-8">
          <Link
            href="/shop"
            className="rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464]"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-16 md:px-margin-desktop">
      <h1 className="text-h1 text-ink">{t("title")}</h1>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {cart.lines.map((line) => (
          <li
            key={line.variantId}
            className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-border bg-surface-sunken">
              {line.imageUrl ? (
                <Image
                  src={line.imageUrl}
                  alt={line.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/shop/${line.productSlug}`}
                className="text-body text-ink hover:underline"
              >
                {line.name}
              </Link>
              <p className="text-caption text-ink-muted">{line.label}</p>
              <p className="text-caption text-ink-muted">
                {formatVnd(line.unitPriceVnd)}
              </p>
            </div>

            {/* Quantity: prints adjustable; digital fixed at 1 */}
            {line.format === "DIGITAL" ? (
              <div className="text-caption text-ink-muted sm:w-40">
                <span className="mr-2 inline-block rounded-md border border-border px-3 py-1 text-ink">
                  1
                </span>
                {t("digitalFixed")}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:w-40">
                <form
                  action={setQtyAction.bind(
                    null,
                    line.variantId,
                    line.qty - 1,
                  )}
                >
                  <button
                    type="submit"
                    aria-label={t("decrease")}
                    className="h-8 w-8 rounded-md border border-ink-muted text-ink hover:bg-surface-sunken"
                  >
                    −
                  </button>
                </form>
                <span className="w-8 text-center text-body text-ink">
                  {line.qty}
                </span>
                <form
                  action={setQtyAction.bind(
                    null,
                    line.variantId,
                    line.qty + 1,
                  )}
                >
                  <button
                    type="submit"
                    aria-label={t("increase")}
                    className="h-8 w-8 rounded-md border border-ink-muted text-ink hover:bg-surface-sunken"
                  >
                    +
                  </button>
                </form>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 sm:w-40 sm:justify-end">
              <span className="text-body text-ink">
                {formatVnd(line.lineTotalVnd)}
              </span>
              <form action={removeLineAction.bind(null, line.variantId)}>
                <button
                  type="submit"
                  className="text-caption text-error hover:underline"
                >
                  {t("remove")}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex w-full max-w-xs items-center justify-between">
          <span className="text-body text-ink-muted">{t("subtotal")}</span>
          <span className="text-h3 text-ink">{formatVnd(cart.subtotalVnd)}</span>
        </div>
        <p className="text-caption text-ink-muted">{t("shippingNote")}</p>
        <Link
          href="/checkout"
          className="block w-full max-w-xs rounded-full bg-sky-deep px-5 py-3 text-center text-caption text-white transition-colors hover:bg-[#3D5464]"
        >
          {t("checkout")}
        </Link>
      </div>
    </div>
  );
}
