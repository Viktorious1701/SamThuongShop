import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { resolveCart } from "@/lib/server/cart";
import { getStoreSettings } from "@/lib/server/settings";
import { formatVnd } from "@/lib/format";
import { CheckoutForm } from "./checkout-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Checkout");
  return { title: t("title") };
}

// Story 3.2 — checkout. Shows the server-computed summary + a details form.
// Shipping applies only when the cart has a physical print (AD-8); totals are
// recomputed here (and again in the order service) — never from the client.
export default async function CheckoutPage() {
  const locale = await getLocale();
  const [t, session, cart] = await Promise.all([
    getTranslations("Checkout"),
    auth(),
    resolveCart(locale),
  ]);

  if (cart.lines.length === 0) redirect(`/${locale}/cart`);

  const hasPhysical = cart.lines.some((l) => l.format === "PRINT");
  const shippingFeeVnd = hasPhysical
    ? (await getStoreSettings()).shippingFeeVnd
    : 0;
  const grandTotalVnd = cart.subtotalVnd + shippingFeeVnd;

  return (
    <div className="mx-auto max-w-max-content px-margin-mobile py-16 md:px-margin-desktop">
      <h1 className="text-h1 text-ink">{t("title")}</h1>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        {/* Details form */}
        <div className="space-y-6">
          <h2 className="text-h3 text-ink">{t("detailsHeading")}</h2>
          {session?.user ? (
            <p className="text-caption text-ink-muted">
              {t("signedInAs")} {session.user.email}
            </p>
          ) : null}
          <CheckoutForm hasPhysical={hasPhysical} signedIn={!!session?.user} />
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <h2 className="text-h3 text-ink">{t("summaryHeading")}</h2>
          <ul className="divide-y divide-border border-y border-border">
            {cart.lines.map((line) => (
              <li
                key={line.variantId}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="min-w-0 flex-1 truncate text-body text-ink">
                  {line.name}
                  <span className="text-caption text-ink-muted">
                    {" "}
                    · {line.label} × {line.qty}
                  </span>
                </span>
                <span className="text-body text-ink">
                  {formatVnd(line.lineTotalVnd)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1">
            <div className="flex justify-between text-caption text-ink-muted">
              <dt>{t("subtotal")}</dt>
              <dd>{formatVnd(cart.subtotalVnd)}</dd>
            </div>
            <div className="flex justify-between text-caption text-ink-muted">
              <dt>{t("shipping")}</dt>
              <dd>{hasPhysical ? formatVnd(shippingFeeVnd) : t("free")}</dd>
            </div>
            <div className="flex justify-between text-body text-ink">
              <dt>{t("grandTotal")}</dt>
              <dd className="text-h3">{formatVnd(grandTotalVnd)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
