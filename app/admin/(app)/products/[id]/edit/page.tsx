// app/admin/(app)/products/[id]/edit/page.tsx — Story 2.1, edit a Product.

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/server/require-operator";
import { getProduct } from "@/lib/server/product";
import { ProductEditor } from "../../product-editor";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperator();
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/admin/products"
          className="text-caption text-ink-muted hover:underline"
        >
          ← Back to products
        </Link>
        <h1 className="text-h2 text-ink">Edit product</h1>
      </div>
      <ProductEditor initial={product} productId={product.id} />
    </div>
  );
}
