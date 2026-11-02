// app/admin/(app)/orders/[reference]/page.tsx
//
// Story 4.1/4.2 — operator order detail + fulfilment controls. Reads the full
// order (snapshot lines, shipping, payment) and renders guarded transition
// forms. The service enforces the atomic compare-and-set; this screen only
// offers the legal next step for the current status.

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { getOrderForAdmin } from "@/lib/server/order";
import { formatVnd } from "@/lib/format";
import {
  OrderStatusPill,
  ORDER_STATUS_LABEL_EN,
} from "@/components/order-status-pill";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import {
  advanceStatusAction,
  recordShipmentAction,
  markPaidAction,
} from "../actions";

type Params = { params: Promise<{ reference: string }> };

// Label for the single "advance" button per status (PROCESSING is handled by
// the shipment form instead, so it's intentionally absent here).
const ADVANCE_LABEL: Partial<Record<OrderStatus, string>> = {
  PAID: "Mark processing",
  SHIPPED: "Mark completed",
};

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" });

const btn =
  "rounded-full bg-sky-deep px-5 py-2.5 text-caption text-white transition-colors hover:bg-[#3D5464]";

export default async function OrderDetailPage({ params }: Params) {
  await requireOperator();
  const { reference } = await params;
  const order = await getOrderForAdmin(reference);
  if (!order) notFound();

  const status = order.status as OrderStatus;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link
          href="/admin/orders"
          className="text-caption text-ink-muted hover:underline"
        >
          ← Orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-h2 text-ink">Order {order.reference}</h1>
          <OrderStatusPill status={status} label={ORDER_STATUS_LABEL_EN[status]} />
        </div>
        <p className="mt-1 text-caption text-ink-muted">
          Placed {DATE_FMT.format(order.createdAt)} · {order.customerEmail}
        </p>
      </div>

      {/* Fulfilment controls */}
      <section className="space-y-4 rounded-md border border-border bg-surface p-5">
        <h2 className="text-h3 text-ink">Fulfilment</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-caption text-ink-muted">
            Payment: {order.paymentMethod === "COD" ? "Cash on delivery" : "VietQR"} ·{" "}
            {order.isPaid ? "Paid" : "Unpaid"}
            {order.paidAt ? ` (${DATE_FMT.format(order.paidAt)})` : ""}
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {!order.isPaid ? (
            <form action={markPaidAction.bind(null, order.id, order.reference)}>
              <button type="submit" className={btn}>
                Mark paid
              </button>
            </form>
          ) : null}

          {status === "PROCESSING" ? (
            <form
              action={recordShipmentAction.bind(null, order.id, order.reference)}
              className="flex flex-wrap items-end gap-3"
            >
              <label className="flex flex-col gap-1">
                <span className="text-caption text-ink-muted">
                  Tracking note (optional)
                </span>
                <input
                  type="text"
                  name="trackingNote"
                  className="rounded-md border border-border bg-surface px-3 py-2 text-caption text-ink"
                  placeholder="Carrier / tracking #"
                />
              </label>
              <button type="submit" className={btn}>
                Mark shipped
              </button>
            </form>
          ) : ADVANCE_LABEL[status] ? (
            <form
              action={advanceStatusAction.bind(null, order.id, status, order.reference)}
            >
              <button type="submit" className={btn}>
                {ADVANCE_LABEL[status]}
              </button>
            </form>
          ) : null}
        </div>

        {order.trackingNote ? (
          <p className="text-caption text-ink-muted">
            Shipment: {order.trackingNote}
          </p>
        ) : null}
      </section>

      {/* Lines */}
      <section className="space-y-3">
        <h2 className="text-h3 text-ink">Items</h2>
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {order.lines.map((line, i) => (
            <li key={i} className="flex items-center justify-between gap-4 p-4">
              <span className="min-w-0 flex-1 truncate text-body text-ink">
                {line.productName}
                <span className="text-caption text-ink-muted">
                  {" "}
                  ({line.format}) × {line.qty}
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
            <dt>Subtotal</dt>
            <dd>{formatVnd(order.subtotalVnd)}</dd>
          </div>
          <div className="flex justify-between text-caption text-ink-muted">
            <dt>Shipping</dt>
            <dd>{formatVnd(order.shippingFeeVnd)}</dd>
          </div>
          <div className="flex justify-between text-body text-ink">
            <dt>Total</dt>
            <dd className="text-h3">{formatVnd(order.grandTotalVnd)}</dd>
          </div>
        </dl>
      </section>

      {/* Shipping address */}
      {order.shipping ? (
        <section className="space-y-1 rounded-md border border-border bg-surface p-5">
          <h2 className="text-h3 text-ink">Ship to</h2>
          <p className="text-body text-ink">{order.shipping.name}</p>
          <p className="text-caption text-ink-muted">
            {order.shipping.phone} · {order.shipping.address},{" "}
            {order.shipping.city}
          </p>
        </section>
      ) : null}
    </div>
  );
}
