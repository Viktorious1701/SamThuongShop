// i18n/navigation.ts
//
// Locale-aware navigation helpers (next-intl). `Link`, `usePathname`, and
// `useRouter` here are drop-in wrappers around next/navigation that know
// about the locale prefix — used by the language toggle to switch locale
// on the *current* route instead of redirecting to Home (AC-3).

import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
