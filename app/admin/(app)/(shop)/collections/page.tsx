// app/admin/(app)/collections/page.tsx — Story 2.3 collection list.

import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { listCollections } from "@/lib/server/collection";
import { deleteCollectionAction } from "./actions";

export default async function CollectionsPage() {
  await requireOperator();
  const collections = await listCollections();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-ink">Collections</h1>
        <Link
          href="/admin/collections/new"
          className="rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464]"
        >
          + New collection
        </Link>
      </div>

      {collections.length === 0 ? (
        <p className="text-body text-ink-muted">No collections yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {collections.map((c) => (
            <li key={c.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body text-ink">{c.nameEn}</p>
                <p className="truncate text-caption text-ink-muted">
                  {c.nameVi} · {c.productCount} product
                  {c.productCount === 1 ? "" : "s"}
                </p>
              </div>
              <Link
                href={`/admin/collections/${c.id}/edit`}
                className="rounded-full border border-border px-4 py-2 text-caption text-ink hover:bg-surface-sunken"
              >
                Edit
              </Link>
              <form action={deleteCollectionAction.bind(null, c.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-border px-4 py-2 text-caption text-error hover:bg-surface-sunken"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
