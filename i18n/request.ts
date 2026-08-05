// i18n/request.ts
//
// Per-request i18n config (next-intl). Resolves the active locale and its
// messages. Vietnamese is the fallback: any key missing from the active
// locale's message file is deep-merged in from vi.json (AC-4).

import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

type Messages = Record<string, unknown>;

function isPlainObject(value: unknown): value is Messages {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

function deepMergeFallback(fallback: Messages, override: Messages): Messages {
  const merged: Messages = { ...fallback };

  for (const key of Object.keys(override)) {
    const fallbackValue = fallback[key];
    const overrideValue = override[key];

    merged[key] =
      isPlainObject(fallbackValue) && isPlainObject(overrideValue)
        ? deepMergeFallback(fallbackValue, overrideValue)
        : overrideValue;
  }

  return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const fallbackMessages = (
    (await import(`../messages/${routing.defaultLocale}.json`)) as {
      default: Messages;
    }
  ).default;

  const messages =
    locale === routing.defaultLocale
      ? fallbackMessages
      : deepMergeFallback(
          fallbackMessages,
          ((await import(`../messages/${locale}.json`)) as {
            default: Messages;
          }).default,
        );

  return { locale, messages };
});
