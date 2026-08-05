"use client";

// components/language-toggle.tsx
//
// EN | VN inline switch (Client Component — needs the current pathname +
// router). Switches locale IN PLACE on the current route via next-intl's
// navigation helpers — never redirects to Home (Story 1.3 AC-3). Persisting
// the choice for the session is handled by next-intl's own locale cookie.

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export function LanguageToggle() {
  const t = useTranslations("LanguageToggle");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(nextLocale: Locale) {
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="flex items-center gap-2 text-caption" role="group">
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        aria-label={t("switchToEn")}
        className={
          locale === "en"
            ? "text-ink"
            : "text-ink-muted transition-colors hover:text-ink"
        }
      >
        {t("en")}
      </button>
      <span aria-hidden="true" className="text-border">
        |
      </span>
      <button
        type="button"
        onClick={() => switchTo("vi")}
        aria-pressed={locale === "vi"}
        aria-label={t("switchToVi")}
        className={
          locale === "vi"
            ? "text-ink"
            : "text-ink-muted transition-colors hover:text-ink"
        }
      >
        {t("vi")}
      </button>
    </div>
  );
}
