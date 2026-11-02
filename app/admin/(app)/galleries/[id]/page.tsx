// app/admin/(app)/galleries/[id]/page.tsx
//
// Story 1.6 — edit one Gallery. A leaf gallery also gets the image manager;
// a group (has child galleries) lists its children instead, because groups
// can't hold images (D2).

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/server/require-operator";
import {
  getGalleryForEdit,
  listGalleryTree,
  listParentOptions,
} from "@/lib/server/portfolio";
import { listProductOptions } from "@/lib/server/product";
import { GalleryEditor } from "../gallery-editor";
import { ImageManager } from "./image-manager";

// Server Actions on this page resize full-resolution photos with sharp
// (processPortfolioImageAction); give them headroom past the platform default.
export const maxDuration = 60;

export default async function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperator();
  const { id } = await params;
  const gallery = await getGalleryForEdit(id);
  if (!gallery) notFound();

  const isGroup = gallery.childCount > 0;
  const [parents, products, tree] = await Promise.all([
    listParentOptions(gallery.id),
    isGroup ? Promise.resolve([]) : listProductOptions(),
    isGroup ? listGalleryTree() : Promise.resolve([]),
  ]);
  const children = isGroup ? (tree.find((g) => g.id === gallery.id)?.children ?? []) : [];

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <Link href="/admin/galleries" className="text-caption text-ink-muted hover:underline">
          ← Back to portfolio
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h2 text-ink">{gallery.nameEn}</h1>
          <span
            className={`rounded-full px-3 py-1 text-caption ${
              gallery.published
                ? "bg-sage-soft/20 text-sage-deep"
                : "bg-surface-sunken text-ink-muted"
            }`}
          >
            {gallery.published ? "Published" : "Draft"}
          </span>
        </div>
        <p className="text-caption text-ink-muted">
          Public page: /vi/portfolio/{gallery.slug} · /en/portfolio/{gallery.slug}
          {gallery.published ? "" : " (visible once published from the portfolio list)"}
        </p>
      </div>

      <GalleryEditor initial={gallery} parents={parents} />

      {isGroup ? (
        <section className="space-y-3">
          <h2 className="text-h3 text-ink">Galleries in this group</h2>
          <p className="text-caption text-ink-muted">
            Groups don’t hold images themselves — open a gallery below to add
            photos. Visitors see this group’s “View all” page combine them.
          </p>
          <ul className="divide-y divide-border rounded-md border border-border bg-surface">
            {children.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 p-4">
                <span className="text-body text-ink">
                  {c.nameEn}{" "}
                  <span className="text-caption text-ink-muted">
                    · {c.imageCount} image{c.imageCount === 1 ? "" : "s"}
                    {c.published ? "" : " · Draft"}
                  </span>
                </span>
                <Link
                  href={`/admin/galleries/${c.id}`}
                  className="rounded-full border border-border px-3 py-1.5 text-caption text-ink hover:bg-surface-sunken"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <ImageManager
          galleryId={gallery.id}
          initialImages={gallery.images}
          products={products}
        />
      )}
    </div>
  );
}
