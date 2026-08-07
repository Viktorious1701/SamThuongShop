// lib/server/storage.ts
//
// Cloudflare R2 object storage (S3-compatible). Only lib/server touches
// storage (AD-2), mirroring the db.ts singleton pattern.
//
// Two buckets (AD-15 — two-tier asset storage):
//   - "public"  → display images + watermarked previews (viewable)
//   - "private" → sellable Digital Download originals (never served before
//                 payment; delivered via presigned download in Epic 3)
// Every object key is non-derivable (random UUID) and owned by its DB row,
// so one unit can never guess another's path.
//
// Uploads go BROWSER → R2 directly via presigned PUT URLs: on Vercel's free
// tier any body routed through a server function is capped at ~4.5 MB, and
// Digital Download originals exceed that. The server only issues the URL and
// later persists the returned key.

import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type StorageScope = "public" | "private";

const PRESIGN_EXPIRY_SECONDS = 600; // 10 minutes to complete an upload

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required R2 env var: ${name}`);
  }
  return value;
}

const globalForR2 = globalThis as unknown as { r2: S3Client | undefined };

function createClient(): S3Client {
  const accountId = env("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint:
      process.env["R2_ENDPOINT"] ||
      `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  });
}

function client(): S3Client {
  return (globalForR2.r2 ??= createClient());
}

function bucketFor(scope: StorageScope): string {
  return scope === "private"
    ? env("R2_BUCKET_PRIVATE")
    : env("R2_BUCKET_PUBLIC");
}

/** Non-derivable object key: `<prefix>/<uuid>.<ext>` (AD-15). */
export function randomKey(prefix: string, ext: string): string {
  const clean = ext.replace(/^\.+/, "").toLowerCase() || "bin";
  return `${prefix}/${randomUUID()}.${clean}`;
}

/**
 * Issues a short-lived presigned PUT URL for a direct browser → R2 upload,
 * plus the (already-decided) object key the caller persists on save.
 */
export async function presignUpload(input: {
  scope: StorageScope;
  contentType: string;
  ext: string;
  prefix?: string;
}): Promise<{ key: string; url: string }> {
  const prefix = input.prefix ?? (input.scope === "private" ? "originals" : "images");
  const key = randomKey(prefix, input.ext);
  const url = await getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: bucketFor(input.scope),
      Key: key,
      ContentType: input.contentType,
    }),
    { expiresIn: PRESIGN_EXPIRY_SECONDS },
  );
  return { key, url };
}

/** Public URL for a viewable object (only meaningful for the public bucket). */
export function publicUrl(key: string): string {
  const base = env("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
  return `${base}/${key}`;
}

/** Server-side upload — used by the seed (small placeholder files only). */
export async function putObject(input: {
  scope: StorageScope;
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<void> {
  await client().send(
    new PutObjectCommand({
      Bucket: bucketFor(input.scope),
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );
}

/** Best-effort delete used when a Product / image / variant is removed. */
export async function deleteObject(input: {
  scope: StorageScope;
  key: string;
}): Promise<void> {
  await client().send(
    new DeleteObjectCommand({
      Bucket: bucketFor(input.scope),
      Key: input.key,
    }),
  );
}
