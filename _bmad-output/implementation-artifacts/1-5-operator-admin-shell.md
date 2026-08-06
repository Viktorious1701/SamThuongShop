# Story 1.5: Operator authentication and admin shell

Status: ready-for-dev

## Story

As the Operator (Thinh An),
I want a single protected admin area,
so that only I can manage the shop, and later epics have one place to add screens. *(FR-23)*

## Acceptance Criteria

1. **Given** the Auth.js system (Story 1.4) and a **seeded** Operator account (no self-serve operator signup), **When** the seed runs, **Then** an Operator user exists in Postgres with `role = "operator"` and a bcrypt-hashed password.
2. **Given** an unauthenticated visitor, **When** they visit any `/admin/*` route, **Then** they are redirected to the operator sign-in (`/admin/login`).
3. **Given** the Operator signs in with correct credentials, **When** login succeeds, **Then** they see the guarded admin shell (layout + nav) at `/admin`.
4. **Given** a **non-operator** account (e.g. a customer), **When** they try to sign in at `/admin/login` (or reach `/admin` with a customer session), **Then** they are **denied** with a clear message and never see the dashboard — and there is **no redirect loop**.
5. **Given** the Operator role, **When** admin routes/actions run, **Then** the role is checked in a **single shared server guard**.
6. **Given** the routing, **When** the admin is added, **Then** `/admin` stays un-prefixed (NOT `/vi/admin`), and the customer site (`/vi`, `/en`, `/login`, `/account`), `/styleguide`, `/api/health` all still work; `tsc`/`lint`/`build` pass clean.

## Tasks / Subtasks

- [x] **Task 1 — Operator seed (AC: 1)**
  - [x] `prisma/seed.ts` — reads `OPERATOR_EMAIL` / `OPERATOR_PASSWORD` from env (**dev defaults `admin@samthuong.shop` / `Operator123!`**), and **upserts** a `User` with `role: "operator"`, hashing the password via the existing `lib/server/user.ts` helper (AD-2 — no direct Prisma/bcrypt outside `lib/server`). Idempotent (safe to re-run).
  - [x] Wire it as the Prisma seed (via `prisma.config.ts` migrations/seed config for Prisma 7, or a `db:seed` npm script running `tsx prisma/seed.ts`). Add `OPERATOR_EMAIL` / `OPERATOR_PASSWORD` to `.env.example` and `.env`.
- [x] **Task 2 — Un-prefix /admin (AC: 6)**
  - [x] In `proxy.ts`, add `admin` to the matcher negative-lookahead: `"/((?!api|_next|_vercel|styleguide|admin|.*\\..*).*)"`. Do NOT otherwise change the next-intl proxy.
- [x] **Task 3 — Shared guard (AC: 5)**
  - [x] `lib/server/require-operator.ts` — `requireOperator()` calls `auth()`, returns the session if `session.user.role === "operator"`, else `redirect("/admin/login")`. This is the one place the operator check lives; reused by the admin layout now and future admin Server Actions.
- [x] **Task 4 — Admin route tree (AC: 2, 3, 4)** — its own root layout (dual-root-layout pattern, alongside `[locale]` and `styleguide`):
  - [x] `app/admin/layout.tsx` — root layout: `<html lang="en">` + fonts + `globals.css` (Sky & Sedge tokens). Keep explicit `{ children: ReactNode }` typing (no `LayoutProps` global).
  - [x] `app/admin/login/page.tsx` — **public** operator sign-in. Uses Credentials `signIn`. On success → `/admin`. **Non-operator handling:** after a successful credential check, if the account is not an operator, reject with a visible "This isn't an operator account" message and sign them out — no loop. (If a non-operator session already exists and hits `/admin`, the guard sends them here with that message.)
  - [x] `app/admin/(app)/layout.tsx` — **guarded** via `requireOperator()`; renders the admin shell chrome: a simple sidebar/topbar with **placeholder** nav (Dashboard · Products · Orders · Collections · Portfolio · About) and a Logout control (reuse `components/logout-button.tsx`).
  - [x] `app/admin/(app)/page.tsx` — dashboard landing placeholder: "Welcome, {operator email}" + a note that management sections arrive in later epics.

## Dev Notes

**Builds on Story 1.4** (Auth.js v5, Credentials + JWT, `role` already in the session/JWT callbacks — verified). **Reuse `auth.ts` and `lib/server/user.ts` — do not fork the auth config.** DB is Supabase (adapter already `@prisma/adapter-pg`).

**Admin is English-only and OUTSIDE `[locale]`** (decided with the user). It uses its own root layout (there is no shared `app/layout.tsx` — the app uses multiple root layouts: `[locale]`, `styleguide`, and now `admin`). Keep it utilitarian; it's for one non-technical operator.

**No redirect loop (AC-4) is the subtle part:** the guarded `(app)` group redirects non-operators to `/admin/login`, which is OUTSIDE the guarded group (so it's always reachable). The login page must detect a signed-in-but-non-operator state and show the error rather than bouncing again.

**Operator role check lives in ONE place** (`requireOperator()`) per AD-9 — future admin Server Actions call it too.

**Scope — do NOT build:** any product/order/collection/portfolio **management screens** (Epic 2 / 4 / 1.6–1.7). Nav items are placeholders (disabled or "coming soon"). Don't touch the customer site, `/styleguide`, `/api/health`, or `lib/server/db.ts` / `prisma.config.ts` datasource wiring.

### References

- [Source: ARCHITECTURE-SPINE.md#AD-9] — Auth.js, single auth system, Operator role gates `app/admin/*` + operator actions; operator seeded, no self-serve signup.
- [Source: ARCHITECTURE-SPINE.md#AD-2] — only `lib/server/` imports Prisma / does hashing.
- [Source: epics.md#Epic 1 / Story 1.5] — acceptance criteria.
- Existing: `auth.ts` (role in jwt/session callbacks), `lib/server/user.ts`, `proxy.ts` (matcher), `prisma/schema.prisma` (`User.role`).

## Dev Agent Record

### Agent Model Used

Claude Sonnet

### Debug Log References

- `npm run db:seed` (tsx prisma/seed.ts) → `Seeded operator user: admin@samthuong.shop (role=operator)`.
- `npx tsc --noEmit` → `TypeScript: No errors found`.
- `npm run lint` → `ESLint: 0 errors, 3 warnings in 1 files` (warnings are pre-existing, in `scripts/gen-placeholders.mjs`, untouched by this story; exit code 0).
- `npm run build` → `✓ Compiled successfully` + `Finished TypeScript` clean; route table shows `/admin` and `/admin/login` un-prefixed alongside `/[locale]/*`, `/api/*`, `/styleguide`.

### Completion Notes List

- **Task 1 (seed):** Added `upsertUserWithRole()` to `lib/server/user.ts` (the only place that hashes/touches Prisma, per AD-2) and `prisma/seed.ts`, which upserts `User` with `role: "operator"` from `OPERATOR_EMAIL`/`OPERATOR_PASSWORD` (dev defaults `admin@samthuong.shop` / `Operator123!`). Wired as both a `db:seed` npm script (`tsx prisma/seed.ts`) and Prisma 7's `migrations.seed` in `prisma.config.ts` (so `prisma db seed` also works), without touching the datasource block. Added the two env vars to `.env` and `.env.example`. Ran the seed against Supabase and **verified directly against the DB**: `admin@samthuong.shop` exists with `role: "operator"` and a bcrypt hash (`$2b$12$...` prefix, matching the existing 12-round `BCRYPT_SALT_ROUNDS`).
- **Task 2 (un-prefix /admin):** `proxy.ts` matcher updated to `"/((?!api|_next|_vercel|styleguide|admin|.*\\..*).*)"`; nothing else in the file changed. Build's route table confirms `/admin` and `/admin/login` are un-prefixed and every other route (`/[locale]/*`, `/api/*`, `/styleguide`) still resolves.
- **Task 3 (shared guard):** `lib/server/require-operator.ts` added — `requireOperator()` calls `auth()`, returns the session when `role === "operator"`, else `redirect("/admin/login")`. It's the only place the operator role is checked; both `app/admin/(app)/layout.tsx` and `app/admin/(app)/page.tsx` call it (the page call is redundant with the layout but cheap/idempotent and keeps every admin entry point self-defending).
- **Task 4 (admin tree):** Added `app/admin/layout.tsx` (own `<html lang="en">` root layout, dual-root-layout pattern alongside `[locale]`/`styleguide`, explicit `{ children: ReactNode }` typing), `app/admin/login/page.tsx` + `login-form.tsx` + `actions.ts` (public sign-in; reuses the Credentials provider via `signIn(..., { redirect: false })` so the action can check `session.user.role` before deciding to redirect to `/admin` or roll the session back with `signOut()` and show "This isn't an operator account."), and the guarded `app/admin/(app)/layout.tsx` (sidebar/topbar chrome, placeholder nav for Products/Orders/Collections/Portfolio/About rendered as inert labels, `LogoutButton` reused as-is) + `app/admin/(app)/page.tsx` (dashboard placeholder showing the operator's email).
- **No-redirect-loop proof (AC-4):** Live-tested end to end against the running dev server with curl + real cookie jars (no headless browser available in this environment — Playwright isn't installed and installing it was out of scope for a story that says not to churn `node_modules`):
  - Unauthenticated `GET /admin` → `307` to `/admin/login`; `/admin/login` itself → `200` (plain form), so the chain terminates in one hop.
  - Signed in as `admin@samthuong.shop` / `Operator123!` (via `/api/auth/callback/credentials`, mirroring what `signIn` does server-side) → `GET /admin` → `200`, dashboard renders "Welcome, admin@samthuong.shop".
  - Signed in as the existing customer `test@example.com` / `TestPass123!` (`role: "customer"`, confirmed via `/api/auth/session`) → `GET /admin` → single `307` to `/admin/login` → that page returns `200` directly (no further redirect) showing "This isn't an operator account. Signed in as test@example.com..." plus a "Sign out and try a different account" control — never the dashboard, never a bounce loop.
  - Exercised the sign-out control's underlying mechanism (`/api/auth/signout`) with the customer cookie jar, then re-requested `/admin/login`: back to the plain sign-in form, no leftover denial state — confirms the guard → denial → sign-out → clean-slate cycle terminates.
  - Wrong password for the operator email via the same credentials endpoint → no session created (`/api/auth/session` → `null`), confirming the `AuthError` path `adminLoginAction` relies on for "Incorrect email or password."
  - Also confirmed via `next build`'s route table and curl: `/vi`, `/en`, `/vi/login`, `/vi/account` (redirects to `/vi/login` when signed out), `/styleguide`, `/api/health` all still work un-prefixed/prefixed as before.
- **Scope discipline:** No product/order/collection/portfolio management screens were built (nav items are inert placeholder labels). `app/[locale]/*`, `/styleguide`, `/api/health`, `lib/server/db.ts`, and `prisma.config.ts`'s datasource block were not touched. `node_modules` was not bulk-reinstalled — only `tsx` was added as a dev dependency (needed to run the seed script and for `prisma.config.ts`'s seed command).
- **Pre-existing, unrelated state noted but not touched:** `app/[locale]/account/page.tsx`, `app/[locale]/login/{actions.ts,login-form.tsx}`, `app/[locale]/register/{actions.ts,register-form.tsx}`, and `_bmad-output/implementation-artifacts/1-4-customer-accounts.md` already showed as modified against the last commit before this story started (uncommitted Story 1.4 work); `scripts/gen-placeholders.mjs` already had 3 pre-existing lint warnings. None of these were part of this story's scope and none were edited here.

### File List

- `prisma/seed.ts` (new)
- `lib/server/user.ts` (modified — added `upsertUserWithRole()`)
- `lib/server/require-operator.ts` (new)
- `proxy.ts` (modified — matcher adds `admin`)
- `app/admin/layout.tsx` (new)
- `app/admin/login/page.tsx` (new)
- `app/admin/login/login-form.tsx` (new)
- `app/admin/login/actions.ts` (new)
- `app/admin/(app)/layout.tsx` (new)
- `app/admin/(app)/page.tsx` (new)
- `package.json` (modified — `db:seed` script, `tsx` devDependency)
- `package-lock.json` (modified — `tsx` + its deps)
- `prisma.config.ts` (modified — `migrations.seed` added, datasource untouched)
- `.env` (modified — `OPERATOR_EMAIL` / `OPERATOR_PASSWORD`)
- `.env.example` (modified — `OPERATOR_EMAIL` / `OPERATOR_PASSWORD`)
