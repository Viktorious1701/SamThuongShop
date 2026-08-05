// components/site-footer.tsx
//
// Footer (Server Component): bg-surface-sunken, hairline border-t, nav
// links + bilingual tagline + "Theo dõi đơn hàng / Track your order"
// placeholder link + a second language toggle (DESIGN.md `footer`).

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/language-toggle";

export async function SiteFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  const links = [
    { href: "/shop", label: t("Nav.shop") },
    { href: "/portfolio", label: t("Nav.portfolio") },
    { href: "/about", label: t("Nav.about") },
    { href: "/contact", label: t("Nav.contact") },
  ] as const;

  return (
    <footer className="border-t border-border bg-surface-sunken">
      <div className="mx-auto max-w-max-content space-y-8 px-margin-mobile py-12 md:px-margin-desktop">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-2">
            <p className="text-h3 text-ink">{t("Nav.wordmark")}</p>
            <p className="text-body text-ink">{t("Footer.tagline")}</p>
          </div>

          <nav
            aria-label={t("Nav.primaryNav")}
            className="flex flex-wrap gap-x-6 gap-y-2"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-caption text-ink transition-colors hover:text-sky-deep"
              >
                {link.label}
              </Link>
            ))}
            {/* Order tracking is a later story — this points home for now. */}
            <Link
              href="/"
              className="text-caption text-ink transition-colors hover:text-sky-deep"
            >
              {t("Footer.trackOrder")}
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-caption text-ink">{t("Footer.rights", { year })}</p>
          <LanguageToggle />
        </div>
      </div>
    </footer>
  );
}
