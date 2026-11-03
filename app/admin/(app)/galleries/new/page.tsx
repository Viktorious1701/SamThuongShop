// app/admin/(app)/galleries/new/page.tsx — create a Gallery (a category of work).

import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { GalleryEditor } from "../gallery-editor";

export default async function NewGalleryPage() {
  await requireOperator();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link href="/admin/galleries" className="text-caption text-ink-muted hover:underline">
          ← Back to galleries
        </Link>
        <h1 className="text-h2 text-ink">New gallery</h1>
      </div>
      <GalleryEditor />
    </div>
  );
}
