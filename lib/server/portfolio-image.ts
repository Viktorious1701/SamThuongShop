// lib/server/portfolio-image.ts
//
// Story 1.6 (D5), generalized by the revamp — turns a just-uploaded original
// into its public display copy. The browser has already PUT the full-
// resolution file into the PRIVATE bucket (presigned, so large files never
// pass through a server function — Vercel's ~4.5 MB body cap). Here we read
// it back, auto-rotate from EXIF, downsize, strip all metadata (sharp drops
// EXIF/GPS by default and converts to sRGB) and write a JPEG to the PUBLIC
// bucket under a fresh non-derivable key (AD-15). The original stays private.
//
// Kinds:
//   portfolio → gallery photos, ≤2400 px, public prefix "portfolio/"
//   portrait  → the About portrait, ≤1200 px, public prefix "site/"
// Each kind only accepts originals under its own private prefix, so a caller
// can never push e.g. a sellable Digital Download original into public.

import sharp from "sharp";
import { getObject, putObject, randomKey } from "@/lib/server/storage";

export type ImageKind = "portfolio" | "portrait";

const KINDS: Record<ImageKind, { originalPrefix: string; publicPrefix: string; maxEdge: number }> = {
  portfolio: { originalPrefix: "originals/portfolio", publicPrefix: "portfolio", maxEdge: 2400 },
  portrait: { originalPrefix: "originals/site", publicPrefix: "site", maxEdge: 1200 },
};

const JPEG_QUALITY = 85;
const BLUR_EDGE = 16; // tiny placeholder, inlined as a data URL

export type ProcessedImage = {
  key: string; // public, resized
  width: number;
  height: number;
  blurDataUrl: string;
};

export function originalPrefix(kind: ImageKind): string {
  return KINDS[kind].originalPrefix;
}

export function isOriginalKey(kind: ImageKind, key: string): boolean {
  return (
    key.startsWith(`${KINDS[kind].originalPrefix}/`) &&
    !key.includes("..") &&
    key.length < 200
  );
}

export async function processDisplayUpload(
  kind: ImageKind,
  originalKey: string,
): Promise<ProcessedImage> {
  if (!isOriginalKey(kind, originalKey)) {
    throw new Error(`Not a ${kind} original key.`);
  }
  const { maxEdge, publicPrefix } = KINDS[kind];

  const original = await getObject({ scope: "private", key: originalKey });

  // .rotate() with no args applies the EXIF orientation, so portrait shots
  // aren't stored sideways once the metadata is stripped.
  const base = sharp(original, { failOn: "error" }).rotate();

  const { data, info } = await base
    .clone()
    .resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const blur = await base
    .clone()
    .resize(BLUR_EDGE, BLUR_EDGE, { fit: "inside" })
    .jpeg({ quality: 50 })
    .toBuffer();

  const key = randomKey(publicPrefix, "jpg");
  await putObject({
    scope: "public",
    key,
    body: data,
    contentType: "image/jpeg",
    // The key is random and never reused, so the object can cache forever.
    cacheControl: "public, max-age=31536000, immutable",
  });

  return {
    key,
    width: info.width,
    height: info.height,
    blurDataUrl: `data:image/jpeg;base64,${blur.toString("base64")}`,
  };
}
