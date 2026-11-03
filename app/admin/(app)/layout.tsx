import type { ReactNode } from "react";
import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { LogoutButton } from "@/components/logout-button";
import { shopEnabled } from "@/lib/server/shop-config";

// app/admin/(app)/layout.tsx
//
// Story 1.5, Task 4 (AC-3, AC-5) — the GUARDED admin shell. Everything
// under this route group requires the operator role; requireOperator()
// (lib/server/require-operator.ts) is the single shared check (AD-9) and
// redirects anyone else to /admin/login, which lives outside this group
// so it stays reachable (no redirect loop, AC-4).
//
// Portfolio-only revamp (R2): the operator manages two things — Galleries
// (with their photos) and Site (hero, About, contact). The shop's screens
// only appear when SHOP_ENABLED is on (their routes 404 otherwise).
const MENU = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/galleries", label: "Galleries" },
  { href: "/admin/site", label: "Site" },
];
const SHOP_MENU = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/settings", label: "Shop settings" },
];

export default async function AdminAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireOperator();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <div className="border-b border-border p-gutter">
          <span className="text-h3 text-ink">Admin</span>
        </div>

        <nav aria-label="Admin sections" className="flex flex-1 flex-col gap-1 p-4">
          {[...MENU, ...(shopEnabled() ? SHOP_MENU : [])].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-caption text-ink transition-colors hover:bg-surface-sunken"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-margin-mobile py-4 md:px-margin-desktop">
          <span className="text-h3 text-ink">SamThuongShop Admin</span>

          <div className="flex items-center gap-4">
            <span className="text-caption text-ink-muted">
              {session?.user?.email}
            </span>
            <LogoutButton className="rounded-full border border-border px-4 py-2 text-caption text-ink transition-colors hover:bg-surface-sunken">
              Logout
            </LogoutButton>
          </div>
        </header>

        <main className="flex-1 bg-bg-page px-margin-mobile py-8 md:px-margin-desktop">
          {children}
        </main>
      </div>
    </div>
  );
}
