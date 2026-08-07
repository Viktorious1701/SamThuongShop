// lib/format.ts
//
// Pure formatting helpers shared by server and client components (no server
// imports). Money is integer VND end-to-end (AD-5); translatable content is
// per-locale with Vietnamese fallback (AD-7).

/** Formats an integer VND amount as e.g. `980.000₫` (vi-VN grouping). */
export function formatVnd(amount: number): string {
  const grouped = new Intl.NumberFormat("vi-VN").format(Math.round(amount));
  return `${grouped}₫`;
}

/** Picks the active-locale value, falling back to Vietnamese (AD-7). */
export function pickLocalized(
  locale: string,
  vi: string | null | undefined,
  en: string | null | undefined,
): string {
  if (locale === "en") {
    const e = en?.trim();
    if (e) return e;
  }
  return (vi ?? "").trim() || (en ?? "").trim();
}
