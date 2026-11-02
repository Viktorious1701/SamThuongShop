// lib/server/portfolio.ts
//
// All Gallery / PortfolioImage Prisma access (AD-2 — only lib/server imports
// Prisma). Story 1.6, simplified by the portfolio-only revamp (2026-11-02):
//
//   • Galleries are ONE level of categories (Birds, Sport & Events, …). The
//     old parent/group column is ignored (kept in the schema, unused).
//   • A photo has a caption + place/date per language (was "species"), a
//     Featured flag and an order. The print link is gone from the UI.
//   • Public reads only return published galleries that have photos; no
//     private originalKey ever leaves this module on the public path.
//   • A gallery can't be deleted while it still holds photos.

import { prisma } from "@/lib/server/db";
import { deleteObject, publicUrl } from "@/lib/server/storage";
import type { ProcessedImage } from "@/lib/server/portfolio-image";
import type {
  GalleryInput,
  ImageDetailsInput,
} from "@/lib/validation/portfolio-schemas";

export type Result<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

export type MoveDirection = "up" | "down";

// --- DTOs ------------------------------------------------------------------

export type CaptionFields = {
  captionVi: string | null;
  captionEn: string | null;
  locationVi: string | null;
  locationEn: string | null;
};

export type AdminGalleryRow = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  published: boolean;
  imageCount: number;
};

export type AdminImage = CaptionFields & {
  id: string;
  url: string;
  width: number;
  height: number;
  featured: boolean;
};

export type AdminGallery = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  published: boolean;
  images: AdminImage[];
};

/** Client-safe photo (public pages). */
export type PublicImage = CaptionFields & {
  id: string;
  url: string;
  width: number;
  height: number;
  blurDataUrl: string;
};

export type GalleryCard = {
  slug: string;
  nameVi: string;
  nameEn: string;
  imageCount: number;
  cover: Pick<PublicImage, "url" | "width" | "height" | "blurDataUrl"> &
    Pick<CaptionFields, "captionVi" | "captionEn">;
};

type GalleryHeading = {
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
};

type GalleryLink = Pick<GalleryHeading, "slug" | "nameVi" | "nameEn">;

export type GalleryPage = {
  gallery: GalleryHeading;
  images: PublicImage[];
  previous: GalleryLink | null;
  next: GalleryLink | null;
};

/** For the admin "hero photo" picker. */
export type ImageOption = {
  id: string;
  url: string;
  galleryNameEn: string;
  captionEn: string | null;
  captionVi: string | null;
};

// --- helpers -----------------------------------------------------------------

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

const imageOrder = [{ position: "asc" as const }, { createdAt: "asc" as const }];
const galleryOrder = [{ position: "asc" as const }, { createdAt: "asc" as const }];

const publicImageSelect = {
  id: true,
  key: true,
  width: true,
  height: true,
  blurDataUrl: true,
  captionVi: true,
  captionEn: true,
  locationVi: true,
  locationEn: true,
  featured: true,
} as const;

type PublicImageRow = {
  id: string;
  key: string;
  width: number;
  height: number;
  blurDataUrl: string;
  featured: boolean;
} & CaptionFields;

function toPublicImage(row: PublicImageRow): PublicImage {
  return {
    id: row.id,
    url: publicUrl(row.key),
    width: row.width,
    height: row.height,
    blurDataUrl: row.blurDataUrl,
    captionVi: row.captionVi,
    captionEn: row.captionEn,
    locationVi: row.locationVi,
    locationEn: row.locationEn,
  };
}

function toAdminImage(row: {
  id: string;
  key: string;
  width: number;
  height: number;
  featured: boolean;
} & CaptionFields): AdminImage {
  return {
    id: row.id,
    url: publicUrl(row.key),
    width: row.width,
    height: row.height,
    captionVi: row.captionVi,
    captionEn: row.captionEn,
    locationVi: row.locationVi,
    locationEn: row.locationEn,
    featured: row.featured,
  };
}

// --- admin: galleries --------------------------------------------------------

export async function listGalleries(): Promise<AdminGalleryRow[]> {
  const rows = await prisma.gallery.findMany({
    orderBy: galleryOrder,
    include: { _count: { select: { images: true } } },
  });
  return rows.map((g) => ({
    id: g.id,
    slug: g.slug,
    nameVi: g.nameVi,
    nameEn: g.nameEn,
    published: g.published,
    imageCount: g._count.images,
  }));
}

export async function getGalleryForEdit(id: string): Promise<AdminGallery | null> {
  const g = await prisma.gallery.findUnique({
    where: { id },
    include: { images: { orderBy: imageOrder } },
  });
  if (!g) return null;
  return {
    id: g.id,
    slug: g.slug,
    nameVi: g.nameVi,
    nameEn: g.nameEn,
    descriptionVi: g.descriptionVi,
    descriptionEn: g.descriptionEn,
    published: g.published,
    images: g.images.map(toAdminImage),
  };
}

export async function createGallery(input: GalleryInput): Promise<Result<{ id: string }>> {
  const slug = input.slug ?? (await uniqueSlug(slugify(input.nameEn)));
  const last = await prisma.gallery.findFirst({
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
  const exists = await prisma.gallery.count({ where: { id } });
  if (!exists) return { ok: false, error: "This gallery no longer exists." };

  const slug = input.slug ?? (await uniqueSlug(slugify(input.nameEn), id));
  try {
    await prisma.gallery.update({
      where: { id },
      data: {
        slug,
        nameVi: input.nameVi,
        nameEn: input.nameEn,
        descriptionVi: input.descriptionVi,
        descriptionEn: input.descriptionEn,
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
  const all = await prisma.gallery.findMany({ orderBy: galleryOrder, select: { id: true } });
  await swapWithNeighbour(all, id, direction, (rowId, position) =>
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
  if (g._count.images > 0) {
    return { ok: false, error: "Delete this gallery's photos first." };
  }
  if (g._count.children > 0) {
    // Only possible for data created before the revamp (old groups).
    await prisma.gallery.updateMany({ where: { parentId: id }, data: { parentId: null } });
  }
  await prisma.gallery.delete({ where: { id } });
  return { ok: true };
}

// --- admin: photos -------------------------------------------------------------

export async function galleryExists(galleryId: string): Promise<boolean> {
  return (await prisma.gallery.count({ where: { id: galleryId } })) > 0;
}

export async function addPortfolioImage(
  galleryId: string,
  originalKey: string,
  processed: ProcessedImage,
): Promise<Result<AdminImage>> {
  if (!(await galleryExists(galleryId))) {
    return { ok: false, error: "This gallery no longer exists." };
  }
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
  return { ok: true, data: toAdminImage(img) };
}

export async function updateImageDetails(id: string, input: ImageDetailsInput): Promise<Result> {
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

/** Deletes the row, then best-effort removes both R2 objects (AD-15). */
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

/** Every photo, grouped by gallery order — for the admin hero picker. */
export async function listImageOptions(): Promise<ImageOption[]> {
  const rows = await prisma.portfolioImage.findMany({
    orderBy: [{ gallery: { position: "asc" } }, ...imageOrder],
    select: {
      id: true,
      key: true,
      captionVi: true,
      captionEn: true,
      gallery: { select: { nameEn: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    url: publicUrl(r.key),
    galleryNameEn: r.gallery.nameEn,
    captionVi: r.captionVi,
    captionEn: r.captionEn,
  }));
}

// --- public reads (published-only, client-safe) --------------------------------

/** Cover = first Featured photo, else the first photo. */
function toCard(g: {
  slug: string;
  nameVi: string;
  nameEn: string;
  images: PublicImageRow[];
}): GalleryCard | null {
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
      captionVi: cover.captionVi,
      captionEn: cover.captionEn,
    },
  };
}

const publishedWithPhotos = { published: true, images: { some: {} } };

export async function listGalleryCards(): Promise<GalleryCard[]> {
  const rows = await prisma.gallery.findMany({
    where: publishedWithPhotos,
    orderBy: galleryOrder,
    include: { images: { orderBy: imageOrder, select: publicImageSelect } },
  });
  return rows.map(toCard).filter((c): c is GalleryCard => !!c);
}

export async function getGalleryPage(slug: string): Promise<GalleryPage | null> {
  const g = await prisma.gallery.findUnique({
    where: { slug },
    include: { images: { orderBy: imageOrder, select: publicImageSelect } },
  });
  if (!g || !g.published || g.images.length === 0) return null;

  // Previous / next published gallery, for the pager.
  const all = await prisma.gallery.findMany({
    where: publishedWithPhotos,
    orderBy: galleryOrder,
    select: { slug: true, nameVi: true, nameEn: true },
  });
  const i = all.findIndex((x) => x.slug === slug);

  return {
    gallery: {
      slug: g.slug,
      nameVi: g.nameVi,
      nameEn: g.nameEn,
      descriptionVi: g.descriptionVi,
      descriptionEn: g.descriptionEn,
    },
    images: g.images.map(toPublicImage),
    previous: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}

/** Featured photos across published galleries, in gallery then photo order. */
export async function listFeaturedPhotos(limit = 12): Promise<PublicImage[]> {
  const rows = await prisma.portfolioImage.findMany({
    where: { featured: true, gallery: { published: true } },
    orderBy: [{ gallery: { position: "asc" } }, ...imageOrder],
    take: limit,
    select: publicImageSelect,
  });
  return rows.map(toPublicImage);
}

/** The Home hero: the chosen photo, else the first Featured one, else any. */
export async function getHeroPhoto(heroImageId: string | null): Promise<PublicImage | null> {
  if (heroImageId) {
    const chosen = await prisma.portfolioImage.findUnique({
      where: { id: heroImageId },
      select: publicImageSelect,
    });
    if (chosen) return toPublicImage(chosen);
  }
  const fallback =
    (await prisma.portfolioImage.findFirst({
      where: { featured: true, gallery: { published: true } },
      orderBy: [{ gallery: { position: "asc" } }, ...imageOrder],
      select: publicImageSelect,
    })) ??
    (await prisma.portfolioImage.findFirst({
      where: { gallery: { published: true } },
      orderBy: [{ gallery: { position: "asc" } }, ...imageOrder],
      select: publicImageSelect,
    }));
  return fallback ? toPublicImage(fallback) : null;
}
