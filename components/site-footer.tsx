// components/site-footer.tsx
//
// Footer (Server Component). Portfolio-only revamp (R2): wordmark + tagline,
// the same three links as the header (Work · About · Contact), © line and a
// second language toggle. Shop links (Shop, Track your order) only appear
// when the shop is switched on.

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { NavLinks, type NavLink } from "@/components/nav-links";
import { shopEnabled } from "@/lib/server/shop-config";

export async function SiteFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  const shop = shopEnabled();

  const links: NavLink[] = [
    { href: "/work", label: t("Nav.work"), section: "/work" },
    { href: "/about", label: t("Nav.about"), section: "/about" },
    { href: "/about#contact", label: t("Nav.contact"), section: "/contact" },
  ];
  const linkClass = "text-caption text-ink transition-colors hover:text-sky-deep";

  return (
    <footer className="mt-24 border-t border-border bg-surface-sunken">
      <div className="mx-auto max-w-max-content space-y-8 px-margin-mobile py-12 md:px-margin-desktop">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-2">
            <p className="text-h3 text-ink">{t("Nav.wordmark")}</p>
            <p className="text-body text-ink-muted">{t("Footer.tagline")}</p>
          </div>

          <nav aria-label={t("Nav.footerNav")} className="flex flex-wrap gap-x-6 gap-y-2">
            <NavLinks links={links} className="flex flex-wrap gap-x-6 gap-y-2" linkClassName={linkClass} />
            {shop ? (
              <>
                <Link href="/shop" className={linkClass}>
                  {t("Nav.shop")}
                </Link>
                {/* Order lookup has no index page yet — points home, as before. */}
                <Link href="/" className={linkClass}>
                  {t("Footer.trackOrder")}
                </Link>
              </>
            ) : null}
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
