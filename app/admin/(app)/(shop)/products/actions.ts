"use server";

// app/admin/(app)/products/actions.ts
//
// Story 2.1 — operator product-management Server Actions (AD-1). Every action
// re-checks the operator role via requireOperator() (AD-9) before touching
// data; the route-group layout guards the pages, but actions are separately
// callable and must guard themselves. All persistence is delegated to
// lib/server/product.ts and lib/server/storage.ts (AD-2).

import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/server/require-operator";
import {
  presignUpload,
  publicUrl,
  type StorageScope,
} from "@/lib/server/storage";
import { generateWatermarkedPreview } from "@/lib/server/watermark";
import {
  createProduct,
  deleteProduct,
  setPublished,
  updateProduct,
  type SaveProductResult,
} from "@/lib/server/product";
import { productSchema } from "@/lib/validation/product-schemas";

export type UploadUrlResult =
  | { ok: true; key: string; url: string; publicUrl: string | null }
  | { ok: false; error: string };

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

/**
 * Issues a presigned PUT URL so the browser uploads the file directly to R2
 * (keeping large originals off the server — Vercel's ~4.5 MB body cap). The
 * caller submits the returned key on save; bytes never pass through here.
 */
export async function createUploadUrl(input: {
  scope: StorageScope;
  contentType: string;
  ext: string;
}): Promise<UploadUrlResult> {
  await requireOperator();

  const contentType = String(input.contentType || "").toLowerCase();
  const ext = String(input.ext || "").replace(/[^a-z0-9]/gi, "").slice(0, 8);

  if (input.scope !== "public" && input.scope !== "private") {
    return { ok: false, error: "Invalid upload target." };
  }
  // Public bucket only serves display images — keep non-images out of it.
  if (input.scope === "public" && !IMAGE_TYPES.has(contentType)) {
    return { ok: false, error: "Display images must be JPEG, PNG, WebP or AVIF." };
  }
  if (!ext) {
    return { ok: false, error: "Could not determine the file extension." };
  }

  const { key, url } = await presignUpload({
    scope: input.scope,
    contentType,
    ext,
  });
  return {
    ok: true,
    key,
    url,
    publicUrl: input.scope === "public" ? publicUrl(key) : null,
  };
}

export type GeneratePreviewResult =
  | { ok: true; previewKey: string; previewUrl: string }
  | { ok: false; error: string };

/**
 * Story 2.2 — generates a watermarked public preview from a just-uploaded
 * private original. Called by the editor right after a DIGITAL original
 * finishes uploading; the returned key is saved on the variant.
 */
export async function generatePreviewAction(
  originalKey: string,
): Promise<GeneratePreviewResult> {
  await requireOperator();
  if (!originalKey) {
    return { ok: false, error: "Upload the original file first." };
  }
  try {
    const previewKey = await generateWatermarkedPreview(originalKey);
    return { ok: true, previewKey, previewUrl: publicUrl(previewKey) };
  } catch {
    return { ok: false, error: "Could not generate the preview. Try again." };
  }
}

/** Create (id === null) or update a product from the editor payload. */
export async function saveProduct(
  id: string | null,
  raw: unknown,
): Promise<SaveProductResult> {
  await requireOperator();

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "The product is invalid." };
  }

  const result = id
    ? await updateProduct(id, parsed.data)
    : await createProduct(parsed.data);

  if (result.ok) {
    revalidatePath("/admin/products");
  }
  return result;
}

export async function togglePublished(
  id: string,
  published: boolean,
): Promise<void> {
  await requireOperator();
  await setPublished(id, published);
  revalidatePath("/admin/products");
}

export async function deleteProductAction(id: string): Promise<void> {
  await requireOperator();
  await deleteProduct(id);
  revalidatePath("/admin/products");
}
