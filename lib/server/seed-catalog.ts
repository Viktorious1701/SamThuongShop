// lib/server/seed-catalog.ts
//
// Story 2.1 — idempotent demo catalog seed. Uploads a few placeholder bird
// images to R2 (public display + a private "original") and creates published
// demo Products so the admin has real content immediately. All Prisma +
// storage access stays in lib/server (AD-2). Skips any product whose slug
// already exists, so re-running is safe. Requires R2 to be configured — the
// caller (prisma/seed.ts) skips this when the R2 env is absent.
//
// Demo objects use deterministic `seed/…` keys (re-runs overwrite in place,
// no orphans). Real operator uploads get non-derivable random keys (AD-15).

import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/server/db";
import { putObject } from "@/lib/server/storage";

type DemoProduct = {
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  imageFile: string; // under public/placeholders/portfolio/
  printLabel: string;
  printPriceVnd: number;
  digitalLabel: string;
  digitalPriceVnd: number;
};

// Example size/tier labels + prices — the operator renames these freely
// (OQ-3 stays open; the model takes arbitrary labels).
const DEMO: DemoProduct[] = [
  {
    slug: "demo-common-kingfisher",
    nameVi: "Bói cá lam",
    nameEn: "Common Kingfisher",
    descriptionVi: "Ảnh minh họa demo — thay bằng ảnh thật của Sâm Thương.",
    descriptionEn: "Demo placeholder — replace with Sam Thuong's real photo.",
    imageFile: "bird-01.jpg",
    printLabel: "A3",
    printPriceVnd: 450000,
    digitalLabel: "Web tier",
    digitalPriceVnd: 150000,
  },
  {
    slug: "demo-sarus-crane",
    nameVi: "Sếu đầu đỏ",
    nameEn: "Sarus Crane",
    descriptionVi: "Ảnh minh họa demo — thay bằng ảnh thật của Sâm Thương.",
    descriptionEn: "Demo placeholder — replace with Sam Thuong's real photo.",
    imageFile: "bird-03.jpg",
    printLabel: "A2",
    printPriceVnd: 750000,
    digitalLabel: "Print tier",
    digitalPriceVnd: 300000,
  },
  {
    slug: "demo-oriental-dwarf-kingfisher",
    nameVi: "Bồng chanh đỏ",
    nameEn: "Oriental Dwarf Kingfisher",
    descriptionVi: "Ảnh minh họa demo — thay bằng ảnh thật của Sâm Thương.",
    descriptionEn: "Demo placeholder — replace with Sam Thuong's real photo.",
    imageFile: "bird-05.jpg",
    printLabel: "A4",
    printPriceVnd: 350000,
    digitalLabel: "Web tier",
    digitalPriceVnd: 150000,
  },
];

export function isR2Configured(): boolean {
  return Boolean(
    process.env["R2_ACCOUNT_ID"] &&
      process.env["R2_ACCESS_KEY_ID"] &&
      process.env["R2_SECRET_ACCESS_KEY"] &&
      process.env["R2_BUCKET_PUBLIC"] &&
      process.env["R2_BUCKET_PRIVATE"],
  );
}

export async function seedDemoCatalog(): Promise<void> {
  for (const d of DEMO) {
    const existing = await prisma.product.findUnique({
      where: { slug: d.slug },
    });
    if (existing) {
      console.log(`Demo product already present, skipping: ${d.slug}`);
      continue;
    }

    const buf = await readFile(
      path.join(process.cwd(), "public/placeholders/portfolio", d.imageFile),
    );
    const imageKey = `seed/${d.slug}.jpg`;
    const originalKey = `seed/${d.slug}-original.jpg`;

    await putObject({
      scope: "public",
      key: imageKey,
      body: buf,
      contentType: "image/jpeg",
    });
    await putObject({
      scope: "private",
      key: originalKey,
      body: buf,
      contentType: "image/jpeg",
    });

    await prisma.product.create({
      data: {
        slug: d.slug,
        nameVi: d.nameVi,
        nameEn: d.nameEn,
        descriptionVi: d.descriptionVi,
        descriptionEn: d.descriptionEn,
        published: true,
        images: { create: [{ key: imageKey, alt: d.nameEn, position: 0 }] },
        variants: {
          create: [
            {
              format: "PRINT",
              label: d.printLabel,
              priceVnd: d.printPriceVnd,
              position: 0,
            },
            {
              format: "DIGITAL",
              label: d.digitalLabel,
              priceVnd: d.digitalPriceVnd,
              position: 1,
              originalKey,
              originalFilename: `${d.slug}.jpg`,
              contentType: "image/jpeg",
              sizeBytes: buf.length,
            },
          ],
        },
      },
    });
    console.log(`Seeded demo product: ${d.slug}`);
  }
}
