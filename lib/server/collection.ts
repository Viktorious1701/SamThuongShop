// lib/server/collection.ts
//
// All Collection Prisma access (AD-2 — one service module per aggregate).
// Collections are many-to-many with Product (implicit join). Mirrors the
// conventions in lib/server/product.ts (DTOs, result unions, P2002, slugify).

import { prisma } from "@/lib/server/db";
import type { CollectionInput } from "@/lib/validation/collection-schemas";

export type CollectionListItem = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  productCount: number;
};

export type CollectionDTO = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  productIds: string[];
};

export type SaveCollectionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function slugify(nameEn: string): string {
  const base = nameEn
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "collection"}-${suffix}`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function listCollections(): Promise<CollectionListItem[]> {
  const rows = await prisma.collection.findMany({
    orderBy: { nameEn: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameVi: c.nameVi,
    nameEn: c.nameEn,
    productCount: c._count.products,
  }));
}

export async function getCollection(id: string): Promise<CollectionDTO | null> {
  const c = await prisma.collection.findUnique({
    where: { id },
    include: { products: { select: { id: true } } },
  });
  if (!c) return null;
  return {
    id: c.id,
    slug: c.slug,
    nameVi: c.nameVi,
    nameEn: c.nameEn,
    descriptionVi: c.descriptionVi,
    descriptionEn: c.descriptionEn,
    productIds: c.products.map((p) => p.id),
  };
}

export async function createCollection(
  input: CollectionInput,
): Promise<SaveCollectionResult> {
  try {
    const c = await prisma.collection.create({
      data: {
        slug: slugify(input.nameEn),
        nameVi: input.nameVi,
        nameEn: input.nameEn,
        descriptionVi: input.descriptionVi ?? null,
        descriptionEn: input.descriptionEn ?? null,
        products: { connect: input.productIds.map((id) => ({ id })) },
      },
    });
    return { ok: true, id: c.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: "A collection with that slug already exists." };
    }
    throw error;
  }
}

export async function updateCollection(
  id: string,
  input: CollectionInput,
): Promise<SaveCollectionResult> {
  const existing = await prisma.collection.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Collection not found." };

  await prisma.collection.update({
    where: { id },
    data: {
      nameVi: input.nameVi,
      nameEn: input.nameEn,
      descriptionVi: input.descriptionVi ?? null,
      descriptionEn: input.descriptionEn ?? null,
      // `set` replaces the membership wholesale with the incoming ids.
      products: { set: input.productIds.map((pid) => ({ id: pid })) },
    },
  });
  return { ok: true, id };
}

export async function deleteCollection(id: string): Promise<void> {
  // The implicit join rows are removed automatically; Products are untouched.
  await prisma.collection.delete({ where: { id } });
}
