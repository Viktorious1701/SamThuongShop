# Story 1.3: Bilingual shell and language toggle

Status: ready-for-dev

## Story

As a visitor,
I want to use the site in Vietnamese or English and switch between them,
so that I can read it in my language. *(FR-25)*

## Acceptance Criteria

1. **Given** next-intl configured with locale-prefixed routes (`/vi`, `/en`, `vi` default), **When** I load any page, **Then** it renders under the active locale and `/` redirects to `/vi`.
2. **Given** the shell, **When** any page renders, **Then** the top nav (wordmark + Home · Shop · Portfolio · About · Contact + cart placeholder + EN|VN toggle) and the footer render in the active locale, styled with the Sky & Sedge tokens.
3. **Given** I am on any page, **When** I use the EN|VN toggle, **Then** the UI language switches **in place on the current route** (e.g. `/vi/about` → `/en/about`, NOT back to Home), the choice persists for the session, and `<html lang>` becomes `vi`/`en`.
4. **Given** a missing translation, **When** a page renders, **Then** it falls back to Vietnamese.
5. **Given** longer Vietnamese strings, **When** the nav/footer render, **Then** the layout does not break (no overflow/clipping).
6. **Given** the existing routes, **When** the shell is added, **Then** `/styleguide` and `/api/health` still work (excluded from locale middleware), and `build`/`lint`/`tsc` pass clean.

## Tasks / Subtasks

- [ ] **Task 1 — next-intl config (AC: 1, 4)**
  - [ ] Install the current `next-intl` and configure it for Next 16 App Router: routing (`locales: ['vi','en']`, `defaultLocale: 'vi'`, prefix strategy that yields `/vi` and `/en`), the request/config module, and `NextIntlClientProvider` wiring. Verify the current next-intl setup docs for Next 16 (App Router) — the API evolves; don't assume an older shape.
  - [ ] `messages/vi.json` + `messages/en.json` with nav + footer + common keys. Use natural Vietnamese (reuse EXPERIENCE.md Voice & Tone strings), not machine-translation phrasing. `vi` is the fallback.
- [ ] **Task 2 — Middleware (AC: 1, 6)**
  - [ ] `middleware.ts` with the next-intl middleware. **Matcher MUST exclude** `/api/*`, `/_next/*`, static files, **and `/styleguide`** so those keep working un-prefixed.
- [ ] **Task 3 — `[locale]` restructure + layouts (AC: 1, 3)**
  - [ ] Move the customer site under `app/[locale]/`. Put `<html lang={locale}>` in `app/[locale]/layout.tsx` (next-intl App-Router pattern) and reconcile `app/layout.tsx` so there is exactly **one** `<html>`, and the Lora/Inter `next/font` variables (from Story 1.2) + `app/globals.css` still apply. Keep explicit `{ children: ReactNode }` typing — do NOT reintroduce the `LayoutProps` global (it breaks standalone `tsc`).
  - [ ] `app/[locale]/layout.tsx` renders `<SiteNav/>` + `{children}` + `<SiteFooter/>` inside the provider.
- [ ] **Task 4 — Chrome components (AC: 2, 3, 5)**
  - [ ] `components/site-nav.tsx` (Server Component): wordmark "Sâm Thương" (Lora / `text-h3` or similar), links Home · Shop · Portfolio · About · Contact (localized labels), a **cart icon placeholder** (no cart logic yet), and `<LanguageToggle/>`. Sticky top, `bg-surface`, hairline `border-b border-border`.
  - [ ] `components/language-toggle.tsx` (Client Component): `EN | VN` inline switch. Switches locale on the **current pathname** using next-intl navigation (`usePathname` + locale-aware `Link`/`redirect`) — never navigates to Home. Active locale in `ink`, inactive in `ink-muted`, `|` separator in `border`. Persists via cookie (next-intl handles the locale cookie).
  - [ ] `components/site-footer.tsx`: `bg-surface-sunken`, hairline `border-t`, nav links + a bilingual tagline + "Theo dõi đơn hàng / Track your order" placeholder link.
- [ ] **Task 5 — Placeholder pages (AC: 2)**
  - [ ] `app/[locale]/page.tsx` (home — a localized hero/heading placeholder) and minimal stubs `app/[locale]/{shop,portfolio,about,contact}/page.tsx` (localized heading + "coming soon" note) so every nav link resolves with no 404. Mark them clearly as placeholders for later stories.
- [ ] **Task 6 — Verify (AC: 6)**
  - [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` clean; `npm run dev` → check `/` → `/vi`, both locales render nav+footer, toggle switches in place + updates `<html lang>`, VN diacritics render, `/styleguide` + `/api/health` still work.

## Dev Notes

**Builds on Stories 1.1 (scaffold) + 1.2 (tokens), both verified green.** This is the **shell + i18n only** — no real features.

**next-intl is the mandated i18n approach** (Architecture AD-7). Locales are exactly `vi` and `en`; Vietnamese is the default and the fallback; routes are **locale-prefixed** (`/vi/…`, `/en/…`). This was also fixed in EXPERIENCE.md (resolved the earlier OG/URL open question) and DESIGN.md.

**Critical layout gotcha:** Story 1.2's `app/layout.tsx` currently owns `<html>` and the `next/font` variables. When you introduce `app/[locale]/layout.tsx`, only ONE layout may render `<html>`. Follow the current next-intl App-Router convention (typically: the `[locale]` layout renders `<html lang>`; the root `app/layout.tsx` becomes a minimal pass-through returning `children`, or is removed). Ensure the Lora/Inter font CSS variables and `globals.css` import are preserved on the surviving `<html>`. Verify `tsc` stays clean.

**Middleware matcher** must not swallow `/api/health` (breaks Story 1.1's check) or `/styleguide` (Story 1.2's dev page). Use a matcher that excludes `api`, `_next`, `styleguide`, and files with extensions.

**Toggle behavior (AC-3) is the crux:** it must switch locale on the *current* route, not reset to Home. Use next-intl's navigation helpers (`usePathname` returns the locale-agnostic pathname; render locale-aware links or a `router.replace` with the new locale). Persisting is handled by next-intl's locale cookie. The `<html lang>` follows from the `[locale]` param.

**Voice & Tone (from EXPERIENCE.md) — reuse these bilingual strings** for message keys where they fit:
```
Track your order → Theo dõi đơn hàng / Track your order
Shop → Cửa hàng / Shop     Portfolio → Bộ sưu tập / Portfolio
About → Giới thiệu / About  Contact → Liên hệ / Contact   Home → Trang chủ / Home
```
(Confirm/adjust Vietnamese nav labels for naturalness.)

**Scope discipline — do NOT:** build the real Shop/catalog, Portfolio galleries, About/contact content, auth, cart logic, or any domain/db work. Cart icon is a static placeholder. Nav destinations are stubs.

### References

- [Source: _bmad-output/planning-artifacts/architecture/architecture-SamThuongShop-2026-07-18/ARCHITECTURE-SPINE.md#AD-7] — per-locale content, locale-prefixed routes, VN fallback, next-intl.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-SamThuongShop-2026-07-18/EXPERIENCE.md#Foundation / Voice and Tone / Internationalization] — toggle behavior, bilingual strings, fallback rule.
- [Source: …/DESIGN.md#Components] — top-nav, language-toggle, footer visual specs (tokens from Story 1.2).
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1 / Story 1.3] — acceptance criteria.

## Dev Agent Record

### Agent Model Used

Claude Sonnet

### Debug Log References

- `npx tsc --noEmit` (after `rm -rf .next`): **0 errors** ("TypeScript: No errors found").
- `npm run lint`: **clean** ("ESLint: No issues found").
- `npm run build`: **succeeds**. Route table confirms `ƒ /[locale]`, `/[locale]/{about,contact,portfolio,shop}`, `○ /styleguide` (static), `ƒ /api/health`, and `ƒ Proxy (Middleware)` — no deprecation warnings.
- `npm run dev` (port 3000) verified live with `curl` + a real headless-Chromium (Playwright) session:
  - `GET /` → `307` to `/vi`.
  - `/vi` and `/en` render with nav + footer; `<html lang>` is `vi` / `en` respectively; Vietnamese diacritics ("Sâm Thương", "Cửa hàng", "Bộ sưu tập", "Giới thiệu") render correctly.
  - All 8 stub routes (`/vi|en/{shop,portfolio,about,contact}`) return `200`.
  - `/styleguide` → `200`, own `<html lang="en">`, unprefixed, unaffected by the locale middleware.
  - `/api/health` → responds (503 in this sandbox because there's no reachable dev DB — pre-existing/expected, not a middleware regression; the route is reached and executes).
  - Browser test on `/vi/about`: clicked the "EN" toggle → URL became `/en/about` (not `/en` or Home), heading changed "Giới thiệu" → "About", `document.documentElement.lang` flipped `vi` → `en`; clicking "VN" reversed it back to `/vi/about` with `lang="vi"`. Confirms AC-3 (in-place switch, never redirects to Home).

### Completion Notes List

- **What was built:** Full next-intl bilingual shell per Tasks 1–5 — `i18n/routing.ts` (`defineRouting`, locales `['vi','en']`, default `vi`), `i18n/navigation.ts` (`createNavigation` → `Link`/`usePathname`/`useRouter`/`redirect`), `i18n/request.ts` (`getRequestConfig`, deep-merges Vietnamese messages as the fallback for any key missing from the active locale — AC-4), `messages/vi.json` + `messages/en.json` (nav, footer, home, coming-soon copy; Vietnamese labels reviewed for naturalness, reusing EXPERIENCE.md's bilingual strings — "Theo dõi đơn hàng / Track your order", "Cửa hàng / Shop", "Bộ sưu tập / Portfolio", "Giới thiệu / About", "Liên hệ / Contact", "Trang chủ / Home"). `components/site-nav.tsx` (Server Component: wordmark, 5 nav links, static SVG cart placeholder, `<LanguageToggle/>`, sticky/`bg-surface`/hairline). `components/language-toggle.tsx` (Client Component: `EN | VN`, `usePathname()` + `router.replace(pathname, {locale})` — switches in place, never touches Home; `aria-pressed` + localized `aria-label`s; `ink`/`ink-muted`/`border` tokens). `components/site-footer.tsx` (`bg-surface-sunken`, hairline `border-t`, nav links, bilingual tagline, "Track your order" placeholder, a second toggle). Placeholder pages: `app/[locale]/page.tsx` (home hero placeholder) + `app/[locale]/{shop,portfolio,about,contact}/page.tsx` stubs (localized `<h1>` + "coming soon" note + localized `generateMetadata` title) — every nav link resolves, no 404s.
- **next-intl version used:** `4.13.4` (installed from latest on npm at implementation time).
- **Middleware/proxy naming deviation (documented per the task's instruction to verify current APIs, not assume a stale shape):** Next.js **16** has renamed the `middleware.ts` file convention to **`proxy.ts`** (function renamed `middleware` → `proxy`; see https://nextjs.org/docs/messages/middleware-to-proxy). `middleware.ts` still works in 16.3 but is deprecated and logs a build warning. To keep `npm run build` fully clean (AC-6), this story implements the routing gate as **`proxy.ts`** at the project root (`export default createMiddleware(routing)`, which satisfies Next 16's "default export" form of the proxy contract) instead of literally `middleware.ts`. Behavior, matcher semantics, and next-intl's `createMiddleware` call are otherwise exactly what the story's Task 2 specifies. Matcher: `["/((?!api|_next|_vercel|styleguide|.*\\..*).*)"]` — excludes `/api/*`, `/_next/*`, `/_vercel/*`, any path with a file extension, and `/styleguide`.
- **Single-`<html>` reconciliation:** Story 1.2's `app/layout.tsx` owned the only `<html>` + the Lora/Inter `next/font` variables. Introducing `app/[locale]/layout.tsx` (which must own `<html lang={locale}>` per Task 3) conflicts with that if a shared `app/layout.tsx` still exists above it — and it can't simply be deleted, because `/styleguide` and `/api/health` must keep working **un-prefixed**, i.e. outside the `[locale]` tree entirely. The resolution: deleted the old `app/layout.tsx` and `app/page.tsx`, and used Next.js's documented **"multiple root layouts"** pattern (https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — two sibling subtrees under `app/`, each supplying its own complete root layout, with no shared `layout.tsx` directly in `app/`:
  - `app/[locale]/layout.tsx` — the customer-site root layout; owns `<html lang={locale}>`, validates the locale with `hasLocale`/`notFound()`, wraps `NextIntlClientProvider` + `<SiteNav/>` + `{children}` + `<SiteFooter/>`. Typed `{ children: ReactNode; params: Promise<{ locale: string }> }` explicitly (no `LayoutProps` global).
  - `app/styleguide/layout.tsx` (**new**) — a second, independent root layout, functionally identical to the old `app/layout.tsx` (static `<html lang="en">`, same Lora/Inter font vars + `globals.css` import), so `/styleguide` is completely unaffected in behavior/output, just structurally relocated to its own root since there's no longer a shared one. Typed `{ children: ReactNode }` explicitly.
  - Both layouts import `next/font/google` (Lora/Inter) independently and `../globals.css`; `app/api/health/route.ts` needed no changes (Route Handlers don't require a layout).
- **Scope discipline respected:** no real Shop/Portfolio/About/Contact content, no cart logic (cart icon is a static inline SVG, no state/count), no auth/DB work. Nav destinations are stubs only, clearly marked as placeholders in code comments.

### File List

**Created:**
- `i18n/routing.ts`
- `i18n/navigation.ts`
- `i18n/request.ts`
- `proxy.ts` (next-intl routing gate — see deviation note above; supersedes the story's literal `middleware.ts` filename for Next 16 compatibility)
- `messages/vi.json`
- `messages/en.json`
- `components/site-nav.tsx`
- `components/language-toggle.tsx`
- `components/site-footer.tsx`
- `app/[locale]/layout.tsx`
- `app/[locale]/page.tsx`
- `app/[locale]/shop/page.tsx`
- `app/[locale]/portfolio/page.tsx`
- `app/[locale]/about/page.tsx`
- `app/[locale]/contact/page.tsx`
- `app/styleguide/layout.tsx`

**Modified:**
- `next.config.ts` (wrapped with `createNextIntlPlugin()`)
- `package.json` / `package-lock.json` (added `next-intl@^4.13.4`)

**Removed (superseded by `app/[locale]/layout.tsx` and `app/styleguide/layout.tsx`):**
- `app/layout.tsx`
- `app/page.tsx`

**Unchanged (verified still working, not touched):**
- `app/styleguide/page.tsx`
- `app/api/health/route.ts`
- `app/globals.css`
