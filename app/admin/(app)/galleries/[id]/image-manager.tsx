"use client";

// app/admin/(app)/galleries/[id]/image-manager.tsx
//
// Story 1.6 — the operator's image manager for one (leaf) gallery.
//
// Upload (D5/D6): pick or drop many files; each runs
//   presign → browser PUT to the PRIVATE bucket → server resize/process
// with at most UPLOAD_CONCURRENCY in flight. Bytes never pass through a
// server function (Vercel ~4.5 MB body cap). A failure only affects that
// file, which gets Retry (re-processing reuses the already-uploaded original)
// or Remove (which discards the private original).
//
// Details: per-photo caption + place/date (vi+en), Featured, ↑/↓ reorder
// and delete. (Revamp: the print link is gone.) Local state is the source of truth for
// the list so edits don't fight the server refresh.

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import {
  createPortfolioUploadUrl,
  deleteImageAction,
  discardPortfolioOriginalAction,
  moveImageAction,
  processPortfolioImageAction,
  saveImageDetailsAction,
} from "../actions";
import type { AdminImage } from "@/lib/server/portfolio";

const UPLOAD_CONCURRENCY = 3;
const MAX_FILE_BYTES = 80 * 1024 * 1024; // 80 MB per original

const TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  tif: "image/tiff",
  tiff: "image/tiff",
};

type QueueStatus = "queued" | "uploading" | "processing" | "error";
type QueueItem = {
  id: number;
  file: File;
  status: QueueStatus;
  error: string | null;
  originalKey: string | null; // set once the PUT succeeded
};

function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function contentTypeOf(file: File): string {
  return file.type || TYPE_BY_EXT[extOf(file.name)] || "application/octet-stream";
}

const btn =
  "rounded-full border border-border px-3 py-1.5 text-caption text-ink hover:bg-surface-sunken disabled:opacity-40";
const input =
  "w-full rounded-md border border-ink-muted bg-surface px-3 py-2 text-body text-ink focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-deep";

export function ImageManager({
  galleryId,
  initialImages,
}: {
  galleryId: string;
  initialImages: AdminImage[];
}) {
  const [images, setImages] = useState<AdminImage[]>(initialImages);

  // --- upload queue ---
  // The ref is what the async pump reads/mutates (always fresh); `queue` is a
  // snapshot copy for rendering (refs mustn't be read during render).
  const queueRef = useRef<QueueItem[]>([]);
  const nextId = useRef(1);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const rerender = () => setQueue(queueRef.current.map((q) => ({ ...q })));
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function patch(id: number, changes: Partial<QueueItem>) {
    const item = queueRef.current.find((q) => q.id === id);
    if (item) Object.assign(item, changes);
    rerender();
  }

  function drop(id: number) {
    queueRef.current = queueRef.current.filter((q) => q.id !== id);
    rerender();
  }

  async function run(item: QueueItem) {
    try {
      if (!item.originalKey) {
        patch(item.id, { status: "uploading", error: null });
        const contentType = contentTypeOf(item.file);
        const presigned = await createPortfolioUploadUrl({
          galleryId,
          contentType,
          ext: extOf(item.file.name),
        });
        if (!presigned.ok) throw new Error(presigned.error);
        const put = await fetch(presigned.url, {
          method: "PUT",
          body: item.file,
          headers: { "Content-Type": contentType },
        });
        if (!put.ok) {
          throw new Error(`Upload failed (${put.status}). Check the bucket CORS policy.`);
        }
        patch(item.id, { originalKey: presigned.key });
      }

      patch(item.id, { status: "processing", error: null });
      const result = await processPortfolioImageAction(galleryId, item.originalKey!);
      if (!result.ok) throw new Error(result.error);

      setImages((prev) => [...prev, result.image]);
      drop(item.id);
    } catch (e) {
      patch(item.id, {
        status: "error",
        error: e instanceof Error ? e.message : "Something went wrong.",
      });
    } finally {
      pump();
    }
  }

  function pump() {
    const q = queueRef.current;
    let active = q.filter((i) => i.status === "uploading" || i.status === "processing").length;
    for (const item of q) {
      if (active >= UPLOAD_CONCURRENCY) break;
      if (item.status !== "queued") continue;
      item.status = "uploading"; // claim synchronously so it isn't started twice
      active++;
      void run(item);
    }
    rerender();
  }

  function enqueue(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      const tooBig = file.size > MAX_FILE_BYTES;
      const known = !!(file.type.startsWith("image/") || TYPE_BY_EXT[extOf(file.name)]);
      queueRef.current.push({
        id: nextId.current++,
        file,
        status: tooBig || !known ? "error" : "queued",
        error: tooBig
          ? "File is larger than 80 MB."
          : !known
            ? "Not an image file."
            : null,
        originalKey: null,
      });
    }
    pump();
  }

  function retry(id: number) {
    patch(id, { status: "queued", error: null });
    pump();
  }

  function remove(id: number) {
    const item = queueRef.current.find((q) => q.id === id);
    if (item?.originalKey) void discardPortfolioOriginalAction(item.originalKey);
    drop(id);
  }

  const busy = queue.filter((i) => i.status !== "error").length;

  // --- list operations ---
  function move(index: number, dir: "up" | "down") {
    const j = dir === "up" ? index - 1 : index + 1;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[index], next[j]] = [next[j], next[index]];
    setImages(next);
    void moveImageAction(images[index].id, galleryId, dir);
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((i) => i.id !== id));
    void deleteImageAction(id, galleryId);
  }

  return (
    <section className="space-y-6" aria-labelledby="images-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="images-heading" className="text-h3 text-ink">
          Images ({images.length})
        </h2>
        {busy > 0 ? (
          <p role="status" className="text-caption text-ink-muted">
            Uploading {busy} image{busy === 1 ? "" : "s"}…
          </p>
        ) : null}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) enqueue(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-3 rounded-md border-2 border-dashed p-8 text-center ${
          dragOver ? "border-sky-deep bg-sky-soft/10" : "border-border bg-surface"
        }`}
      >
        <p className="text-body text-ink">Drop photos here, or</p>
        <button
          type="button"
          className="rounded-full bg-sky-deep px-5 py-2.5 text-caption text-white hover:bg-[#3D5464]"
          onClick={() => fileInput.current?.click()}
        >
          Choose photos…
        </button>
        <p className="text-caption text-ink-muted">
          JPEG, PNG, WebP, AVIF or TIFF, up to 80 MB each. The original is kept
          private; visitors see a copy resized to 2400 px with camera/GPS data
          removed.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/tiff,.tif,.tiff"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) enqueue(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {queue.length > 0 ? (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {queue.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-2">
              <span className="min-w-0 flex-1 truncate text-caption text-ink">
                {item.file.name}
              </span>
              {item.status === "error" ? (
                <>
                  <span role="alert" className="text-caption text-error">
                    {item.error}
                  </span>
                  <button type="button" className={btn} onClick={() => retry(item.id)}>
                    Retry
                  </button>
                  <button type="button" className={btn} onClick={() => remove(item.id)}>
                    Remove
                  </button>
                </>
              ) : (
                <span className="text-caption text-ink-muted">
                  {item.status === "queued"
                    ? "Waiting…"
                    : item.status === "uploading"
                      ? "Uploading…"
                      : "Processing…"}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {images.length === 0 ? (
        <p className="text-body text-ink-muted">No images in this gallery yet.</p>
      ) : (
        <ol className="space-y-4">
          {images.map((img, i) => (
            <ImageRow
              key={img.id}
              image={img}
              galleryId={galleryId}
              isFirst={i === 0}
              isLast={i === images.length - 1}
              onMove={(dir) => move(i, dir)}
              onDelete={() => removeImage(img.id)}
              onSaved={(updated) =>
                setImages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
              }
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function ImageRow({
  image,
  galleryId,
  isFirst,
  isLast,
  onMove,
  onDelete,
  onSaved,
}: {
  image: AdminImage;
  galleryId: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: "up" | "down") => void;
  onDelete: () => void;
  onSaved: (img: AdminImage) => void;
}) {
  const [draft, setDraft] = useState({
    captionVi: image.captionVi ?? "",
    captionEn: image.captionEn ?? "",
    locationVi: image.locationVi ?? "",
    locationEn: image.locationEn ?? "",
    featured: image.featured,
  });
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty =
    draft.captionVi !== (image.captionVi ?? "") ||
    draft.captionEn !== (image.captionEn ?? "") ||
    draft.locationVi !== (image.locationVi ?? "") ||
    draft.locationEn !== (image.locationEn ?? "") ||
    draft.featured !== image.featured;

  const field = (name: keyof typeof draft, label: string, placeholder: string) => (
    <label className="space-y-1">
      <span className="text-caption text-ink">{label}</span>
      <input
        className={input}
        value={draft[name] as string}
        placeholder={placeholder}
        onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
      />
    </label>
  );

  function save() {
    setMessage(null);
    start(async () => {
      const result = await saveImageDetailsAction(image.id, galleryId, draft);
      if (!result.ok) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      const clean = (v: string) => v.trim() || null;
      onSaved({
        ...image,
        captionVi: clean(draft.captionVi),
        captionEn: clean(draft.captionEn),
        locationVi: clean(draft.locationVi),
        locationEn: clean(draft.locationEn),
        featured: draft.featured,
      });
      setMessage({ ok: true, text: "Saved." });
    });
  }

  const label = image.captionEn || image.captionVi || "Untitled photo";

  return (
    <li className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4 md:flex-row">
      <div className="shrink-0">
        <Image
          src={image.url}
          alt={label}
          width={image.width}
          height={image.height}
          sizes="160px"
          className="h-auto w-40 rounded-sm bg-surface-sunken"
        />
        <p className="mt-1 text-caption text-ink-muted">
          {image.width} × {image.height}
        </p>
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {field("captionVi", "Caption (Vietnamese)", "Sếu đầu đỏ")}
          {field("captionEn", "Caption (English)", "Sarus Crane")}
          {field("locationVi", "Place & date (Vietnamese)", "Tràm Chim, 2024")}
          {field("locationEn", "Place & date (English)", "Tram Chim, 2024")}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-body text-ink">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
              className="h-4 w-4 accent-sky-deep"
            />
            Featured
          </label>

        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="rounded-full bg-sky-deep px-4 py-1.5 text-caption text-white hover:bg-[#3D5464] disabled:opacity-40"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className={btn}
            disabled={isFirst}
            aria-label={`Move ${label} up`}
            onClick={() => onMove("up")}
          >
            ↑
          </button>
          <button
            type="button"
            className={btn}
            disabled={isLast}
            aria-label={`Move ${label} down`}
            onClick={() => onMove("down")}
          >
            ↓
          </button>
          <button
            type="button"
            className={`${btn} text-error`}
            onClick={() => {
              if (window.confirm(`Delete “${label}”? This can't be undone.`)) onDelete();
            }}
          >
            Delete
          </button>
          {dirty && !pending ? (
            <span className="text-caption text-pending">Unsaved changes</span>
          ) : null}
          {message ? (
            <span
              role={message.ok ? "status" : "alert"}
              className={`text-caption ${message.ok ? "text-success" : "text-error"}`}
            >
              {message.text}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}
