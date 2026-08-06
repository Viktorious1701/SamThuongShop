import type { Metadata } from "next";
import { requireOperator } from "@/lib/server/require-operator";

// app/admin/(app)/page.tsx
//
// Story 1.5, Task 4 (AC-3) — dashboard landing placeholder. Real
// management screens (products, orders, collections, portfolio, about)
// arrive in later epics; this just proves the guarded shell renders for
// a signed-in operator.

export const metadata: Metadata = {
  title: "Dashboard — SamThuongShop Admin",
};

export default async function AdminDashboardPage() {
  const session = await requireOperator();

  return (
    <div className="space-y-4">
      <h1 className="text-h1 text-ink">Welcome, {session?.user?.email}</h1>
      <p className="text-body text-ink-muted">
        This is the operator dashboard placeholder. Product, order,
        collection, portfolio, and about management sections will be added
        in later epics — this shell just guards the route and gives them a
        home.
      </p>
    </div>
  );
}
