"use client";

// app/admin/(app)/site/site-editor.tsx
//
// Portfolio-only revamp (R4) — one form for everything on the public site
// that isn't a gallery, in four plain sections: Home (hero photo, tagline,
// About teaser), About (bio + portrait), Record (exhibitions / awards /
// press — one entry per line) and Contact (email, Facebook, Zalo).
// Vietnamese and English side by side; English may be left blank (the site
// then shows the Vietnamese). English-only UI (/admin is outside next-intl).

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPortraitUploadUrl,
  processPortraitAction,
  removePortraitAction,
  saveSiteContentAction,
} from "./actions";
import type { SiteContent } from "@/lib/server/site-content";
import type { ImageOption } from "@/lib/server/portfolio";

type Fields = Omit<SiteContent, "portrait">;

const input =
  "w-full rounded-md border border-ink-muted bg-surface px-3 py-2 text-body text-ink focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-deep";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border border-border bg-surface p-6">
      <div className="space-y-1">
        <h2 className="text-h3 text-ink">{title}</h2>
        {hint ? <p className="text-caption text-ink-muted">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function SiteEditor({ initial, photos }: { initial: SiteContent; photos: ImageOption[] }) {
  const router = useRouter();
  const { portrait: initialPortrait, ...initialFields } = initial;
  const [f, setF] = useState<Fields>(initialFields);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [portrait, setPortrait] = useState(initialPortrait);
  const [portraitBusy, setPortraitBusy] = useState(false);
  const [portraitError, setPortraitError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [key]: e.target.value });

  const pair = (
    keyVi: keyof Fields,
    keyEn: keyof Fields,
    label: string,
    opts: { rows?: number; placeholderVi?: string; placeholderEn?: string } = {},
  ) => (
    <div className="grid gap-4 md:grid-cols-2">
      {(
        [
          [keyVi, `${label} (Vietnamese)`, opts.placeholderVi],
          [keyEn, `${label} (English)`, opts.placeholderEn],
        ] as const
      ).map(([key, l, ph]) => (
        <label key={key} className="space-y-1">
          <span className="text-caption text-ink">{l}</span>
          {opts.rows ? (
            <textarea
              className={`${input} font-[inherit]`}
              rows={opts.rows}
              value={(f[key] as string | null) ?? ""}
              placeholder={ph}
              onChange={set(key)}
            />
          ) : (
            <input className={input} value={(f[key] as string | null) ?? ""} placeholder={ph} onChange={set(key)} />
          )}
        </label>
      ))}
    </div>
  );

  function save() {
    setMessage(null);
    start(async () => {
      const result = await saveSiteContentAction(f);
      setMessage(result.ok ? { ok: true, text: "Saved." } : { ok: false, text: result.error });
      if (result.ok) router.refresh();
    });
  }

  async function uploadPortrait(file: File) {
    setPortraitBusy(true);
    setPortraitError(null);
    try {
      const ext = file.name.includes(".") ? file.name.split(".").pop()! : "";
      const contentType = file.type || "image/jpeg";
      const presigned = await createPortraitUploadUrl({ contentType, ext });
      if (!presigned.ok) throw new Error(presigned.error);
      const put = await fetch(presigned.url, { method: "PUT", body: file, headers: { "Content-Type": contentType } });
      if (!put.ok) throw new Error(`Upload failed (${put.status}).`);
      const done = await processPortraitAction(presigned.key);
      if (!done.ok) throw new Error(done.error);
      setPortrait({ url: done.url, width: done.width, height: done.height, blurDataUrl: "" });
    } catch (e) {
      setPortraitError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setPortraitBusy(false);
    }
  }

  const recordHint =
    "One entry per line: year | text | link (link optional). Example: 2025 | Solo exhibition “Wings”, Hanoi | https://…";

  return (
    <div className="max-w-4xl space-y-8">
      <Section title="Home" hint="The big photo at the top of the Home page, and the line under the name.">
        <fieldset className="space-y-2">
          <legend className="text-caption text-ink">Hero photo</legend>
          {photos.length === 0 ? (
            <p className="text-caption text-ink-muted">Upload photos to a gallery first.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              <label className={`flex aspect-square cursor-pointer items-center justify-center rounded-sm border p-2 text-center text-caption ${!f.heroImageId ? "border-sky-deep ring-2 ring-sky-deep" : "border-border"}`}>
                <input type="radio" name="hero" className="sr-only" checked={!f.heroImageId} onChange={() => setF({ ...f, heroImageId: null })} />
                Automatic (first Featured photo)
              </label>
              {photos.map((p) => (
                <label
                  key={p.id}
                  title={`${p.galleryNameEn}${p.captionEn ? ` · ${p.captionEn}` : ""}`}
                  className={`relative aspect-square cursor-pointer overflow-hidden rounded-sm border ${f.heroImageId === p.id ? "border-sky-deep ring-2 ring-sky-deep" : "border-border"}`}
                >
                  <input type="radio" name="hero" className="sr-only" checked={f.heroImageId === p.id} onChange={() => setF({ ...f, heroImageId: p.id })} />
                  <Image src={p.url} alt={p.captionEn || p.captionVi || p.galleryNameEn} fill sizes="120px" className="object-cover" />
                </label>
              ))}
            </div>
          )}
        </fieldset>
        {pair("taglineVi", "taglineEn", "Tagline", {
          placeholderVi: "Chim, thể thao và con người — tại Việt Nam và khắp thế giới.",
          placeholderEn: "Birds, sport and people — in Vietnam and around the world.",
        })}
        {pair("aboutTeaserVi", "aboutTeaserEn", "Short intro on Home", { rows: 3 })}
      </Section>

      <Section title="About" hint="Your biography and portrait on the About page.">
        {pair("bioVi", "bioEn", "Biography", { rows: 8 })}
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative h-40 w-32 overflow-hidden rounded-sm bg-surface-sunken">
            {portrait ? <Image src={portrait.url} alt="Portrait" fill sizes="128px" className="object-cover" /> : null}
          </div>
          <div className="space-y-2">
            <p className="text-caption text-ink">Portrait (tall photo works best, e.g. 1200 × 1500)</p>
            <div className="flex gap-2">
              <button type="button" disabled={portraitBusy} onClick={() => fileInput.current?.click()} className="rounded-full border border-border px-4 py-2 text-caption text-ink hover:bg-surface-sunken disabled:opacity-50">
                {portraitBusy ? "Uploading…" : portrait ? "Replace portrait" : "Upload portrait"}
              </button>
              {portrait ? (
                <button
                  type="button"
                  className="rounded-full border border-border px-4 py-2 text-caption text-error hover:bg-surface-sunken"
                  onClick={() => {
                    if (!window.confirm("Remove the portrait?")) return;
                    setPortrait(null);
                    void removePortraitAction();
                  }}
                >
                  Remove
                </button>
              ) : null}
            </div>
            {portraitError ? <p role="alert" className="text-caption text-error">{portraitError}</p> : null}
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadPortrait(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </Section>

      <Section title="Record" hint={recordHint}>
        {pair("exhibitionsVi", "exhibitionsEn", "Exhibitions", { rows: 5 })}
        {pair("awardsVi", "awardsEn", "Awards", { rows: 5 })}
        {pair("pressVi", "pressEn", "Press", { rows: 5 })}
      </Section>

      <Section title="Contact" hint="Shown on the About page under “Contact”. Leave a field empty to hide it.">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-caption text-ink">Email</span>
            <input className={input} type="email" value={f.email ?? ""} onChange={set("email")} placeholder="name@example.com" />
          </label>
          <label className="space-y-1">
            <span className="text-caption text-ink">Facebook link</span>
            <input className={input} value={f.facebookUrl ?? ""} onChange={set("facebookUrl")} placeholder="https://facebook.com/…" />
          </label>
          <label className="space-y-1">
            <span className="text-caption text-ink">Zalo (phone number)</span>
            <input className={input} value={f.zalo ?? ""} onChange={set("zalo")} placeholder="090 123 4567" />
          </label>
        </div>
      </Section>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-border bg-bg-page py-4">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-sky-deep px-6 py-3 text-caption text-white hover:bg-[#3D5464] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        {message ? (
          <span role={message.ok ? "status" : "alert"} className={`text-caption ${message.ok ? "text-success" : "text-error"}`}>
            {message.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
