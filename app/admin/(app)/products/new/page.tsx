// app/admin/(app)/products/new/page.tsx — Story 2.1, create a Product.

import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { ProductEditor } from "../product-editor";

export default async function NewProductPage() {
  await requireOperator();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/admin/products"
          className="text-caption text-ink-muted hover:underline"
        >
          ← Back to products
        </Link>
        <h1 className="text-h2 text-ink">New product</h1>
      </div>
      <ProductEditor />
    </div>
  );
}
