"use client";

// components/portfolio/lightbox.tsx
//
// Story 1.6 (D8) — the portfolio photo viewer. Accessibility floor from
// EXPERIENCE.md → Overlay focus management:
//   • role="dialog" + aria-modal, labelled by the caption;
//   • focus moves into the dialog on open, is trapped (Tab / Shift+Tab cycle)
//     and is restored on close to the tile of the photo last viewed;
//   • Esc closes; ← / → and horizontal swipe move between photos;
//   • prefers-reduced-motion: transitions only under `motion-safe:`.
// Open/close/index are owned by the parent (URL-driven), so this component
// holds no navigation state of its own.

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Caption, imageAlt } from "@/components/portfolio/caption";
import type { PublicImage } from "@/lib/server/portfolio";

const SWIPE_PX = 50;
// Vertical space taken by the top bar + caption bar (+ a little air), so the
// photo box can be height-bound on wide screens.
const CHROME_REM = 10;

export function Lightbox({
  images,
  index,
  fallbackAlt,
  onClose,
  onIndex,
}: {
  images: PublicImage[];
  index: number;
  fallbackAlt: string;
  onClose: () => void;
  onIndex: (index: number) => void;
}) {
  const t = useTranslations("Portfolio");
  const locale = useLocale();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const image = images[index];
  const total = images.length;
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  // Latest values for the long-lived listeners below.
  const live = useRef({ index, hasPrev, hasNext, onClose, onIndex, id: image.id });
  useEffect(() => {
    live.current = { index, hasPrev, hasNext, onClose, onIndex, id: image.id };
  });

  // Open: lock page scroll, move focus in. Close: restore both, and return
  // focus to the grid tile of the photo that was showing.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const state = live.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      const tile = document.querySelector<HTMLElement>(
        `[data-portfolio-image="${CSS.escape(state.id)}"]`,
      );
      tile?.focus();
    };
  }, []);

  // Keyboard: Esc, arrows, and the Tab focus trap.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = live.current;
      if (e.key === "Escape") {
        e.preventDefault();
        s.onClose();
      } else if (e.key === "ArrowLeft" && s.hasPrev) {
        e.preventDefault();
        s.onIndex(s.index - 1);
      } else if (e.key === "ArrowRight" && s.hasNext) {
        e.preventDefault();
        s.onIndex(s.index + 1);
      } else if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const captionId = `lightbox-caption-${image.id}`;
  const alt = imageAlt(locale, image, fallbackAlt);
  const navBtn =
    "absolute top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-0";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("lightboxLabel")}
      aria-describedby={captionId}
      className="fixed inset-0 z-50 flex flex-col bg-[#14171a]"
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        const end = e.changedTouches[0]?.clientX;
        if (start == null || end == null) return;
        const dx = end - start;
        if (dx > SWIPE_PX && hasPrev) onIndex(index - 1);
        else if (dx < -SWIPE_PX && hasNext) onIndex(index + 1);
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-caption text-white/80 md:px-8">
        <span aria-live="polite">{t("imageOf", { current: index + 1, total })}</span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="rounded-full p-2 text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Click on the backdrop (not the photo) closes. */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* A box with the photo's exact shape, fitted to the free space
            (width-bound or height-bound, whichever is tighter), so the blur
            placeholder shows instantly and nothing shifts when it loads. */}
        <div
          className="relative"
          style={{
            aspectRatio: `${image.width} / ${image.height}`,
            width: `min(100%, calc((100dvh - ${CHROME_REM}rem) * ${image.width / image.height}))`,
          }}
        >
          <Image
            key={image.id}
            src={image.url}
            alt={alt}
            fill
            sizes="100vw"
            placeholder="blur"
            blurDataURL={image.blurDataUrl}
            loading="eager"
            className="object-contain"
          />
        </div>

        <button
          type="button"
          onClick={() => onIndex(index - 1)}
          disabled={!hasPrev}
          aria-label={t("previous")}
          className={`${navBtn} left-2 md:left-6`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onIndex(index + 1)}
          disabled={!hasNext}
          aria-label={t("next")}
          className={`${navBtn} right-2 md:right-6`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-[4.5rem] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8">
        <Caption
          id={captionId}
          locale={locale}
          image={image}
          className="text-body text-white"
          placeClassName="text-caption text-white/65"
        />
      </div>
    </div>
  );
}
