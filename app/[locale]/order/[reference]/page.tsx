import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getOrderByReference } from "@/lib/server/order";
import { formatVnd } from "@/lib/format";

type Params = { params: Promise<{ reference: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { reference } = await params;
  const t = await getTranslations("Checkout");
  return { title: `${t("orderTitle")} ${reference}` };
}

// Story 3.2 — post-checkout summary. Payment selection (payОS / COD) lands in
// Stories 3.3/3.4; the polished confirmation + email + status pill in 3.5.
export default async function OrderPage({ params }: Params) {
  const { reference } = await params;
  const t = await getTranslations("Checkout");
  const order = await getOrderByReference(reference);

  if (!order) {
    return (
      <div className="mx-auto max-w-max-content px-margin-mobile py-24 text-center md:px-margin-desktop">
        <h1 className="text-h2 text-ink">{t("orderNotFoundTitle")}</h1>
        <p className="mx-auto mt-4 max-w-md text-body text-ink-muted">
          {t("orderNotFoundBody")}
        </p>
        <div className="mt-8">
          <Link
            href="/shop"
            className="rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464]"
          >
            {t("backToShop")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-margin-mobile py-16 md:px-margin-desktop">
      <p className="text-caption text-sage-deep">{t("orderPlaced")}</p>
      <h1 className="mt-1 text-h1 text-ink">
        {t("orderTitle")} {order.reference}
      </h1>
      <p className="mt-2 text-body text-ink-muted">
        {t("statusLabel")}: {t(`status_${order.status}`)}
      </p>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {order.lines.map((line, i) => (
          <li key={i} className="flex items-center justify-between gap-4 py-3">
            <span className="min-w-0 flex-1 truncate text-body text-ink">
              {line.productName}
              <span className="text-caption text-ink-muted">
                {" "}
                ({t(`format_${line.format}`)}) × {line.qty}
              </span>
            </span>
            <span className="text-body text-ink">
              {formatVnd(line.lineTotalVnd)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-1">
        <div className="flex justify-between text-caption text-ink-muted">
          <dt>{t("subtotal")}</dt>
          <dd>{formatVnd(order.subtotalVnd)}</dd>
        </div>
        <div className="flex justify-between text-caption text-ink-muted">
          <dt>{t("shipping")}</dt>
          <dd>
            {order.hasPhysical ? formatVnd(order.shippingFeeVnd) : t("free")}
          </dd>
        </div>
        <div className="flex justify-between text-body text-ink">
          <dt>{t("grandTotal")}</dt>
          <dd className="text-h3">{formatVnd(order.grandTotalVnd)}</dd>
        </div>
      </dl>

      {order.shipping ? (
        <div className="mt-6 rounded-md border border-border bg-surface p-4">
          <p className="text-caption text-ink-muted">{t("shipTo")}</p>
          <p className="text-body text-ink">{order.shipping.name}</p>
          <p className="text-caption text-ink-muted">
            {order.shipping.phone} · {order.shipping.address},{" "}
            {order.shipping.city}
          </p>
        </div>
      ) : null}

      <div className="mt-8 rounded-md border border-border bg-surface-sunken p-4">
        <p className="text-caption text-ink">{t("paymentNextTitle")}</p>
        <p className="mt-1 text-caption text-ink-muted">
          {t("paymentNextBody")}
        </p>
      </div>

      <div className="mt-8">
        <Link
          href="/shop"
          className="text-caption text-ink-muted hover:underline"
        >
          ← {t("backToShop")}
        </Link>
      </div>
    </div>
  );
}
