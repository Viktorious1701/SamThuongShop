// app/admin/(app)/collections/new/page.tsx — Story 2.3, create a collection.

import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { listProducts } from "@/lib/server/product";
import { CollectionEditor } from "../collection-editor";

export default async function NewCollectionPage() {
  await requireOperator();
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/admin/collections"
          className="text-caption text-ink-muted hover:underline"
        >
          ← Back to collections
        </Link>
        <h1 className="text-h2 text-ink">New collection</h1>
      </div>
      <CollectionEditor
        products={products.map((p) => ({ id: p.id, name: p.nameEn }))}
      />
    </div>
  );
}
