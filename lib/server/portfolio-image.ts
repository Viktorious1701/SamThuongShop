// lib/server/portfolio-image.ts
//
// Story 1.6 (D5) — turns a just-uploaded portfolio original into its public
// display copy. The browser has already PUT the full-resolution file into the
// PRIVATE bucket (presigned, so large files never pass through a server
// function — Vercel's ~4.5 MB body cap). Here, server-side, we read it back,
// auto-rotate from EXIF, downsize to ≤ MAX_EDGE on the longest edge, strip all
// metadata (sharp drops EXIF/GPS by default and converts to sRGB), and write
// a JPEG to the PUBLIC bucket under a fresh non-derivable key (AD-15). The
// original stays private as Sam's archive and is never served.
//
// Mirrors lib/server/watermark.ts, minus the watermark: the portfolio shows
// clean images (EXPERIENCE.md → Gallery grid).

import sharp from "sharp";
import { getObject, putObject, randomKey } from "@/lib/server/storage";

const MAX_EDGE = 2400; // longest-edge px for the public display copy
const JPEG_QUALITY = 85;
const BLUR_EDGE = 16; // tiny placeholder, inlined as a data URL

/** Private-bucket prefix for portfolio originals. Processing refuses any
 * other key, so a caller can never push e.g. a sellable Digital Download
 * original (originals/…) into the public bucket. */
export const PORTFOLIO_ORIGINAL_PREFIX = "originals/portfolio";

export type ProcessedPortfolioImage = {
  key: string; // public, resized
  width: number;
  height: number;
  blurDataUrl: string;
};

export function isPortfolioOriginalKey(key: string): boolean {
  return (
    key.startsWith(`${PORTFOLIO_ORIGINAL_PREFIX}/`) &&
    !key.includes("..") &&
    key.length < 200
  );
}

export async function processPortfolioUpload(
  originalKey: string,
): Promise<ProcessedPortfolioImage> {
  if (!isPortfolioOriginalKey(originalKey)) {
    throw new Error("Not a portfolio original key.");
  }

  const original = await getObject({ scope: "private", key: originalKey });

  // .rotate() with no args applies the EXIF orientation, so portrait shots
  // aren't stored sideways once the metadata is stripped.
  const base = sharp(original, { failOn: "error" }).rotate();

  const { data, info } = await base
    .clone()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const blur = await base
    .clone()
    .resize(BLUR_EDGE, BLUR_EDGE, { fit: "inside" })
    .jpeg({ quality: 50 })
    .toBuffer();

  const key = randomKey("portfolio", "jpg");
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
