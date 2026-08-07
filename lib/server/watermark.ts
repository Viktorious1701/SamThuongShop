// lib/server/watermark.ts
//
// Story 2.2 (AR-7, NFR-4) — generates the public, watermarked, downsized
// PREVIEW for a Digital Download from its private original. The original is
// never served before purchase (AD-6); this preview is what the storefront
// will show (Story 2.4). Runs server-side: it downloads the original from the
// PRIVATE bucket, stamps it with sharp, and uploads the result to the PUBLIC
// bucket under a non-derivable key (AD-15). Only lib/server touches storage
// and image processing (AD-2).

import sharp from "sharp";
import { getObject, putObject, randomKey } from "@/lib/server/storage";

const WATERMARK_TEXT = "© Sâm Thương";
const MAX_EDGE = 1600; // longest-edge px for the preview
const TILE = 320; // watermark tile size (px)

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** A tileable SVG carrying one rotated, semi-transparent wordmark. Composited
 * with `tile: true` it repeats across the whole image (diagonal, ~-35°), so it
 * can't be cropped out. A thin dark stroke behind the white fill keeps it
 * legible over both light and dark areas of a photo. */
function watermarkTile(): Buffer {
  const text = xmlEscape(WATERMARK_TEXT);
  const svg = `<svg width="${TILE}" height="${TILE}" xmlns="http://www.w3.org/2000/svg">
  <text x="${TILE / 2}" y="${TILE / 2}"
        font-family="DejaVu Sans, sans-serif" font-size="26" font-weight="600"
        text-anchor="middle" dominant-baseline="middle"
        transform="rotate(-35 ${TILE / 2} ${TILE / 2})"
        fill="#ffffff" fill-opacity="0.30"
        stroke="#000000" stroke-opacity="0.18" stroke-width="1"
        paint-order="stroke">${text}</text>
</svg>`;
  return Buffer.from(svg);
}

/**
 * Reads the private original at `originalKey`, produces a watermarked JPEG
 * preview (≤ MAX_EDGE on the longest edge), uploads it to the PUBLIC bucket,
 * and returns the new preview key.
 */
export async function generateWatermarkedPreview(
  originalKey: string,
): Promise<string> {
  const original = await getObject({ scope: "private", key: originalKey });

  const preview = await sharp(original)
    .rotate() // honour EXIF orientation
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .composite([{ input: watermarkTile(), tile: true, blend: "over" }])
    .jpeg({ quality: 80 })
    .toBuffer();

  const previewKey = randomKey("previews", "jpg");
  await putObject({
    scope: "public",
    key: previewKey,
    body: preview,
    contentType: "image/jpeg",
  });
  return previewKey;
}
