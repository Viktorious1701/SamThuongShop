// app/admin/(app)/orders/page.tsx
//
// Story 4.1 — operator order list. The (app) group layout guards the operator
// role (AD-9); requireOperator() here is belt-and-braces. Newest first; each
// row links to the detail screen where status is advanced.

import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { listOrders } from "@/lib/server/order";
import { formatVnd } from "@/lib/format";
import {
  OrderStatusPill,
  ORDER_STATUS_LABEL_EN,
} from "@/components/order-status-pill";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

export default async function OrdersPage() {
  await requireOperator();
  const orders = await listOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-body text-ink-muted">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-border text-caption text-ink-muted">
              <tr>
                <th className="p-3 font-normal">Order</th>
                <th className="p-3 font-normal">Status</th>
                <th className="p-3 font-normal">Payment</th>
                <th className="p-3 font-normal">Customer</th>
                <th className="p-3 font-normal">Items</th>
                <th className="p-3 text-right font-normal">Total</th>
                <th className="p-3 font-normal">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="align-middle">
                  <td className="p-3">
                    <Link
                      href={`/admin/orders/${o.reference}`}
                      className="text-body text-sky-deep hover:underline"
                    >
                      {o.reference}
                    </Link>
                    {o.hasPhysical && o.shipCity ? (
                      <span className="block text-caption text-ink-muted">
                        {o.shipCity}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <OrderStatusPill
                      status={o.status}
                      label={ORDER_STATUS_LABEL_EN[o.status]}
                    />
                  </td>
                  <td className="p-3 text-caption text-ink">
                    {o.paymentMethod === "COD" ? "COD" : "VietQR"}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-caption ${
                        o.isPaid
                          ? "bg-sage-soft/20 text-sage-deep"
                          : "bg-surface-sunken text-ink-muted"
                      }`}
                    >
                      {o.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="p-3 text-caption text-ink">{o.customerEmail}</td>
                  <td className="p-3 text-caption text-ink-muted">
                    {o.itemCount}
                  </td>
                  <td className="p-3 text-right text-body text-ink">
                    {formatVnd(o.grandTotalVnd)}
                  </td>
                  <td className="p-3 text-caption text-ink-muted">
                    {DATE_FMT.format(o.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
