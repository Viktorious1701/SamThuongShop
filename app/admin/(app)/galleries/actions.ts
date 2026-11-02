"use server";

// app/admin/(app)/galleries/actions.ts
//
// Story 1.6 — operator Server Actions for portfolio galleries + images (AD-1).
// Every action re-checks the operator role (AD-9): the route-group layout
// guards the pages, but actions are separately callable. Rules and all
// Prisma/R2 access live in lib/server/portfolio*.ts (AD-2).

import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/server/require-operator";
import { deleteObject, presignUpload } from "@/lib/server/storage";
import {
  PORTFOLIO_ORIGINAL_PREFIX,
  isPortfolioOriginalKey,
  processPortfolioUpload,
} from "@/lib/server/portfolio-image";
import {
  addPortfolioImage,
  canHoldImages,
  createGallery,
  deleteGallery,
  deletePortfolioImage,
  moveGallery,
  moveImage,
  setGalleryPublished,
  updateGallery,
  updateImageDetails,
  type AdminImage,
  type MoveDirection,
} from "@/lib/server/portfolio";
import {
  gallerySchema,
  imageDetailsSchema,
} from "@/lib/validation/portfolio-schemas";

type Fail = { ok: false; error: string };

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
]);

function refresh(galleryId?: string) {
  revalidatePath("/admin/galleries");
  if (galleryId) revalidatePath(`/admin/galleries/${galleryId}`);
}

function direction(value: string): MoveDirection {
  return value === "up" ? "up" : "down";
}

// --- galleries -----------------------------------------------------------------

export async function saveGalleryAction(
  id: string | null,
  raw: unknown,
): Promise<{ ok: true; id: string } | Fail> {
  await requireOperator();

  const parsed = gallerySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "The gallery is invalid." };
  }

  if (id) {
    const result = await updateGallery(id, parsed.data);
    if (!result.ok) return result;
    refresh(id);
    return { ok: true, id };
  }

  const result = await createGallery(parsed.data);
  if (!result.ok) return result;
  refresh();
  return { ok: true, id: result.data.id };
}

export async function moveGalleryAction(id: string, dir: string): Promise<void> {
  await requireOperator();
  await moveGallery(id, direction(dir));
  refresh();
}

export async function setGalleryPublishedAction(
  id: string,
  published: boolean,
): Promise<void> {
  await requireOperator();
  await setGalleryPublished(id, published);
  refresh(id);
}

export async function deleteGalleryAction(id: string): Promise<{ ok: true } | Fail> {
  await requireOperator();
  const result = await deleteGallery(id);
  if (result.ok) refresh();
  return result.ok ? { ok: true } : result;
}

// --- images ------------------------------------------------------------------

/**
 * Step 1 of an upload (D5/D6): a presigned PUT into the PRIVATE bucket under
 * the portfolio-originals prefix. Checked against the gallery first so a group
 * never ends up with orphaned uploads.
 */
export async function createPortfolioUploadUrl(input: {
  galleryId: string;
  contentType: string;
  ext: string;
}): Promise<{ ok: true; key: string; url: string } | Fail> {
  await requireOperator();

  const contentType = String(input.contentType || "").toLowerCase();
  const ext = String(input.ext || "").replace(/[^a-z0-9]/gi, "").slice(0, 8);
  if (!IMAGE_TYPES.has(contentType)) {
    return { ok: false, error: "Use a JPEG, PNG, WebP, AVIF or TIFF image." };
  }
  if (!ext) return { ok: false, error: "Could not determine the file extension." };

  const allowed = await canHoldImages(input.galleryId);
  if (!allowed.ok) return allowed;

  const { key, url } = await presignUpload({
    scope: "private",
    contentType,
    ext,
    prefix: PORTFOLIO_ORIGINAL_PREFIX,
  });
  return { ok: true, key, url };
}

/**
 * Step 2: resize the uploaded original into the public display copy and add
 * the image to the gallery. If anything fails after the public copy was
 * written, that copy is removed so no orphan is left behind.
 */
export async function processPortfolioImageAction(
  galleryId: string,
  originalKey: string,
): Promise<{ ok: true; image: AdminImage } | Fail> {
  await requireOperator();

  if (!isPortfolioOriginalKey(originalKey)) {
    return { ok: false, error: "Upload the image first." };
  }

  let processed;
  try {
    processed = await processPortfolioUpload(originalKey);
  } catch {
    return {
      ok: false,
      error: "Couldn't read this image — is the file complete and a supported format?",
    };
  }

  const added = await addPortfolioImage(galleryId, originalKey, processed);
  if (!added.ok) {
    await deleteObject({ scope: "public", key: processed.key }).catch(() => {});
    return added;
  }
  refresh(galleryId);
  return { ok: true, image: added.data };
}

/** Abandoned upload (step 2 failed for good / operator cancelled): drop the
 * private original so the archive doesn't collect orphans. */
export async function discardPortfolioOriginalAction(originalKey: string): Promise<void> {
  await requireOperator();
  if (!isPortfolioOriginalKey(originalKey)) return;
  await deleteObject({ scope: "private", key: originalKey }).catch(() => {});
}

export async function saveImageDetailsAction(
  id: string,
  galleryId: string,
  raw: unknown,
): Promise<{ ok: true } | Fail> {
  await requireOperator();

  const parsed = imageDetailsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "These details are invalid." };
  }
  const result = await updateImageDetails(id, parsed.data);
  if (!result.ok) return result;
  refresh(galleryId);
  return { ok: true };
}

export async function moveImageAction(
  id: string,
  galleryId: string,
  dir: string,
): Promise<void> {
  await requireOperator();
  await moveImage(id, direction(dir));
  refresh(galleryId);
}

export async function deleteImageAction(id: string, galleryId: string): Promise<void> {
  await requireOperator();
  await deletePortfolioImage(id);
  refresh(galleryId);
}
