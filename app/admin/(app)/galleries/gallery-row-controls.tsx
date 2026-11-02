"use client";

// app/admin/(app)/galleries/gallery-row-controls.tsx
//
// Story 1.6 — per-row ↑/↓, publish and delete for the gallery tree (D7).
// Client-side so a blocked delete (D13: still has images / children) can show
// its reason inline instead of failing silently.

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  deleteGalleryAction,
  moveGalleryAction,
  setGalleryPublishedAction,
} from "./actions";

const btn =
  "rounded-full border border-border px-3 py-1.5 text-caption text-ink hover:bg-surface-sunken disabled:opacity-40";

export function GalleryRowControls({
  id,
  name,
  published,
  isFirst,
  isLast,
}: {
  id: string;
  name: string;
  published: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          className={btn}
          disabled={pending || isFirst}
          aria-label={`Move ${name} up`}
          onClick={() => start(() => moveGalleryAction(id, "up"))}
        >
          ↑
        </button>
        <button
          type="button"
          className={btn}
          disabled={pending || isLast}
          aria-label={`Move ${name} down`}
          onClick={() => start(() => moveGalleryAction(id, "down"))}
        >
          ↓
        </button>
        <Link href={`/admin/galleries/${id}`} className={btn}>
          Edit
        </Link>
        <button
          type="button"
          className={btn}
          disabled={pending}
          onClick={() => start(() => setGalleryPublishedAction(id, !published))}
        >
          {published ? "Unpublish" : "Publish"}
        </button>
        <button
          type="button"
          className={`${btn} text-error`}
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Delete the gallery "${name}"?`)) return;
            setError(null);
            start(async () => {
              const result = await deleteGalleryAction(id);
              if (!result.ok) setError(result.error);
            });
          }}
        >
          Delete
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-caption text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
