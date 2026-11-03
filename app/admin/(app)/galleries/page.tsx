// app/admin/(app)/galleries/page.tsx
//
// The operator's galleries — one flat list of categories (Birds, Sport &
// Events, Landscapes, …) in the order visitors see them. Portfolio-only
// revamp: no groups. The (app) layout guards the operator role (AD-9);
// requireOperator() here is belt-and-braces.

import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { listGalleries } from "@/lib/server/portfolio";
import { GalleryRowControls } from "./gallery-row-controls";

export default async function GalleriesPage() {
  await requireOperator();
  const galleries = await listGalleries();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-h2 text-ink">Galleries</h1>
          <p className="text-caption text-ink-muted">
            Each gallery is a category of work (e.g. Birds, Sport &amp; Events).
            Visitors see published galleries that have photos, in this order.
          </p>
        </div>
        <Link
          href="/admin/galleries/new"
          className="shrink-0 rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464]"
        >
          + New gallery
        </Link>
      </div>

      {galleries.length === 0 ? (
        <p className="text-body text-ink-muted">
          No galleries yet. Create one — for example “Birds” — then add photos to it.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {galleries.map((g, i) => (
            <li key={g.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body text-ink">{g.nameEn}</p>
                <p className="truncate text-caption text-ink-muted">
                  {g.nameVi} · {g.imageCount} photo{g.imageCount === 1 ? "" : "s"} · /work/{g.slug}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-caption ${
                  g.published ? "bg-sage-soft/20 text-sage-deep" : "bg-surface-sunken text-ink-muted"
                }`}
              >
                {g.published ? "Published" : "Draft"}
              </span>
              <GalleryRowControls
                id={g.id}
                name={g.nameEn}
                published={g.published}
                isFirst={i === 0}
                isLast={i === galleries.length - 1}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
