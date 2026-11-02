// lib/server/site-content.ts
//
// Portfolio-only revamp (R4) — the single SiteContent row (id "site"): Home
// hero + tagline + About teaser, the About page (bio, portrait, record lists)
// and the contact channels. Only lib/server touches Prisma/R2 (AD-2). The
// portrait's R2 objects are owned by the row (AD-15): replacing or removing
// the portrait deletes the old public copy and private original.

import { prisma } from "@/lib/server/db";
import { deleteObject, publicUrl } from "@/lib/server/storage";
import type { ProcessedImage } from "@/lib/server/portfolio-image";
import type { SiteContentInput } from "@/lib/validation/site-schemas";

const ID = "site";

export type SiteContent = SiteContentInput & {
  portrait: { url: string; width: number; height: number; blurDataUrl: string } | null;
};

export type RecordEntry = { year: string | null; text: string; url: string | null };

const EMPTY: SiteContentInput = {
  heroImageId: null,
  taglineVi: null,
  taglineEn: null,
  aboutTeaserVi: null,
  aboutTeaserEn: null,
  bioVi: null,
  bioEn: null,
  exhibitionsVi: null,
  exhibitionsEn: null,
  awardsVi: null,
  awardsEn: null,
  pressVi: null,
  pressEn: null,
  email: null,
  facebookUrl: null,
  zalo: null,
};

/** The site's content; an empty shell before the operator has saved once. */
export async function getSiteContent(): Promise<SiteContent> {
  const row = await prisma.siteContent.findUnique({ where: { id: ID } });
  if (!row) return { ...EMPTY, portrait: null };
  const {
    portraitKey,
    portraitWidth,
    portraitHeight,
    portraitBlurDataUrl,
    ...rest
  } = row;
  const fields = Object.fromEntries(
    Object.keys(EMPTY).map((k) => [k, rest[k as keyof typeof rest] ?? null]),
  ) as SiteContentInput;
  return {
    ...fields,
    portrait:
      portraitKey && portraitWidth && portraitHeight
        ? {
            url: publicUrl(portraitKey),
            width: portraitWidth,
            height: portraitHeight,
            blurDataUrl: portraitBlurDataUrl ?? "",
          }
        : null,
  };
}

export async function saveSiteContent(input: SiteContentInput): Promise<void> {
  if (input.heroImageId) {
    const exists = await prisma.portfolioImage.count({ where: { id: input.heroImageId } });
    if (!exists) input = { ...input, heroImageId: null };
  }
  await prisma.siteContent.upsert({
    where: { id: ID },
    create: { id: ID, ...input },
    update: input,
  });
}

async function dropPortraitObjects(row: {
  portraitKey: string | null;
  portraitOriginalKey: string | null;
} | null): Promise<void> {
  if (!row) return;
  await Promise.allSettled([
    row.portraitKey ? deleteObject({ scope: "public", key: row.portraitKey }) : null,
    row.portraitOriginalKey
      ? deleteObject({ scope: "private", key: row.portraitOriginalKey })
      : null,
  ]);
}

export async function setPortrait(originalKey: string, processed: ProcessedImage): Promise<void> {
  const previous = await prisma.siteContent.findUnique({
    where: { id: ID },
    select: { portraitKey: true, portraitOriginalKey: true },
  });
  const data = {
    portraitKey: processed.key,
    portraitOriginalKey: originalKey,
    portraitWidth: processed.width,
    portraitHeight: processed.height,
    portraitBlurDataUrl: processed.blurDataUrl,
  };
  await prisma.siteContent.upsert({ where: { id: ID }, create: { id: ID, ...data }, update: data });
  await dropPortraitObjects(previous);
}

export async function removePortrait(): Promise<void> {
  const previous = await prisma.siteContent.findUnique({
    where: { id: ID },
    select: { portraitKey: true, portraitOriginalKey: true },
  });
  if (!previous) return;
  await prisma.siteContent.update({
    where: { id: ID },
    data: {
      portraitKey: null,
      portraitOriginalKey: null,
      portraitWidth: null,
      portraitHeight: null,
      portraitBlurDataUrl: null,
    },
  });
  await dropPortraitObjects(previous);
}

/**
 * Parses a record textarea — one entry per line:
 *   "2025 | Exhibition name, venue | https://optional-link"
 * The year (or a span like "2017–2024") and link are optional. A line that
 * doesn't follow the format is kept as plain text, never dropped.
 */
export function parseRecord(text: string | null | undefined): RecordEntry[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      let year: string | null = null;
      let url: string | null = null;
      if (parts.length > 1 && /^\d{4}(\s*[–-]\s*(\d{4}|nay|now|present))?$/i.test(parts[0])) {
        year = parts.shift()!;
      }
      if (parts.length > 1 && /^https?:\/\/\S+$/.test(parts[parts.length - 1])) {
        url = parts.pop()!;
      }
      return { year, text: parts.join(" | "), url };
    })
    .filter((e) => e.text);
}
