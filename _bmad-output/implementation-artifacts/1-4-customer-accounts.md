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

Claude Sonnet (to be filled by the dev agent)

### Debug Log References

### Completion Notes List

### File List
