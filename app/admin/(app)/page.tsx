import type { Metadata } from "next";
import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { listGalleries } from "@/lib/server/portfolio";

// app/admin/(app)/page.tsx
//
// Admin home. Portfolio-only revamp: the operator manages exactly two things
// — Galleries (with their photos) and Site (Home, About, contact).

export const metadata: Metadata = {
  title: "Dashboard — Sâm Thương Admin",
};

export default async function AdminDashboardPage() {
  const session = await requireOperator();
  const galleries = await listGalleries();
  const published = galleries.filter((g) => g.published).length;
  const photos = galleries.reduce((n, g) => n + g.imageCount, 0);

  const cards = [
    {
      href: "/admin/galleries",
      title: "Galleries",
      body: `${galleries.length} galleries (${published} published) · ${photos} photos. Add photos, write captions, mark favourites as Featured.`,
    },
    {
      href: "/admin/site",
      title: "Site",
      body: "Home photo and tagline, your biography and portrait, exhibitions/awards/press, and contact details.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-h2 text-ink">Welcome</h1>
        <p className="text-caption text-ink-muted">Signed in as {session?.user?.email}</p>
      </div>
      <ul className="grid gap-6 md:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block h-full space-y-2 rounded-md border border-border bg-surface p-6 transition-colors hover:bg-surface-sunken"
            >
              <h2 className="text-h3 text-ink">{c.title} →</h2>
              <p className="text-body text-ink-muted">{c.body}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-caption text-ink-muted">
        <a href="/vi" target="_blank" rel="noreferrer" className="underline">
          View the public site ↗
        </a>
      </p>
    </div>
  );
}
