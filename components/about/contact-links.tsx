// components/about/contact-links.tsx
//
// Portfolio-only revamp (R6) — the Contact block at the bottom of About
// (anchor #contact, where the nav's "Contact" points). Three direct channels
// set in /admin/site; an empty one is simply not shown. No form, no accounts.

export function ContactLinks({
  title,
  intro,
  email,
  facebookUrl,
  zalo,
  labels,
}: {
  title: string;
  intro: string;
  email: string | null;
  facebookUrl: string | null;
  zalo: string | null;
  labels: { email: string; facebook: string; zalo: string; empty: string };
}) {
  const zaloDigits = zalo?.replace(/[^\d]/g, "") ?? "";
  const links = [
    email ? { label: labels.email, value: email, href: `mailto:${email}`, external: false } : null,
    facebookUrl
      ? {
          label: labels.facebook,
          value: facebookUrl.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""),
          href: facebookUrl,
          external: true,
        }
      : null,
    zalo && zaloDigits
      ? { label: labels.zalo, value: zalo, href: `https://zalo.me/${zaloDigits}`, external: true }
      : null,
  ].filter((l): l is NonNullable<typeof l> => !!l);

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-24 grid gap-8 rounded-md border border-border bg-surface p-6 md:grid-cols-2 md:p-8"
    >
      <div>
        <h2 id="contact-title" className="text-h2 text-ink">
          {title}
        </h2>
        <p className="mt-3 text-body text-ink-muted">{intro}</p>
      </div>
      {links.length === 0 ? (
        <p className="text-body text-ink-muted">{labels.empty}</p>
      ) : (
        <ul className="grid content-start gap-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center justify-between gap-4 rounded-full border border-border px-5 py-3.5 text-body text-ink transition-colors hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-deep"
              >
                <span>{l.label}</span>
                <span className="truncate text-caption text-ink-muted">{l.value}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
