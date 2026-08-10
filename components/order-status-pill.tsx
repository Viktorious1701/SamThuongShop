// components/order-status-pill.tsx
//
// A shared order-status badge. Accessibility: the state is conveyed by the
// ink LABEL, not colour alone — the coloured dot is decorative (aria-hidden).
// The caller supplies the label so this works both on the bilingual storefront
// (translated `Checkout.status_*`) and in the English-only admin.

import type { OrderStatus } from "@/lib/generated/prisma/enums";

const DOT: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-pending",
  PAID: "bg-info",
  PROCESSING: "bg-sky-soft",
  SHIPPED: "bg-sage-soft",
  COMPLETED: "bg-success",
  CANCELLED: "bg-error",
};

// English labels for the admin (English-only). The storefront passes its own
// translated label instead.
export const ORDER_STATUS_LABEL_EN: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function OrderStatusPill({
  status,
  label,
}: {
  status: OrderStatus;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-caption text-ink">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${DOT[status]}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
