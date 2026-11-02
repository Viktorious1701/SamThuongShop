// lib/server/portfolio.ts
//
// Story 1.6 — all Gallery / PortfolioImage Prisma access (AD-2 — one service
// module per aggregate; only lib/server imports Prisma). Admin Server Actions
// delegate here; public pages read the client-safe DTOs below (no private
// originalKey ever leaves this module on the public path).
//
// Rules enforced here (plan §2.4):
//   D1  two levels max — a group's parent must be top-level; a gallery that
//       has children can't itself get a parent.
//   D2  images only in leaf galleries — a gallery holding images can't become
//       a parent, and a group can't receive uploads.
//   D3  public reads: only published galleries; a group shows only through
//       its published children that have images; a child needs its parent
//       published too.
//   D11 "View this print" only for a published Product with a sellable variant.
//   D13 a gallery can't be deleted while it has images or children.

import { prisma } from "@/lib/server/db";
import { deleteObject, publicUrl } from "@/lib/server/storage";
import { sellableVariantWhere } from "@/lib/server/product";
import type { ProcessedPortfolioImage } from "@/lib/server/portfolio-image";
import type {
  GalleryInput,
  ImageDetailsInput,
} from "@/lib/validation/portfolio-schemas";

export type Result<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

export type MoveDirection = "up" | "down";

// --- admin DTOs ------------------------------------------------------------

export type AdminGalleryNode = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  published: boolean;
  imageCount: number;
  children: Omit<AdminGalleryNode, "children">[];
};

export type AdminImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  speciesVi: string | null;
  speciesEn: string | null;
  locationVi: string | null;
  locationEn: string | null;
  featured: boolean;
  productId: string | null;
};

export type AdminGallery = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  parentId: string | null;
  published: boolean;
  childCount: number;
  images: AdminImage[];
};

export type ParentOption = { id: string; nameEn: string; nameVi: string };

// --- public DTOs (client-safe) ---------------------------------------------

export type PublicImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  blurDataUrl: string;
  speciesVi: string | null;
  speciesEn: string | null;
  locationVi: string | null;
  locationEn: string | null;
  printSlug: string | null; // set only when the linked print is buyable (D11)
};

export type GalleryCard = {
  slug: string;
  nameVi: string;
  nameEn: string;
  imageCount: number;
  cover: Pick<PublicImage, "url" | "width" | "height" | "blurDataUrl"> & {
    speciesVi: string | null;
    speciesEn: string | null;
  };
};

export type PortfolioGroup = {
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  galleries: GalleryCard[];
};

export type PortfolioOverview = {
  groups: PortfolioGroup[];
  standalone: GalleryCard[]; // top-level galleries with no group
};

type GalleryHeading = {
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
};

export type PortfolioPage =
  | {
      kind: "gallery";
      gallery: GalleryHeading;
      parent: Pick<GalleryHeading, "slug" | "nameVi" | "nameEn"> | null;
      images: PublicImage[];
    }
  | {
      kind: "group";
      gallery: GalleryHeading;
      sections: { gallery: GalleryHeading; images: PublicImage[] }[];
    };

// --- helpers ---------------------------------------------------------------

/** URL-safe slug from the English name (đ → d, diacritics stripped). */
function slugify(name: string): string {
  return (
    name
      .replace(/[đĐ]/g, "d")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "gallery"
  );
}

/** First free slug: `base`, `base-2`, `base-3`, … */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  for (let n = 1; n < 100; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const hit = await prisma.gallery.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!hit || hit.id === excludeId) return candidate;
  }
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

/** Rewrites sibling positions to 0..n-1 after swapping `id` one step. */
async function swapWithNeighbour(
  ordered: { id: string }[],
  id: string,
  direction: MoveDirection,
  write: (id: string, position: number) => Promise<unknown>,
): Promise<void> {
  const i = ordered.findIndex((r) => r.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ordered.length) return;
  const next = [...ordered];
  [next[i], next[j]] = [next[j], next[i]];
  await Promise.all(next.map((r, position) => write(r.id, position)));
}

const sellableProductSelect = () => ({
  select: {
    slug: true,
    published: true,
    variants: { where: sellableVariantWhere(), select: { id: true }, take: 1 },
  },
});

type PublicImageRow = {
  id: string;
  key: string;
  width: number;
  height: number;
  blurDataUrl: string;
  speciesVi: string | null;
  speciesEn: string | null;
  locationVi: string | null;
  locationEn: string | null;
  product: { slug: string; published: boolean; variants: { id: string }[] } | null;
};

function toPublicImage(row: PublicImageRow): PublicImage {
  const p = row.product;
  return {
    id: row.id,
    url: publicUrl(row.key),
    width: row.width,
    height: row.height,
    blurDataUrl: row.blurDataUrl,
    speciesVi: row.speciesVi,
    speciesEn: row.speciesEn,
    locationVi: row.locationVi,
    locationEn: row.locationEn,
    printSlug: p && p.published && p.variants.length > 0 ? p.slug : null,
  };
}

const imageOrder = [{ position: "asc" as const }, { createdAt: "asc" as const }];
const galleryOrder = [{ position: "asc" as const }, { createdAt: "asc" as const }];

// --- admin: galleries --------------------------------------------------------

export async function listGalleryTree(): Promise<AdminGalleryNode[]> {
  const rows = await prisma.gallery.findMany({
    where: { parentId: null },
    orderBy: galleryOrder,
    include: {
      _count: { select: { images: true } },
      children: {
        orderBy: galleryOrder,
        include: { _count: { select: { images: true } } },
      },
    },
  });
  const node = (g: (typeof rows)[number] | (typeof rows)[number]["children"][number]) => ({
    id: g.id,
    slug: g.slug,
    nameVi: g.nameVi,
    nameEn: g.nameEn,
    published: g.published,
    imageCount: g._count.images,
  });
  return rows.map((g) => ({ ...node(g), children: g.children.map(node) }));
}

export async function getGalleryForEdit(id: string): Promise<AdminGallery | null> {
  const g = await prisma.gallery.findUnique({
    where: { id },
    include: {
      _count: { select: { children: true } },
      images: { orderBy: imageOrder },
    },
  });
  if (!g) return null;
  return {
    id: g.id,
    slug: g.slug,
    nameVi: g.nameVi,
    nameEn: g.nameEn,
    descriptionVi: g.descriptionVi,
    descriptionEn: g.descriptionEn,
    parentId: g.parentId,
    published: g.published,
    childCount: g._count.children,
    images: g.images.map((img) => ({
      id: img.id,
      url: publicUrl(img.key),
      width: img.width,
      height: img.height,
      speciesVi: img.speciesVi,
      speciesEn: img.speciesEn,
      locationVi: img.locationVi,
      locationEn: img.locationEn,
      featured: img.featured,
      productId: img.productId,
    })),
  };
}

/** Galleries that may act as a group parent: top-level and holding no images
 * (D1/D2). `excludeId` drops the gallery being edited. */
export async function listParentOptions(excludeId?: string): Promise<ParentOption[]> {
  return prisma.gallery.findMany({
    where: {
      parentId: null,
      images: { none: {} },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: galleryOrder,
    select: { id: true, nameEn: true, nameVi: true },
  });
}

/** D1/D2 checks for placing gallery `selfId` (null on create) under `parentId`. */
async function checkParent(
  selfId: string | null,
  parentId: string | null,
): Promise<string | null> {
  if (!parentId) return null;
  if (parentId === selfId) return "A gallery can't be its own group.";

  const parent = await prisma.gallery.findUnique({
    where: { id: parentId },
    select: { parentId: true, _count: { select: { images: true } } },
  });
  if (!parent) return "That group no longer exists.";
  if (parent.parentId) return "Groups can only be one level deep — pick a top-level group.";
  if (parent._count.images > 0) {
    return "That gallery already holds images, so it can't become a group.";
  }

  if (selfId) {
    const children = await prisma.gallery.count({ where: { parentId: selfId } });
    if (children > 0) {
      return "This gallery is a group (it has galleries inside it), so it can't be placed in another group.";
    }
  }
  return null;
}

export async function createGallery(input: GalleryInput): Promise<Result<{ id: string }>> {
  const problem = await checkParent(null, input.parentId);
  if (problem) return { ok: false, error: problem };

  const slug = input.slug ?? (await uniqueSlug(slugify(input.nameEn)));
  const last = await prisma.gallery.findFirst({
    where: { parentId: input.parentId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  try {
    const g = await prisma.gallery.create({
      data: {
        slug,
        nameVi: input.nameVi,
        nameEn: input.nameEn,
        descriptionVi: input.descriptionVi,
        descriptionEn: input.descriptionEn,
        parentId: input.parentId,
        position: (last?.position ?? -1) + 1,
      },
      select: { id: true },
    });
    return { ok: true, data: { id: g.id } };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: "That URL name is already used by another gallery." };
    }
    throw error;
  }
}

export async function updateGallery(id: string, input: GalleryInput): Promise<Result> {
  const current = await prisma.gallery.findUnique({
    where: { id },
    select: { parentId: true },
  });
  if (!current) return { ok: false, error: "This gallery no longer exists." };

  const problem = await checkParent(id, input.parentId);
  if (problem) return { ok: false, error: problem };

  const slug = input.slug ?? (await uniqueSlug(slugify(input.nameEn), id));

  // Moving to a different group → append at the end of the new siblings.
  let position: number | undefined;
  if (current.parentId !== input.parentId) {
    const last = await prisma.gallery.findFirst({
      where: { parentId: input.parentId, id: { not: id } },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    position = (last?.position ?? -1) + 1;
  }

  try {
    await prisma.gallery.update({
      where: { id },
      data: {
        slug,
        nameVi: input.nameVi,
        nameEn: input.nameEn,
        descriptionVi: input.descriptionVi,
        descriptionEn: input.descriptionEn,
        parentId: input.parentId,
        ...(position !== undefined ? { position } : {}),
      },
    });
    return { ok: true };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: "That URL name is already used by another gallery." };
    }
    throw error;
  }
}

export async function moveGallery(id: string, direction: MoveDirection): Promise<void> {
  const g = await prisma.gallery.findUnique({ where: { id }, select: { parentId: true } });
  if (!g) return;
  const siblings = await prisma.gallery.findMany({
    where: { parentId: g.parentId },
    orderBy: galleryOrder,
    select: { id: true },
  });
  await swapWithNeighbour(siblings, id, direction, (rowId, position) =>
    prisma.gallery.update({ where: { id: rowId }, data: { position } }),
  );
}

export async function setGalleryPublished(id: string, published: boolean): Promise<void> {
  await prisma.gallery.update({ where: { id }, data: { published } });
}

export async function deleteGallery(id: string): Promise<Result> {
  const g = await prisma.gallery.findUnique({
    where: { id },
    select: { _count: { select: { images: true, children: true } } },
  });
  if (!g) return { ok: true };
  if (g._count.children > 0) {
    return { ok: false, error: "Move or delete the galleries inside this group first." };
  }
  if (g._count.images > 0) {
    return { ok: false, error: "Delete this gallery's images first." };
  }
  await prisma.gallery.delete({ where: { id } });
  return { ok: true };
}

// --- admin: images -----------------------------------------------------------

/** D2 — only a leaf gallery can receive images. Checked before upload so the
 * operator isn't left with orphaned R2 objects. */
export async function canHoldImages(galleryId: string): Promise<Result> {
  const g = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: { _count: { select: { children: true } } },
  });
  if (!g) return { ok: false, error: "This gallery no longer exists." };
  if (g._count.children > 0) {
    return {
      ok: false,
      error: "Groups can't hold images — add them to a gallery inside it.",
    };
  }
  return { ok: true };
}

export async function addPortfolioImage(
  galleryId: string,
  originalKey: string,
  processed: ProcessedPortfolioImage,
): Promise<Result<AdminImage>> {
  const allowed = await canHoldImages(galleryId);
  if (!allowed.ok) return allowed;

  const last = await prisma.portfolioImage.findFirst({
    where: { galleryId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const img = await prisma.portfolioImage.create({
    data: {
      galleryId,
      originalKey,
      key: processed.key,
      width: processed.width,
      height: processed.height,
      blurDataUrl: processed.blurDataUrl,
      position: (last?.position ?? -1) + 1,
    },
  });
  return {
    ok: true,
    data: {
      id: img.id,
      url: publicUrl(img.key),
      width: img.width,
      height: img.height,
      speciesVi: null,
      speciesEn: null,
      locationVi: null,
      locationEn: null,
      featured: false,
      productId: null,
    },
  };
}

export async function updateImageDetails(
  id: string,
  input: ImageDetailsInput,
): Promise<Result> {
  if (input.productId) {
    const exists = await prisma.product.count({ where: { id: input.productId } });
    if (!exists) return { ok: false, error: "That product no longer exists." };
  }
  await prisma.portfolioImage.update({ where: { id }, data: input });
  return { ok: true };
}

export async function moveImage(id: string, direction: MoveDirection): Promise<void> {
  const img = await prisma.portfolioImage.findUnique({
    where: { id },
    select: { galleryId: true },
  });
  if (!img) return;
  const siblings = await prisma.portfolioImage.findMany({
    where: { galleryId: img.galleryId },
    orderBy: imageOrder,
    select: { id: true },
  });
  await swapWithNeighbour(siblings, id, direction, (rowId, position) =>
    prisma.portfolioImage.update({ where: { id: rowId }, data: { position } }),
  );
}

/** Deletes the row, then best-effort removes both R2 objects (AD-15 — keys
 * are owned by the row). A failed object delete never blocks the operator. */
export async function deletePortfolioImage(id: string): Promise<void> {
  const img = await prisma.portfolioImage.findUnique({
    where: { id },
    select: { key: true, originalKey: true },
  });
  if (!img) return;
  await prisma.portfolioImage.delete({ where: { id } });
  await Promise.allSettled([
    deleteObject({ scope: "public", key: img.key }),
    deleteObject({ scope: "private", key: img.originalKey }),
  ]);
}

// --- public reads (published-only, client-safe) ------------------------------

const publicImageSelect = () => ({
  id: true,
  key: true,
  width: true,
  height: true,
  blurDataUrl: true,
  speciesVi: true,
  speciesEn: true,
  locationVi: true,
  locationEn: true,
  featured: true,
  product: sellableProductSelect(),
});

type CardSourceRow = {
  slug: string;
  nameVi: string;
  nameEn: string;
  images: (PublicImageRow & { featured: boolean })[];
};

/** Cover = first Featured image, else the first image (plan T01 note). */
function toCard(g: CardSourceRow): GalleryCard | null {
  if (g.images.length === 0) return null;
  const cover = g.images.find((i) => i.featured) ?? g.images[0];
  return {
    slug: g.slug,
    nameVi: g.nameVi,
    nameEn: g.nameEn,
    imageCount: g.images.length,
    cover: {
      url: publicUrl(cover.key),
      width: cover.width,
      height: cover.height,
      blurDataUrl: cover.blurDataUrl,
      speciesVi: cover.speciesVi,
      speciesEn: cover.speciesEn,
    },
  };
}

export async function getPortfolioOverview(): Promise<PortfolioOverview> {
  const top = await prisma.gallery.findMany({
    where: { parentId: null, published: true },
    orderBy: galleryOrder,
    include: {
      images: { orderBy: imageOrder, select: publicImageSelect() },
      children: {
        where: { published: true },
        orderBy: galleryOrder,
        include: { images: { orderBy: imageOrder, select: publicImageSelect() } },
      },
    },
  });

  const groups: PortfolioGroup[] = [];
  const standalone: GalleryCard[] = [];

  for (const g of top) {
    if (g.children.length > 0) {
      const galleries = g.children.map(toCard).filter((c): c is GalleryCard => !!c);
      if (galleries.length === 0) continue;
      groups.push({
        slug: g.slug,
        nameVi: g.nameVi,
        nameEn: g.nameEn,
        descriptionVi: g.descriptionVi,
        descriptionEn: g.descriptionEn,
        galleries,
      });
    } else {
      const card = toCard(g);
      if (card) standalone.push(card);
    }
  }
  return { groups, standalone };
}

export async function getPortfolioPage(slug: string): Promise<PortfolioPage | null> {
  const g = await prisma.gallery.findUnique({
    where: { slug },
    include: {
      parent: { select: { slug: true, nameVi: true, nameEn: true, published: true } },
      images: { orderBy: imageOrder, select: publicImageSelect() },
      children: {
        where: { published: true },
        orderBy: galleryOrder,
        include: { images: { orderBy: imageOrder, select: publicImageSelect() } },
      },
    },
  });
  if (!g || !g.published) return null;
  if (g.parent && !g.parent.published) return null;

  const heading = (x: GalleryHeading): GalleryHeading => ({
    slug: x.slug,
    nameVi: x.nameVi,
    nameEn: x.nameEn,
    descriptionVi: x.descriptionVi,
    descriptionEn: x.descriptionEn,
  });

  if (g.children.length > 0) {
    const sections = g.children
      .filter((c) => c.images.length > 0)
      .map((c) => ({ gallery: heading(c), images: c.images.map(toPublicImage) }));
    if (sections.length === 0) return null;
    return { kind: "group", gallery: heading(g), sections };
  }

  if (g.images.length === 0) return null;
  return {
    kind: "gallery",
    gallery: heading(g),
    parent: g.parent
      ? { slug: g.parent.slug, nameVi: g.parent.nameVi, nameEn: g.parent.nameEn }
      : null,
    images: g.images.map(toPublicImage),
  };
}
