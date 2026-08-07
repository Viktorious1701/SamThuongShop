"use client";

// app/admin/(app)/products/product-editor.tsx
//
// Story 2.1 — the operator's create/edit product form. Richer than the auth
// forms: dynamic variant rows and image uploads, so it manages its own React
// state and calls the Server Actions directly (rather than a single
// <form action>). Files are uploaded to R2 via a presigned PUT the moment
// they're picked; only the resulting object KEYS are submitted on save.
// English-only (/admin is outside next-intl).

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { SelectField } from "@/components/form/select-field";
import { createUploadUrl, generatePreviewAction, saveProduct } from "./actions";
import type { ProductDTO } from "@/lib/server/product";

type ImageState = { key: string; url: string; alt: string };
type VariantState = {
  format: "PRINT" | "DIGITAL";
  label: string;
  priceVnd: string;
  originalKey: string | null;
  originalFilename: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  previewKey: string | null;
  previewUrl: string | null;
};

const FORMAT_OPTIONS = [
  { value: "PRINT", label: "Physical Print (size)" },
  { value: "DIGITAL", label: "Digital Download (tier)" },
];

function emptyVariant(): VariantState {
  return {
    format: "PRINT",
    label: "",
    priceVnd: "",
    originalKey: null,
    originalFilename: null,
    contentType: null,
    sizeBytes: null,
    previewKey: null,
    previewUrl: null,
  };
}

function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1) : "";
}

/** Uploads a File straight to R2 through a presigned PUT; returns the key
 * (and, for public images, the viewable URL). */
async function uploadToR2(
  file: File,
  scope: "public" | "private",
): Promise<{ key: string; publicUrl: string | null }> {
  const presigned = await createUploadUrl({
    scope,
    contentType: file.type || "application/octet-stream",
    ext: extOf(file.name),
  });
  if (!presigned.ok) throw new Error(presigned.error);

  const put = await fetch(presigned.url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!put.ok) {
    throw new Error(`Upload failed (${put.status}). Check the bucket CORS policy.`);
  }
  return { key: presigned.key, publicUrl: presigned.publicUrl };
}

export function ProductEditor({
  initial,
  productId,
}: {
  initial?: ProductDTO;
  productId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nameVi, setNameVi] = useState(initial?.nameVi ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [descriptionVi, setDescriptionVi] = useState(initial?.descriptionVi ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initial?.descriptionEn ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [images, setImages] = useState<ImageState[]>(
    initial?.images.map((i) => ({ key: i.key, url: i.url, alt: i.alt ?? "" })) ?? [],
  );
  const [variants, setVariants] = useState<VariantState[]>(
    initial?.variants.map((v) => ({
      format: v.format,
      label: v.label,
      priceVnd: String(v.priceVnd),
      originalKey: v.originalKey,
      originalFilename: v.originalFilename,
      contentType: v.contentType,
      sizeBytes: v.sizeBytes,
      previewKey: v.previewKey,
      previewUrl: v.previewUrl,
    })) ?? [emptyVariant()],
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function patchVariant(index: number, patch: Partial<VariantState>) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );
  }

  async function onAddImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const { key, publicUrl } = await uploadToR2(file, "public");
        setImages((prev) => [...prev, { key, url: publicUrl ?? "", alt: "" }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed.");
    } finally {
      setBusy(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function onUploadOriginal(index: number, file: File | null) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const { key } = await uploadToR2(file, "private");
      // Clear any prior preview until the new one is generated.
      patchVariant(index, {
        originalKey: key,
        originalFilename: file.name,
        contentType: file.type || null,
        sizeBytes: file.size,
        previewKey: null,
        previewUrl: null,
      });
      // Story 2.2 — generate the watermarked public preview from the original.
      const preview = await generatePreviewAction(key);
      if (preview.ok) {
        patchVariant(index, {
          previewKey: preview.previewKey,
          previewUrl: preview.previewUrl,
        });
      } else {
        setError(preview.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Original upload failed.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit() {
    setError(null);
    const payload = {
      nameVi: nameVi.trim(),
      nameEn: nameEn.trim(),
      descriptionVi: descriptionVi.trim() || null,
      descriptionEn: descriptionEn.trim() || null,
      published,
      images: images.map((im, i) => ({
        key: im.key,
        alt: im.alt.trim() || null,
        position: i,
      })),
      variants: variants.map((v, i) => ({
        format: v.format,
        label: v.label.trim(),
        priceVnd: Number(v.priceVnd),
        position: i,
        ...(v.format === "DIGITAL"
          ? {
              originalKey: v.originalKey ?? "",
              originalFilename: v.originalFilename,
              contentType: v.contentType,
              sizeBytes: v.sizeBytes,
              previewKey: v.previewKey,
            }
          : {}),
      })),
    };

    startTransition(async () => {
      const result = await saveProduct(productId ?? null, payload);
      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form
      className="max-w-3xl space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      {/* Names + descriptions (bilingual) */}
      <section className="space-y-6">
        <h2 className="text-h3 text-ink">Details</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            id="nameVi"
            label="Name (Vietnamese)"
            required
            requiredLabel="Required"
            value={nameVi}
            onChange={(e) => setNameVi(e.target.value)}
          />
          <TextField
            id="nameEn"
            label="Name (English)"
            required
            requiredLabel="Required"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
          />
          <TextareaField
            id="descriptionVi"
            label="Description (Vietnamese)"
            value={descriptionVi}
            onChange={(e) => setDescriptionVi(e.target.value)}
          />
          <TextareaField
            id="descriptionEn"
            label="Description (English)"
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
          />
        </div>
      </section>

      {/* Display images */}
      <section className="space-y-4">
        <h2 className="text-h3 text-ink">Display images</h2>
        {images.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((img, index) => (
              <li
                key={img.key}
                className="space-y-2 rounded-md border border-border bg-surface p-3"
              >
                {/* Plain img: admin-only preview, no optimization needed */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt || "Display image preview"}
                  className="h-32 w-full rounded object-cover"
                />
                <TextField
                  id={`alt-${index}`}
                  label="Alt text"
                  value={img.alt}
                  onChange={(e) =>
                    setImages((prev) =>
                      prev.map((im, i) =>
                        i === index ? { ...im, alt: e.target.value } : im,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setImages((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-caption text-error hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-caption text-ink-muted">No images yet.</p>
        )}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onAddImages(e.target.files)}
          className="block text-caption text-ink file:mr-4 file:rounded-full file:border file:border-border file:bg-surface file:px-4 file:py-2 file:text-caption file:text-ink"
        />
      </section>

      {/* Variants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-ink">Variants</h2>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
            className="rounded-full border border-border px-4 py-2 text-caption text-ink hover:bg-surface-sunken"
          >
            + Add variant
          </button>
        </div>

        <ul className="space-y-4">
          {variants.map((v, index) => (
            <li
              key={index}
              className="space-y-4 rounded-md border border-border bg-surface p-4"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <SelectField
                  id={`format-${index}`}
                  label="Format"
                  options={FORMAT_OPTIONS}
                  value={v.format}
                  onChange={(e) =>
                    patchVariant(index, {
                      format: e.target.value as "PRINT" | "DIGITAL",
                    })
                  }
                />
                <TextField
                  id={`label-${index}`}
                  label="Label (size / tier)"
                  placeholder="e.g. A3 / Web tier"
                  value={v.label}
                  onChange={(e) => patchVariant(index, { label: e.target.value })}
                />
                <TextField
                  id={`price-${index}`}
                  label="Price (VND)"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={v.priceVnd}
                  onChange={(e) =>
                    patchVariant(index, { priceVnd: e.target.value })
                  }
                />
              </div>

              {v.format === "DIGITAL" ? (
                <div className="space-y-1">
                  <span className="text-caption text-ink">
                    Digital original (private)
                  </span>
                  <input
                    type="file"
                    onChange={(e) =>
                      onUploadOriginal(index, e.target.files?.[0] ?? null)
                    }
                    className="block text-caption text-ink file:mr-4 file:rounded-full file:border file:border-border file:bg-surface file:px-4 file:py-2 file:text-caption file:text-ink"
                  />
                  <p className="text-caption text-ink-muted">
                    {v.originalFilename
                      ? `Uploaded: ${v.originalFilename}`
                      : "No file uploaded yet."}
                  </p>
                  {v.previewUrl ? (
                    <div className="space-y-1 pt-1">
                      <span className="text-caption text-ink-muted">
                        Watermarked preview (shown to shoppers):
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.previewUrl}
                        alt="Watermarked preview"
                        className="h-40 w-auto rounded border border-border object-contain"
                      />
                    </div>
                  ) : v.originalKey ? (
                    <p className="text-caption text-ink-muted">
                      Generating watermarked preview…
                    </p>
                  ) : null}
                </div>
              ) : null}

              {variants.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setVariants((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-caption text-error hover:underline"
                >
                  Remove variant
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* Publish + save */}
      <section className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 accent-sky-deep"
          />
          <span className="text-body text-ink">
            Published (visible on the storefront)
          </span>
        </label>

        {error ? (
          <p role="alert" className="text-caption text-error">
            {error}
          </p>
        ) : null}
        {busy ? (
          <p className="text-caption text-ink-muted">Uploading…</p>
        ) : null}

        <div className="max-w-xs">
          <button
            type="submit"
            disabled={isPending || busy}
            className="w-full rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 disabled:bg-surface-sunken disabled:text-ink-muted"
          >
            {isPending ? "Saving…" : productId ? "Save changes" : "Create product"}
          </button>
        </div>
      </section>
    </form>
  );
}
