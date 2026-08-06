# Story 1.4: Customer accounts

Status: ready-for-dev

## Story

As a customer,
I want to create and sign in to an optional account,
so that I can see my orders and re-download purchases later. *(FR-24)*

## Acceptance Criteria

1. **Given** Auth.js v5 configured with email/password on Postgres, **When** I register with email + password, **Then** an account is created (password stored **hashed**, never plaintext).
2. **Given** an account, **When** I sign in with correct credentials, **Then** I get a session; with wrong credentials I get a clear error and no session.
3. **Given** a session, **When** I sign out, **Then** the session ends and the UI reflects signed-out state.
4. **Given** a signed-in customer, **When** any page renders, **Then** the session is available to Server Components (nav shows Account/Logout; a minimal `/account` page shows my email and redirects to `/login` if unauthenticated).
5. **Given** the register/login forms, **When** they render, **Then** required fields show a **non-color** "Bắt buộc / Required" marker and inline validation errors (text, not color alone), bilingual per the active locale.
6. **Given** the toolchain, **When** the story is done, **Then** the migration applies to Supabase, `/api/health` returns `{ok:true}`, and `tsc`/`lint`/`build` pass clean.

## Tasks / Subtasks

- [ ] **Task 0 — Supabase adapter swap + doc update (prereq)**
  - [ ] Remove `@prisma/adapter-neon`; add `@prisma/adapter-pg` (+ `pg`). Verify current Prisma 7 + `adapter-pg` setup.
  - [ ] `lib/server/db.ts`: `PrismaNeon` → `PrismaPg` (pooled `DATABASE_URL`). `schema.prisma` datasource: `url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`.
  - [ ] Update `ARCHITECTURE-SPINE.md` Stack (Neon → Supabase) + environments note; log in architecture memlog. Confirm `/api/health` = `{ok:true}` against Supabase.
- [ ] **Task 1 — User model + first migration (AC: 1)**
  - [ ] `User`: `id`, `email` @unique, `passwordHash`, `name?`, `role` @default("customer"), `createdAt`, `updatedAt`. `prisma migrate dev --name init_user` → creates the table on Supabase.
- [ ] **Task 2 — Auth.js v5 (AC: 2, 3, 4)**
  - [ ] `next-auth@beta`. `auth.ts`: Credentials provider; `authorize()` → `lib/server/user` (find by email + `bcrypt.compare`); **JWT** session; callbacks add `userId` + `role` to token/session. Handler `app/api/auth/[...nextauth]/route.ts`. Set `AUTH_SECRET` in `.env`.
- [ ] **Task 3 — Registration (AC: 1, 5)**
  - [ ] Server Action in the domain layer: zod validation, `bcryptjs` hash, create `User`, graceful duplicate-email handling. All Prisma access in `lib/server/` (AD-2).
- [ ] **Task 4 — UI (AC: 2, 3, 5)**
  - [ ] `app/[locale]/register/page.tsx`, `app/[locale]/login/page.tsx` — labelled bilingual forms, non-color required markers, inline errors (reuse the `text-input` token spec / Story 1.2 styles). Logout action. `app/[locale]/account/page.tsx` — shows email, redirects to `/login` if unauthenticated (page-level guard).
  - [ ] `components/site-nav.tsx`: Login link when signed out; Account + Logout when signed in (via `auth()` in the Server Component).
  - [ ] `messages/{vi,en}.json`: auth strings (Register/Đăng ký, Login/Đăng nhập, Logout/Đăng xuất, Email, Password/Mật khẩu, Required/Bắt buộc, error messages).
- [ ] **Task 5 — Verify (AC: 6)** — migration applied; `tsc`/`lint`/`build` clean; live register→login→logout round-trip; `/api/health` green.

## Dev Notes

**Builds on Stories 1.1–1.3 (all verified green).** DB provider is **Supabase** (decided with the user), replacing Neon — hence Task 0's adapter swap + spine update.

**Prisma 7 + Supabase connection:** app runtime uses the **transaction pooler** (`DATABASE_URL`, port 6543; append `?pgbouncer=true&connection_limit=1`); migrations use the **session pooler / direct** (`DIRECT_URL`, port 5432) via the datasource `directUrl`. Use `@prisma/adapter-pg` (`PrismaPg`).

**Auth.js Credentials gotcha:** the Credentials provider requires the **JWT** session strategy (not the database-session strategy), and it does **not** auto-create users — registration is a **separate Server Action** (hash + insert), and `authorize()` only verifies. No `@auth/prisma-adapter` is needed for v1 (no OAuth); a single `User` table suffices. `role` is included now (default `customer`) so Story 1.5 can add the operator without a schema churn.

**Layered rule (AD-2):** all Prisma access + hashing/verification live in `lib/server/` (e.g. `lib/server/user.ts`); pages/actions call it. `authorize()` in `auth.ts` delegates to it.

**No middleware change this story:** `/account` guards itself at the page level (`auth()` → redirect). Route-guarding via `proxy.ts`/middleware arrives with the operator/admin in Story 1.5 — do **not** modify `proxy.ts` here (it composes next-intl; adding auth to it is 1.5's problem).

**Scope — do NOT:** build operator role gating / admin shell (1.5), products/cart/orders, password reset (not in FR-24 ACs), or OAuth/social login.

### References

- [Source: ARCHITECTURE-SPINE.md#AD-9] — Auth.js v5, single auth system, operator + customer principals (operator gating is 1.5).
- [Source: ARCHITECTURE-SPINE.md#AD-2] — only `lib/server/` imports Prisma.
- [Source: EXPERIENCE.md#Accessibility Floor / Component Patterns#Forms] — required-field markers, inline errors not color-only.
- [Source: epics.md#Epic 1 / Story 1.4] — acceptance criteria.

## Dev Agent Record

### Agent Model Used

Claude Sonnet

### Debug Log References

- `npx prisma migrate dev --name init_user` → applied `20260805023008_init_user` to Supabase via `DIRECT_URL` (session pooler, 5432). Verified with a raw `pg` query against `information_schema.columns` and `prisma migrate status` (via `rtk proxy` to bypass the token-saving CLI wrapper's summarized output) — table exists with the exact columns/defaults from the schema.
- `npx tsc --noEmit` → 0 errors (after deleting a stale/corrupted `.next/dev/types/validator.ts` from a prior build, and fixing one control-flow narrowing issue in `account/page.tsx`).
- `npm run lint` → clean, exit 0.
- `npm run build` → succeeds (Turbopack, Next.js 16.3.0); all 11 routes compile, including `/api/auth/[...nextauth]`, `/[locale]/{register,login,account}`.
- Live round-trip verified twice: once with disposable `test+<timestamp>@example.com` addresses via a temporary Playwright script (installed `playwright` as a dev dependency for this verification only, then `npm uninstall playwright` afterward — it is not part of the shipped dependency tree), and once with the literal `test@example.com` / `TestPass123!` named in the task brief. Both flows: register → auto-signed-in → redirected to `/account` showing the email → nav shows "Tài khoản"/"Đăng xuất" → logout → nav reverts to "Đăng nhập" → `/account` redirects to `/login` when signed out → log back in → `/account` shows the email again.
- Verified `test@example.com`'s stored hash directly in Supabase: `passwordHash` = `$2b$12$WN1WDKPHLwbE3Axe4AIp7OG3uq/a42J.6pv/o14EkrrZCIbPdv5fm` (bcrypt, 12 rounds — never plaintext), `role` = `customer` (default).
- Verified error paths: re-registering an already-used email returns the `emailTaken` inline field error (no crash, no duplicate row); wrong password on login returns the generic `invalidCredentials` form error (no session created); submitting either form empty returns `required` as inline text under each field.
- One real bug caught during verification: Auth.js v5's "use server" convention requires every export from an actions file to be an async function. The first draft exported `initialRegisterState`/`initialLoginState` plain objects alongside the actions, which broke with "A 'use server' file can only export async functions, found object." Fixed by moving the initial `useActionState` value into the client form components and keeping the actions files to function + type-only exports.
- `/api/health` → `{"ok":true}` against the real Supabase DB (transaction pooler, `DATABASE_URL`) both before and after this story's changes.
- `/vi`, `/en`, `/styleguide`, `/vi/login`, `/en/login`, `/vi/register`, `/en/register` all return 200; `/vi/account` and `/en/account` return a 307 redirect to `/login` when signed out, as intended.

### Completion Notes List

- **next-auth version used:** `next-auth@5.0.0-beta.32` (Auth.js v5, `next-auth@beta` tag at time of implementation).
- **Test user created for the round-trip:** `test@example.com` / `TestPass123!` (plus several disposable `test+<timestamp>@example.com` addresses used during automated verification — all left in Supabase; they are harmless placeholder rows).
- Implemented Tasks 1–5 per the story (Task 0 — the Supabase/`adapter-pg` swap — was already done and was **not** touched: `lib/server/db.ts`, `prisma.config.ts`, and the `.env` connection strings are unmodified).
- `User` model added to `prisma/schema.prisma` exactly as specified (`id` cuid, `email` unique, `passwordHash`, `name?`, `role` default `"customer"`, `createdAt`/`updatedAt`); migration `20260805023008_init_user` applied to Supabase.
- `auth.ts` (root): Credentials provider, JWT session strategy, `jwt`/`session` callbacks add `userId`/`role`; `authorize()` delegates to `lib/server/user.ts#authenticateUser` (find by email + `bcrypt.compare`). Added `next-auth.d.ts` module augmentation for typed `session.user.id`/`role` and `token.userId`/`role`. `app/api/auth/[...nextauth]/route.ts` re-exports `handlers.GET`/`POST`.
- `AUTH_SECRET` generated with `openssl rand -base64 33` (the `npx auth secret` command resolved to an unrelated `auth` CLI package and was not used) and added to `.env` only — no DB connection strings touched.
- Registration is a Server Action (`app/[locale]/register/actions.ts`) that zod-validates input, calls `lib/server/user.ts#createUser` (bcrypt hash, 12 rounds; Prisma `P2002` mapped to a graceful `emailTaken` field error), then auto-signs-in via `signIn("credentials", …)` and redirects to `/account`. All Prisma access and password hashing/verification live only in `lib/server/user.ts` (AD-2); `auth.ts` and the Server Actions never import Prisma or `bcryptjs` directly.
- Login is a parallel Server Action (`app/[locale]/login/actions.ts`) that validates then calls `signIn`; any `AuthError` (wrong credentials) becomes a generic `invalidCredentials` message — never reveals whether the email exists.
- Logout is a single shared Server Action (`lib/actions/auth-actions.ts#logoutAction`) used both by the nav's Logout button and the `/account` page's logout button — a plain `<form action={...}>`, no client JS required.
- UI: `TextField` (`components/form/text-field.tsx`) implements the `text-input` DESIGN.md token — surface field, 1px ink-muted border (2px sky-deep focus ring, inset so it never shifts layout), error state swaps the border to `error` and renders the message as text + a non-color icon beneath the field, `aria-invalid`/`aria-describedby` wired up. Required fields show a non-color "(Bắt buộc)"/"(Required)" marker next to the label plus `aria-required`. `SubmitButton` implements `button-primary` (pill, sky-deep fill, `ink` focus ring per the token spec — a same-hue ring on a sky-deep button is explicitly forbidden by DESIGN.md).
- `/account` guards itself at the page level (`auth()` → `redirect({ href: "/login", locale })` from `i18n/navigation`) — `proxy.ts` was not touched, per the Dev Notes.
- `components/site-nav.tsx` now reads `auth()` and shows "Login" when signed out, or "Account" + a Logout button when signed in, alongside the existing Home/Shop/Portfolio/About/Contact links and language toggle.
- Added an `Auth` namespace to both `messages/en.json` and `messages/vi.json` (nav labels, form labels, required marker, and every validation/error message used by the two forms).
- Deviation from a literal reading of the task list: `initialRegisterState`/`initialLoginState` were **not** exported from the `"use server"` action files (Next.js forbids non-function exports there); they're defined locally in the client form components instead. Everything else matches the brief.
- Out of scope, confirmed not built: operator-role gating/admin shell (1.5), products/cart/orders, password reset, OAuth/social login.

### File List

**New files**
- `auth.ts`
- `next-auth.d.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `lib/server/user.ts`
- `lib/validation/auth-schemas.ts`
- `lib/actions/auth-actions.ts`
- `components/form/text-field.tsx`
- `components/form/submit-button.tsx`
- `components/logout-button.tsx`
- `app/[locale]/register/page.tsx`
- `app/[locale]/register/register-form.tsx`
- `app/[locale]/register/actions.ts`
- `app/[locale]/login/page.tsx`
- `app/[locale]/login/login-form.tsx`
- `app/[locale]/login/actions.ts`
- `app/[locale]/account/page.tsx`
- `prisma/migrations/20260805023008_init_user/migration.sql`

**Modified files**
- `prisma/schema.prisma` (added `User` model)
- `components/site-nav.tsx` (Login / Account + Logout)
- `messages/en.json`, `messages/vi.json` (added `Auth` namespace)
- `.env` (added `AUTH_SECRET` only — DB connection strings untouched)
- `package.json` / `package-lock.json` (added `next-auth`, `bcryptjs`, `zod`; `playwright` was added and removed again, verification-only)
