// i18n/routing.ts
//
// Central routing config for next-intl (Architecture AD-7). Locale-prefixed
// routes only: /vi/... and /en/.... Vietnamese is the default AND the
// fallback locale (EXPERIENCE.md Internationalization).

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
});
