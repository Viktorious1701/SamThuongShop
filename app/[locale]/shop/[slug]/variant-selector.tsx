"use client";

// app/[locale]/shop/[slug]/variant-selector.tsx
//
// Story 2.5 — the buy panel. Chip rows grouped Print sizes / Digital tiers;
// selecting a variant updates the displayed VND price and the fulfilment note
// (Physical Print → "Made to order"; Digital Download → license + watermarked
// preview). Add-to-cart is a disabled placeholder — the cart is Epic 3.
// Localized label strings are passed in as props (page resolves them).

import { useState, useTransition } from "react";
import { formatVnd } from "@/lib/format";
import { Link, useRouter } from "@/i18n/navigation";
import { addToCartAction } from "../../cart/actions";
import type { StorefrontVariant } from "@/lib/server/product";

type Labels = {
  printSizes: string;
  digitalTiers: string;
  price: string;
  madeToOrder: string;
  digitalNote: string;
  license: string;
  watermarkBadge: string;
  addToCart: string;
  added: string;
  viewCart: string;
};

export function VariantSelector({
  variants,
  labels,
}: {
  variants: StorefrontVariant[];
  labels: Labels;
}) {
  const [selected, setSelected] = useState(0);
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const current = variants[selected];

  function onAdd() {
    startTransition(async () => {
      await addToCartAction(current.id);
      setAdded(true);
      router.refresh(); // update the nav cart badge
    });
  }

  const prints = variants
    .map((v, i) => ({ v, i }))
    .filter((x) => x.v.format === "PRINT");
  const digitals = variants
    .map((v, i) => ({ v, i }))
    .filter((x) => x.v.format === "DIGITAL");

  const chip = (label: string, index: number) => {
    const active = index === selected;
    return (
      <button
        key={index}
        type="button"
        aria-pressed={active}
        onClick={() => {
          setSelected(index);
          setAdded(false);
        }}
        className={`rounded-md border px-4 py-2 text-caption transition-colors ${
          active
            ? "border-sky-deep text-sky-deep"
            : "border-ink-muted text-ink hover:border-ink"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {prints.length > 0 ? (
        <div className="space-y-2">
          <p className="text-caption text-ink-muted">{labels.printSizes}</p>
          <div className="flex flex-wrap gap-2">
            {prints.map((x) => chip(x.v.label, x.i))}
          </div>
        </div>
      ) : null}

      {digitals.length > 0 ? (
        <div className="space-y-2">
          <p className="text-caption text-ink-muted">{labels.digitalTiers}</p>
          <div className="flex flex-wrap gap-2">
            {digitals.map((x) => chip(x.v.label, x.i))}
          </div>
        </div>
      ) : null}

      <div className="space-y-1">
        <p className="text-caption text-ink-muted">{labels.price}</p>
        <p className="text-h2 text-ink">{formatVnd(current.priceVnd)}</p>
      </div>

      {current.format === "PRINT" ? (
        <p className="text-caption text-ink-muted">{labels.madeToOrder}</p>
      ) : (
        <div className="space-y-3">
          <p className="text-caption text-ink-muted">{labels.digitalNote}</p>
          <p className="text-caption text-ink-muted">{labels.license}</p>
          {current.previewUrl ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.previewUrl}
                alt={labels.watermarkBadge}
                className="max-h-96 w-auto rounded-sm border border-border"
              />
              <span className="absolute left-2 top-2 rounded-sm bg-ink/70 px-2 py-1 text-caption text-white">
                {labels.watermarkBadge}
              </span>
            </div>
          ) : null}
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={onAdd}
          disabled={isPending}
          className="w-full max-w-xs rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 disabled:opacity-60"
        >
          {labels.addToCart}
        </button>
        {added ? (
          <p className="mt-2 text-caption text-sage-deep">
            {labels.added} ·{" "}
            <Link href="/cart" className="underline">
              {labels.viewCart}
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
