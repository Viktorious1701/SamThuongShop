// components/about/record.tsx
//
// Portfolio-only revamp (R6) — the professional record on About, as plain
// lists (no trophy icons, no badges): one heading per section (Exhibitions,
// Awards, Press), each entry "year · text", with an optional external link
// that opens in a new tab and says so to screen readers. Empty sections are
// hidden. Entries come from parseRecord() — one per line in /admin/site.

import type { RecordEntry } from "@/lib/server/site-content";

export function Record({
  sections,
  newTabLabel,
}: {
  sections: { id: string; title: string; entries: RecordEntry[] }[];
  newTabLabel: string;
}) {
  const visible = sections.filter((s) => s.entries.length > 0);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-10">
      {visible.map((s) => (
        <section key={s.id} aria-labelledby={`record-${s.id}`}>
          <h2 id={`record-${s.id}`} className="text-h3 text-ink">
            {s.title}
          </h2>
          <ul className="mt-3 border-t border-border">
            {s.entries.map((e, i) => (
              <li key={i} className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-border py-3 text-body">
                <span className="tabular-nums text-caption-deep">{e.year ?? ""}</span>
                {e.url ? (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink underline decoration-border underline-offset-4 hover:decoration-ink"
                  >
                    {e.text}
                    <span className="sr-only"> ({newTabLabel})</span>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ) : (
                  <span className="text-ink">{e.text}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
