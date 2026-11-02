// app/admin/(app)/galleries/new/page.tsx — Story 1.6, create a Gallery.

import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { listParentOptions } from "@/lib/server/portfolio";
import { GalleryEditor } from "../gallery-editor";

export default async function NewGalleryPage() {
  await requireOperator();
  const parents = await listParentOptions();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link href="/admin/galleries" className="text-caption text-ink-muted hover:underline">
          ← Back to portfolio
        </Link>
        <h1 className="text-h2 text-ink">New gallery</h1>
        <p className="text-caption text-ink-muted">
          To make a group (e.g. “Chim Việt Nam”), create it with no group, then
          create galleries and choose it as their group.
        </p>
      </div>
      <GalleryEditor parents={parents} />
    </div>
  );
}
