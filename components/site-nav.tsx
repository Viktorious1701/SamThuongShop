// components/site-nav.tsx
//
// Top nav (Server Component): wordmark + localized Home/Shop/Portfolio/
// About/Contact links + a static cart-icon placeholder (no cart logic yet —
// out of scope for Story 1.3) + the language toggle. Sticky, bg-surface,
// hairline border-b (Sky & Sedge tokens, DESIGN.md `top-nav`).
//
// Story 1.4: also reads the session via `auth()` and shows a Login link
// when signed out, or Account + Logout when signed in (AC-4).

import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { LogoutButton } from "@/components/logout-button";

export async function SiteNav() {
  const t = await getTranslations("Nav");
  const tAuth = await getTranslations("Auth");
  const session = await auth();

  const links = [
    { href: "/", label: t("home") },
    { href: "/shop", label: t("shop") },
    { href: "/portfolio", label: t("portfolio") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-max-content items-center justify-between gap-6 px-margin-mobile md:px-margin-desktop">
        <Link href="/" className="shrink-0 text-h3 text-ink">
          {t("wordmark")}
        </Link>

        <nav
          aria-label={t("primaryNav")}
          className="hidden items-center gap-6 md:flex"
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
        </nav>

        <div className="flex items-center gap-4">
          {/* Cart placeholder — static icon only, no item count / cart logic yet. */}
          <span className="text-ink" aria-label={t("cart")} title={t("cart")}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
            </svg>
          </span>

          {session?.user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/account"
                className="text-caption text-ink transition-colors hover:text-sky-deep"
              >
                {tAuth("accountNav")}
              </Link>
              <LogoutButton>{tAuth("logoutNav")}</LogoutButton>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-caption text-ink transition-colors hover:text-sky-deep"
            >
              {tAuth("loginNav")}
            </Link>
          )}

          <LanguageToggle />
        </div>
      </div>

      {/* Mobile: links wrap beneath the bar. A collapsing hamburger menu is
          deferred to a later responsive-polish story — out of scope here. */}
      <nav
        aria-label={t("primaryNav")}
        className="flex flex-wrap items-center gap-4 border-t border-border px-margin-mobile py-3 md:hidden"
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
      </nav>
    </header>
  );
}
