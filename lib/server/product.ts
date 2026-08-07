// lib/server/product.ts
//
// All Product/ProductVariant/ProductImage Prisma access lives here (AD-2 —
// one service module per aggregate; only lib/server imports Prisma). Admin
// Server Actions delegate here. Prices stay integer VND (AD-5); content is
// stored per-locale (AD-7). Object keys are owned by the DB row (AD-15) —
// on delete/update we clean up the R2 objects they reference.

import { prisma } from "@/lib/server/db";
import { deleteObject, publicUrl } from "@/lib/server/storage";
import type { ProductInput } from "@/lib/validation/product-schemas";

export type ProductImageDTO = {
  key: string;
  url: string;
  alt: string | null;
  position: number;
};

export type ProductVariantDTO = {
  format: "PRINT" | "DIGITAL";
  label: string;
  priceVnd: number;
  position: number;
  originalKey: string | null;
  originalFilename: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  previewKey: string | null;
  previewUrl: string | null;
};

export type ProductDTO = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  published: boolean;
  images: ProductImageDTO[];
  variants: ProductVariantDTO[];
};

export type ProductListItem = {
  id: string;
  nameEn: string;
  nameVi: string;
  slug: string;
  published: boolean;
  variantCount: number;
  primaryImageUrl: string | null;
};

export type SaveProductResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

// --- Storefront (client-safe) DTOs ---------------------------------------
// These NEVER carry private original fields (originalKey/filename/contentType)
// — the sellable file must not leak before purchase (AD-6/AD-15). Only the
// public preview URL is exposed for digital variants.

export type ProductFormats = "PRINT" | "DIGITAL" | "BOTH";

export type StorefrontCard = {
  slug: string;
  nameVi: string;
  nameEn: string;
  imageUrl: string | null;
  fromPriceVnd: number;
  formats: ProductFormats;
};

export type StorefrontVariant = {
  id: string;
  format: "PRINT" | "DIGITAL";
  label: string;
  priceVnd: number;
  previewUrl: string | null;
};

// A single variant resolved for the cart — server-authoritative price/format
// + the data needed to render a cart line (public image only).
export type CartVariant = {
  id: string;
  productSlug: string;
  nameVi: string;
  nameEn: string;
  format: "PRINT" | "DIGITAL";
  label: string;
  priceVnd: number;
  imageUrl: string | null;
};

export type StorefrontProduct = {
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  images: { url: string; alt: string | null }[];
  variants: StorefrontVariant[];
};

function deriveFormats(formats: ("PRINT" | "DIGITAL")[]): ProductFormats {
  const hasPrint = formats.includes("PRINT");
  const hasDigital = formats.includes("DIGITAL");
  if (hasPrint && hasDigital) return "BOTH";
  return hasDigital ? "DIGITAL" : "PRINT";
}

// --- helpers --------------------------------------------------------------

/** URL-safe slug from the English name; a short random suffix guarantees
 * uniqueness without a collision-retry loop. */
function slugify(nameEn: string): string {
  const base = nameEn
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "product"}-${suffix}`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

/** Maps validated input variants to Prisma create rows. */
function toVariantRows(variants: ProductInput["variants"]) {
  return variants.map((v, index) => ({
    format: v.format,
    label: v.label,
    priceVnd: v.priceVnd,
    position: v.position ?? index,
    originalKey: v.format === "DIGITAL" ? v.originalKey : null,
    originalFilename: v.format === "DIGITAL" ? v.originalFilename ?? null : null,
    contentType: v.format === "DIGITAL" ? v.contentType ?? null : null,
    sizeBytes: v.format === "DIGITAL" ? v.sizeBytes ?? null : null,
    previewKey: v.format === "DIGITAL" ? v.previewKey ?? null : null,
  }));
}

function toImageRows(images: ProductInput["images"]) {
  return images.map((img, index) => ({
    key: img.key,
    alt: img.alt ?? null,
    position: img.position ?? index,
  }));
}

// --- reads ----------------------------------------------------------------

export async function listProducts(): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      _count: { select: { variants: true } },
    },
  });

  return rows.map((p) => ({
    id: p.id,
    nameEn: p.nameEn,
    nameVi: p.nameVi,
    slug: p.slug,
    published: p.published,
    variantCount: p._count.variants,
    primaryImageUrl: p.images[0] ? publicUrl(p.images[0].key) : null,
  }));
}

export async function getProduct(id: string): Promise<ProductDTO | null> {
  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });
  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    nameVi: p.nameVi,
    nameEn: p.nameEn,
    descriptionVi: p.descriptionVi,
    descriptionEn: p.descriptionEn,
    published: p.published,
    images: p.images.map((img) => ({
      key: img.key,
      url: publicUrl(img.key),
      alt: img.alt,
      position: img.position,
    })),
    variants: p.variants.map((v) => ({
      format: v.format,
      label: v.label,
      priceVnd: v.priceVnd,
      position: v.position,
      originalKey: v.originalKey,
      originalFilename: v.originalFilename,
      contentType: v.contentType,
      sizeBytes: v.sizeBytes,
      previewKey: v.previewKey,
      previewUrl: v.previewKey ? publicUrl(v.previewKey) : null,
    })),
  };
}

// --- storefront reads (published-only, client-safe) -----------------------

export async function listPublishedProducts(): Promise<StorefrontCard[]> {
  const rows = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { select: { format: true, priceVnd: true } },
    },
  });

  return rows
    .filter((p) => p.variants.length > 0)
    .map((p) => ({
      slug: p.slug,
      nameVi: p.nameVi,
      nameEn: p.nameEn,
      imageUrl: p.images[0] ? publicUrl(p.images[0].key) : null,
      fromPriceVnd: Math.min(...p.variants.map((v) => v.priceVnd)),
      formats: deriveFormats(p.variants.map((v) => v.format)),
    }));
}

export async function getPublishedProductBySlug(
  slug: string,
): Promise<StorefrontProduct | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });
  if (!p || !p.published) return null;

  // Map to the client-safe shape ONLY — no originalKey/filename/contentType.
  return {
    slug: p.slug,
    nameVi: p.nameVi,
    nameEn: p.nameEn,
    descriptionVi: p.descriptionVi,
    descriptionEn: p.descriptionEn,
    images: p.images.map((img) => ({
      url: publicUrl(img.key),
      alt: img.alt,
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      format: v.format,
      label: v.label,
      priceVnd: v.priceVnd,
      previewUrl:
        v.format === "DIGITAL" && v.previewKey ? publicUrl(v.previewKey) : null,
    })),
  };
}

/**
 * Server-authoritative variant read for the cart: returns only variants of
 * PUBLISHED products (unpublished/missing ids are dropped) with the data a
 * cart line needs — price/format come from the DB, never the client (AD-10).
 */
export async function getVariantsByIds(ids: string[]): Promise<CartVariant[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.productVariant.findMany({
    where: { id: { in: ids }, product: { published: true } },
    include: {
      product: {
        select: {
          slug: true,
          nameVi: true,
          nameEn: true,
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
  });

  return rows.map((v) => ({
    id: v.id,
    productSlug: v.product.slug,
    nameVi: v.product.nameVi,
    nameEn: v.product.nameEn,
    format: v.format,
    label: v.label,
    priceVnd: v.priceVnd,
    imageUrl: v.product.images[0] ? publicUrl(v.product.images[0].key) : null,
  }));
}

// --- writes ---------------------------------------------------------------

export async function createProduct(
  input: ProductInput,
): Promise<SaveProductResult> {
  try {
    const product = await prisma.product.create({
      data: {
        slug: slugify(input.nameEn),
        nameVi: input.nameVi,
        nameEn: input.nameEn,
        descriptionVi: input.descriptionVi ?? null,
        descriptionEn: input.descriptionEn ?? null,
        published: input.published,
        variants: { create: toVariantRows(input.variants) },
        images: { create: toImageRows(input.images) },
      },
    });
    return { ok: true, id: product.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: "A product with that slug already exists." };
    }
    throw error;
  }
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<SaveProductResult> {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true },
  });
  if (!existing) {
    return { ok: false, error: "Product not found." };
  }

  // Keys present now but not in the incoming payload were removed by the
  // operator — delete their R2 objects after the row rewrite commits.
  const incomingImageKeys = new Set(input.images.map((i) => i.key));
  const incomingOriginalKeys = new Set(
    input.variants.flatMap((v) =>
      v.format === "DIGITAL" && v.originalKey ? [v.originalKey] : [],
    ),
  );
  const incomingPreviewKeys = new Set(
    input.variants.flatMap((v) =>
      v.format === "DIGITAL" && v.previewKey ? [v.previewKey] : [],
    ),
  );
  // Public bucket holds both display images and watermarked previews.
  const orphanPublicKeys = [
    ...existing.images.map((i) => i.key).filter((k) => !incomingImageKeys.has(k)),
    ...existing.variants
      .flatMap((v) => (v.previewKey ? [v.previewKey] : []))
      .filter((k) => !incomingPreviewKeys.has(k)),
  ];
  const orphanPrivateKeys = existing.variants
    .flatMap((v) => (v.originalKey ? [v.originalKey] : []))
    .filter((k) => !incomingOriginalKeys.has(k));

  // Replace variants + images wholesale inside one transaction (slug stays
  // stable). OrderLine snapshots protect historical orders (AD-11), so
  // re-pricing here never rewrites past purchases.
  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        nameVi: input.nameVi,
        nameEn: input.nameEn,
        descriptionVi: input.descriptionVi ?? null,
        descriptionEn: input.descriptionEn ?? null,
        published: input.published,
        variants: { create: toVariantRows(input.variants) },
        images: { create: toImageRows(input.images) },
      },
    }),
  ]);

  await cleanupObjects(orphanPublicKeys, orphanPrivateKeys);
  return { ok: true, id };
}

export async function setPublished(
  id: string,
  published: boolean,
): Promise<void> {
  await prisma.product.update({ where: { id }, data: { published } });
}

export async function deleteProduct(id: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true },
  });
  if (!product) return;

  // Rows cascade on the FK; delete the parent, then best-effort remove the
  // R2 objects the child rows referenced.
  await prisma.product.delete({ where: { id } });
  await cleanupObjects(
    [
      ...product.images.map((i) => i.key),
      ...product.variants.flatMap((v) => (v.previewKey ? [v.previewKey] : [])),
    ],
    product.variants.flatMap((v) => (v.originalKey ? [v.originalKey] : [])),
  );
}

/** Best-effort R2 cleanup — a storage hiccup must not fail the DB mutation. */
async function cleanupObjects(
  publicKeys: string[],
  privateKeys: string[],
): Promise<void> {
  await Promise.allSettled([
    ...publicKeys.map((key) => deleteObject({ scope: "public", key })),
    ...privateKeys.map((key) => deleteObject({ scope: "private", key })),
  ]);
}
