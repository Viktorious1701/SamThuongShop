"use client";

// app/admin/(app)/galleries/gallery-editor.tsx
//
// Create/edit a Gallery (one category of work): bilingual name +
// description and an optional URL name. English-only (/admin is outside
// next-intl). On create it moves straight to the gallery's page so the
// operator can start uploading. Revamp: no group/parent picker.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { saveGalleryAction } from "./actions";
import type { AdminGallery } from "@/lib/server/portfolio";

export function GalleryEditor({ initial }: { initial?: AdminGallery }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      nameVi: String(form.get("nameVi") ?? ""),
      nameEn: String(form.get("nameEn") ?? ""),
      slug: String(form.get("slug") ?? ""),
      descriptionVi: String(form.get("descriptionVi") ?? ""),
      descriptionEn: String(form.get("descriptionEn") ?? ""),
    };
    setError(null);
    setSaved(false);
    start(async () => {
      const result = await saveGalleryAction(initial?.id ?? null, payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (initial) {
        setSaved(true);
        router.refresh();
      } else {
        router.push(`/admin/galleries/${result.id}`);
      }
    });
  }


  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          id="nameVi"
          name="nameVi"
          label="Name (Vietnamese)"
          required
          requiredLabel="Required"
          placeholder="Chim"
          defaultValue={initial?.nameVi ?? ""}
        />
        <TextField
          id="nameEn"
          name="nameEn"
          label="Name (English)"
          required
          requiredLabel="Required"
          placeholder="Birds"
          defaultValue={initial?.nameEn ?? ""}
        />
      </div>


      <div className="space-y-1">
        <TextField
          id="slug"
          name="slug"
          label="URL name (optional)"
          placeholder="birds"
          defaultValue={initial?.slug ?? ""}
        />
        <p className="text-caption text-ink-muted">
          Shown as /work/<em>url-name</em>. Leave blank to make one from
          the English name.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TextareaField
          id="descriptionVi"
          name="descriptionVi"
          label="Description (Vietnamese)"
          defaultValue={initial?.descriptionVi ?? ""}
        />
        <TextareaField
          id="descriptionEn"
          name="descriptionEn"
          label="Description (English)"
          defaultValue={initial?.descriptionEn ?? ""}
        />
      </div>

      {error ? (
        <p role="alert" className="text-caption text-error">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-caption text-success">
          Saved.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-sky-deep px-6 py-3 text-caption text-white transition-colors hover:bg-[#3D5464] disabled:opacity-60"
      >
        {pending ? "Saving…" : initial ? "Save changes" : "Create gallery"}
      </button>
    </form>
  );
}
