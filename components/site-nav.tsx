// components/site-nav.tsx
//
// Top nav (Server Component). Portfolio-only revamp (R2): wordmark · Work ·
// About · Contact · EN|VN — nothing else. The cart and Account/Login links
// only appear when the shop is switched on (SHOP_ENABLED); with it off the
// header never touches the cart or the session.

import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { LogoutButton } from "@/components/logout-button";
import { NavLinks, type NavLink } from "@/components/nav-links";
import { getCartCount } from "@/lib/server/cart";
import { shopEnabled } from "@/lib/server/shop-config";

const linkClass =
  "text-caption text-ink-muted transition-colors hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:underline-offset-8";

export async function SiteNav() {
  const t = await getTranslations("Nav");
  const links: NavLink[] = [
    { href: "/work", label: t("work"), section: "/work" },
    { href: "/about", label: t("about"), section: "/about" },
    { href: "/about#contact", label: t("contact"), section: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-page/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-max-content items-center justify-between gap-6 px-margin-mobile md:px-margin-desktop">
        <Link href="/" className="shrink-0 text-h3 text-ink">
          {t("wordmark")}
        </Link>

        <nav aria-label={t("primaryNav")} className="hidden md:block">
          <NavLinks links={links} className="flex items-center gap-8" linkClassName={linkClass} />
        </nav>

        <div className="flex items-center gap-4">
          {shopEnabled() ? <ShopControls /> : null}
          <LanguageToggle />
        </div>
      </div>

      {/* Phone: the three links sit on their own row under the bar. */}
      <nav aria-label={t("primaryNav")} className="border-t border-border px-margin-mobile py-2.5 md:hidden">
        <NavLinks links={links} className="flex items-center gap-6" linkClassName={linkClass} />
      </nav>
    </header>
  );
}

/** Cart + account links — rendered only while the shop is on. */
async function ShopControls() {
  const t = await getTranslations("Nav");
  const tAuth = await getTranslations("Auth");
  const [session, cartCount] = await Promise.all([auth(), getCartCount()]);

  return (
    <>
      {cartCount > 0 ? (
        <Link
          href="/cart"
          className="relative text-ink transition-colors hover:text-sky-deep"
          aria-label={t("cart")}
          title={t("cart")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
            <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
          </svg>
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-deep px-1 text-[10px] font-medium text-white">
            {cartCount}
          </span>
        </Link>
      ) : null}
      {session?.user ? (
        <>
          <Link href="/account" className="text-caption text-ink hover:text-sky-deep">
            {tAuth("accountNav")}
          </Link>
          <LogoutButton>{tAuth("logoutNav")}</LogoutButton>
        </>
      ) : (
        <Link href="/login" className="text-caption text-ink hover:text-sky-deep">
          {tAuth("loginNav")}
        </Link>
      )}
    </>
  );
}
