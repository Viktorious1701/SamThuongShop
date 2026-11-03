// app/admin/(app)/collections/[id]/edit/page.tsx — Story 2.3, edit a collection.

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/server/require-operator";
import { getCollection } from "@/lib/server/collection";
import { listProducts } from "@/lib/server/product";
import { CollectionEditor } from "../../collection-editor";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperator();
  const { id } = await params;
  const [collection, products] = await Promise.all([
    getCollection(id),
    listProducts(),
  ]);
  if (!collection) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/admin/collections"
          className="text-caption text-ink-muted hover:underline"
        >
          ← Back to collections
        </Link>
        <h1 className="text-h2 text-ink">Edit collection</h1>
      </div>
      <CollectionEditor
        initial={collection}
        collectionId={collection.id}
        products={products.map((p) => ({ id: p.id, name: p.nameEn }))}
      />
    </div>
  );
}
