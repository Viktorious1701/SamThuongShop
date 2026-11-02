// app/admin/(app)/galleries/[id]/page.tsx
//
// Edit one Gallery: its name/description, then its photos (upload, caption,
// Featured, order, delete).

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/server/require-operator";
import { getGalleryForEdit } from "@/lib/server/portfolio";
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

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <Link href="/admin/galleries" className="text-caption text-ink-muted hover:underline">
          ← Back to galleries
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h2 text-ink">{gallery.nameEn}</h1>
          <span
            className={`rounded-full px-3 py-1 text-caption ${
              gallery.published ? "bg-sage-soft/20 text-sage-deep" : "bg-surface-sunken text-ink-muted"
            }`}
          >
            {gallery.published ? "Published" : "Draft"}
          </span>
        </div>
        <p className="text-caption text-ink-muted">
          Public page: /vi/work/{gallery.slug} · /en/work/{gallery.slug}
          {gallery.published ? "" : " (visible once published from the galleries list)"}
        </p>
      </div>

      <GalleryEditor initial={gallery} />

      <ImageManager galleryId={gallery.id} initialImages={gallery.images} />
    </div>
  );
}
