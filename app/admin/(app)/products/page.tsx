// app/admin/(app)/products/page.tsx
//
// Story 2.1 — operator product list. The (app) group layout already guards
// on the operator role (AD-9); requireOperator() here is belt-and-braces.
// Publish-toggle and delete are bound Server Actions submitted as tiny forms.

import Link from "next/link";
import Image from "next/image";
import { requireOperator } from "@/lib/server/require-operator";
import { listProducts } from "@/lib/server/product";
import { togglePublished, deleteProductAction } from "./actions";

export default async function ProductsPage() {
  await requireOperator();
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464]"
        >
          + New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-body text-ink-muted">
          No products yet. Create your first one.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-4 p-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-surface-sunken">
                {p.primaryImageUrl ? (
                  <Image
                    src={p.primaryImageUrl}
                    alt={p.nameEn}
                    width={56}
                    height={56}
                    className="h-14 w-14 object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-body text-ink">{p.nameEn}</p>
                <p className="truncate text-caption text-ink-muted">
                  {p.nameVi} · {p.variantCount} variant
                  {p.variantCount === 1 ? "" : "s"}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-caption ${
                  p.published
                    ? "bg-sage-soft/20 text-sage-deep"
                    : "bg-surface-sunken text-ink-muted"
                }`}
              >
                {p.published ? "Published" : "Draft"}
              </span>

              <Link
                href={`/admin/products/${p.id}/edit`}
                className="rounded-full border border-border px-4 py-2 text-caption text-ink hover:bg-surface-sunken"
              >
                Edit
              </Link>

              <form action={togglePublished.bind(null, p.id, !p.published)}>
                <button
                  type="submit"
                  className="rounded-full border border-border px-4 py-2 text-caption text-ink hover:bg-surface-sunken"
                >
                  {p.published ? "Unpublish" : "Publish"}
                </button>
              </form>

              <form action={deleteProductAction.bind(null, p.id)}>
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
