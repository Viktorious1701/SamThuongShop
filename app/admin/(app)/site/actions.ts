"use server";

// app/admin/(app)/site/actions.ts
//
// Portfolio-only revamp (R4) — Server Actions for /admin/site. Every action
// re-checks the operator role (AD-9); persistence lives in
// lib/server/site-content.ts (AD-2). The portrait uploads like gallery photos:
// presigned PUT of the original into PRIVATE storage, then a server-side
// resize (≤1200 px, metadata stripped) into PUBLIC storage.

import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/server/require-operator";
import { deleteObject, presignUpload, publicUrl } from "@/lib/server/storage";
import {
  isOriginalKey,
  originalPrefix,
  processDisplayUpload,
} from "@/lib/server/portfolio-image";
import { removePortrait, saveSiteContent, setPortrait } from "@/lib/server/site-content";
import { siteContentSchema } from "@/lib/validation/site-schemas";

type Fail = { ok: false; error: string };

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"]);

function refresh() {
  revalidatePath("/admin/site");
}

export async function saveSiteContentAction(raw: unknown): Promise<{ ok: true } | Fail> {
  await requireOperator();
  const parsed = siteContentSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Some fields are invalid." };
  }
  await saveSiteContent(parsed.data);
  refresh();
  return { ok: true };
}

export async function createPortraitUploadUrl(input: {
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
  const { key, url } = await presignUpload({
    scope: "private",
    contentType,
    ext,
    prefix: originalPrefix("portrait"),
  });
  return { ok: true, key, url };
}

export async function processPortraitAction(
  originalKey: string,
): Promise<{ ok: true; url: string; width: number; height: number } | Fail> {
  await requireOperator();
  if (!isOriginalKey("portrait", originalKey)) {
    return { ok: false, error: "Upload the image first." };
  }
  try {
    const processed = await processDisplayUpload("portrait", originalKey);
    await setPortrait(originalKey, processed);
    refresh();
    return { ok: true, url: publicUrl(processed.key), width: processed.width, height: processed.height };
  } catch {
    await deleteObject({ scope: "private", key: originalKey }).catch(() => {});
    return { ok: false, error: "Couldn't read this image — is it a complete JPEG/PNG/WebP file?" };
  }
}

export async function removePortraitAction(): Promise<void> {
  await requireOperator();
  await removePortrait();
  refresh();
}
