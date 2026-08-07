// components/product-card.tsx
//
// Storefront product card (Story 2.4). Presentational — receives pre-resolved,
// already-localized primitives so it stays a simple (non-async) component. The
// whole card is one locale-aware link to the product detail page (no
// hover-only affordances). Photo leads; the hairline + whitespace do the
// lifting (DESIGN.md product-card).

import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function ProductCard({
  href,
  imageUrl,
  imageAlt,
  title,
  sub,
  tagLabel,
  priceLabel,
}: {
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  title: string;
  sub: string;
  tagLabel: string;
  priceLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-md bg-surface transition-colors hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-deep"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-border bg-surface-sunken">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="space-y-1 p-3">
        <h3 className="text-h3 text-ink">{title}</h3>
        {sub ? <p className="text-caption text-caption-deep">{sub}</p> : null}
        <p className="text-caption text-sage-deep">{tagLabel}</p>
        <p className="text-body text-ink">{priceLabel}</p>
      </div>
    </Link>
  );
}
