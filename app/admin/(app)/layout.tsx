import type { ReactNode } from "react";
import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { LogoutButton } from "@/components/logout-button";

// app/admin/(app)/layout.tsx
//
// Story 1.5, Task 4 (AC-3, AC-5) — the GUARDED admin shell. Everything
// under this route group requires the operator role; requireOperator()
// (lib/server/require-operator.ts) is the single shared check (AD-9) and
// redirects anyone else to /admin/login, which lives outside this group
// so it stays reachable (no redirect loop, AC-4).
//
// Nav items beyond Dashboard are placeholders — the actual management
// screens land in later epics/stories. They're rendered as inert labels
// (not links) so there's nothing 404-ing behind them yet.

// Products (2.1), Collections + Settings (2.3) are live; the rest arrive
// in later epics/stories.
const PLACEHOLDER_NAV = ["Orders", "Portfolio", "About"];

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
          <Link
            href="/admin"
            className="rounded-md px-3 py-2 text-caption text-ink transition-colors hover:bg-surface-sunken"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/products"
            className="rounded-md px-3 py-2 text-caption text-ink transition-colors hover:bg-surface-sunken"
          >
            Products
          </Link>

          <Link
            href="/admin/collections"
            className="rounded-md px-3 py-2 text-caption text-ink transition-colors hover:bg-surface-sunken"
          >
            Collections
          </Link>

          <Link
            href="/admin/settings"
            className="rounded-md px-3 py-2 text-caption text-ink transition-colors hover:bg-surface-sunken"
          >
            Settings
          </Link>

          {PLACEHOLDER_NAV.map((label) => (
            <span
              key={label}
              aria-disabled="true"
              className="cursor-not-allowed rounded-md px-3 py-2 text-caption text-ink-muted"
            >
              {label} <span className="text-caption-deep">(coming soon)</span>
            </span>
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
