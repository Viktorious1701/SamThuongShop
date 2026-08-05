# Story 1.1: Scaffold and deploy the application

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the developer (building for the Operator, Thinh An),
I want a running, deployable Next.js 16 app wired to the database and hosting with the layered structure in place,
so that every later story ships onto a live, consistent foundation.

## Acceptance Criteria

1. **Given** an empty repository, **When** the app is scaffolded (Next.js 16 App Router, TypeScript, Tailwind CSS 4) and connected to Neon Postgres via Prisma 7, **Then** it builds and runs locally (`npm run build` and `npm run dev` succeed).
2. **Given** the scaffolded app, **When** it is deployed to Vercel (`sin1` Singapore region), **Then** a placeholder page renders at a public URL.
3. **Given** the architecture's layered paradigm, **When** the source tree is created, **Then** `app/`, `lib/server/`, and `components/` exist with the dependency rule documented, and `lint` + `typecheck` pass with zero errors.
4. **Given** the database connection, **When** a health check runs, **Then** the app can reach Neon Postgres — **and no domain tables are created** (only the Prisma client + a connectivity check).
5. **Given** the integration-layer boundary, **When** the code is reviewed, **Then** only `lib/server/*` imports Prisma; no React component imports the DB.

## Tasks / Subtasks

- [ ] **Task 1 — Scaffold the Next.js 16 app (AC: 1, 3)**
  - [ ] Run `create-next-app` with App Router + TypeScript + Tailwind + ESLint. Verify it pins **Next.js 16.2.x** and **React 19** (follow current create-next-app prompts; do not downgrade).
  - [ ] Confirm **Tailwind CSS 4** is wired (the v4 `@import "tailwindcss"` + `@tailwindcss/postcss` approach, not a v3 `tailwind.config.js` content array). Verify at build time.
  - [ ] Create the layered directory structure: `app/`, `lib/server/`, `components/`, `prisma/`, `messages/`. Add a short `README`/comment in `lib/server/` stating the rule: **only this layer imports Prisma; presentation never touches the DB** (AD-1, AD-2).
  - [ ] Ensure `npm run build`, `npm run dev`, `npm run lint`, and a typecheck (`tsc --noEmit`) all pass clean.
- [ ] **Task 2 — Wire Prisma 7 + Neon Postgres (AC: 4, 5)**
  - [ ] `npm i prisma @prisma/client`; `npx prisma init`. Point `DATABASE_URL` at a **Neon** project in the **Singapore (`ap-southeast-1`)** region (use a Neon branch for dev).
  - [ ] Create a single shared Prisma client singleton in `lib/server/db.ts` (guard against hot-reload duplication in dev).
  - [ ] Keep `schema.prisma` **empty of domain models** — no tables this story. A trivial migration is fine only if needed to validate connectivity; otherwise a raw `SELECT 1` health check suffices.
  - [ ] Add a health-check route handler at `app/api/health/route.ts` that runs `SELECT 1` via the client and returns `{ ok: true }`; it must live in the Route Handler layer, calling a `lib/server/` function (AD-1).
- [ ] **Task 3 — Env & config (AC: 1, 2)**
  - [ ] Create `.env.example` listing every secret the project will need (documented, not filled): `DATABASE_URL`, and placeholders for later stories (`AUTH_SECRET`, `RESEND_API_KEY`, `R2_*`, `PAYOS_*`). Real values via env only; never in the client bundle (AD convention: secrets & config).
  - [ ] Add `.env` to `.gitignore`; commit `.env.example`.
- [ ] **Task 4 — Deploy to Vercel `sin1` (AC: 2)**
  - [ ] Connect the repo to Vercel; set `DATABASE_URL` in Vercel env.
  - [ ] Pin the region to **`sin1`** (`vercel.json` `"regions": ["sin1"]` and/or project setting). ⚠️ **Region pinning for Functions requires a Vercel Pro plan** — if the account is Hobby, note it in the completion notes and deploy without the pin (default region) rather than blocking.
  - [ ] Verify a placeholder page renders at the deployed URL and `/api/health` returns `{ ok: true }` against the real DB.
- [ ] **Task 5 — Verify end-to-end**
  - [ ] Local: `build` + `dev` + `lint` + typecheck green; `/api/health` OK locally.
  - [ ] Prod: deployed URL loads; `/api/health` OK. Record both URLs in the File List / Completion Notes.

## Dev Notes

**This is a greenfield scaffold — the very first code in the repo.** The project root is `/mnt/d/Personal/SamThuongShop`. Create the app **in place at the repo root** (the `_bmad-output/` planning folder stays where it is; the app is a sibling to it at the root). Do not nest the app inside `_bmad-output/`.

**Stack versions to pin** (verified current as of 2026-07; from the Architecture spine Stack table):
- Next.js **16.2.x** (App Router), React **19.x**, TypeScript **5.x**
- Prisma **7.x**, PostgreSQL **16** on **Neon (Singapore)**
- Tailwind CSS **4.x**
- (Later stories add: next-intl, Auth.js v5 `next-auth@beta`, payOS Node SDK, Cloudflare R2, Resend — **do not install or configure these yet**.)

**The layered paradigm (bind now, it governs the whole codebase):**
- `app/` = presentation (React Server Components by default) + Route Handlers under `app/api/`. **Never imports Prisma.**
- `lib/server/` = domain/integration. **The only layer that imports Prisma.** Mutations will be Server Actions; inbound calls (webhooks, downloads, auth) will be Route Handlers (AD-1).
- `components/` = shared UI.
- Establish this now so Story 1.2 (tokens) and beyond drop into a consistent tree.

**Target source tree** (from the spine's Structural Seed — create the skeleton, not the full contents):
```
samthuongshop (repo root)/
  app/
    [locale]/         # (locale routing arrives in Story 1.3 — a plain app/ page is fine for this story)
    api/health/       # this story: DB connectivity check
  lib/server/         # db.ts (Prisma singleton) + a health function
  components/
  messages/           # (populated in Story 1.3)
  prisma/             # schema.prisma (no domain models yet)
```

**Scope discipline — what this story must NOT do** (these belong to later stories; doing them here breaks the entity-only-when-needed rule and creates forward dependencies):
- ❌ No domain tables (Product, Order, User, etc.) — those are created by the stories that first need them (auth in 1.4, Product in 2.1, Order in 3.2).
- ❌ No design tokens / Tailwind theme (Story 1.2), no i18n/locale routing (Story 1.3), no auth (Story 1.4), no payments/storage/email.
- ❌ No `[locale]` routing yet — a single placeholder page at `/` is enough; Story 1.3 introduces `next-intl` and the `[locale]` segment.

**Testing standards:** the toolchain gate for this story is `build` + `lint` + `tsc --noEmit` clean, plus the `/api/health` check passing locally and in prod. A formal test framework (Vitest/Playwright) is not required by this story; if you add one, keep it minimal and don't block on it.

**Integer VND / money:** not exercised in this story, but when you set up any formatting utilities, remember the project-wide rule (AD-5): money is integer VND end-to-end. Don't introduce a float money helper.

### Project Structure Notes

- The app is created at the repository root, coexisting with the `_bmad-output/` planning artifacts and the `_bmad/` tooling and `.claude/` skill directories already present. Verify `create-next-app` does not clobber those — run it in a way that scaffolds into the current directory without deleting siblings (if it refuses due to a non-empty dir, scaffold into a temp subdir and move files, preserving `_bmad*`, `.claude`, `.git`).
- `.gitignore` must include `.env`, `node_modules`, `.next`, and Vercel/Prisma local artifacts.

### References

- [Source: _bmad-output/planning-artifacts/architecture/architecture-SamThuongShop-2026-07-18/ARCHITECTURE-SPINE.md#Design Paradigm] — layered monolith, RSC-first, the three layers.
- [Source: …/ARCHITECTURE-SPINE.md#AD-1] — Server Actions for mutations; Route Handlers for webhooks/downloads/auth.
- [Source: …/ARCHITECTURE-SPINE.md#AD-2] — only `lib/server/` imports Prisma.
- [Source: …/ARCHITECTURE-SPINE.md#Stack] — pinned versions.
- [Source: …/ARCHITECTURE-SPINE.md#Structural Seed] — source tree + environments (Vercel `sin1`, Neon `sin1`, Pro-plan caveat).
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1 / Story 1.1] — acceptance criteria and "no domain tables" scope.

## Dev Agent Record

### Agent Model Used

Claude Sonnet

### Debug Log References

- `npm run build` (runs `prisma generate && next build`) — succeeded, output routes: `○ /` (static), `○ /_not-found` (static), `ƒ /api/health` (dynamic).
- `npm run lint` — "ESLint: No issues found".
- `npx tsc --noEmit` — "TypeScript: No errors found".
- `npm run dev` (Turbopack) — "✓ Ready in 10.6s"; `GET /` → HTTP 200; `GET /api/health` → HTTP 503, body `{"ok":false}` (expected — no real `DATABASE_URL` locally, see notes below).

### Completion Notes List

- Scaffolded Next.js **16.3.0** (App Router) + React **19.2.8** + TypeScript + Tailwind CSS **4** + ESLint via `create-next-app`, run into a temp dir and moved into the repo root (`create-next-app` refuses non-empty dirs). `_bmad`, `_bmad-output`, `.bmad-core`, `.claude`, `.git`, `docs`, `image_assets`, `logs` all verified intact after the move.
  - Next resolved to **16.3.0**, newer than the 16.2.x cited in the Architecture Spine (spine dated 2026-07-18; today is 2026-08-04) — kept per instruction to accept `create-next-app` defaults and not downgrade.
- Confirmed Tailwind v4 wiring: `app/globals.css` uses `@import "tailwindcss"` + `@theme inline`, `postcss.config.mjs` uses `@tailwindcss/postcss` — no v3 `tailwind.config.js`.
- Created the layered tree: `app/` (presentation + `app/api/health/`), `lib/server/` (domain/integration, with `README.md` documenting AD-1/AD-2 — only this layer imports Prisma), `components/` (placeholder, `.gitkeep`), `messages/` (placeholder, `.gitkeep`, populated in Story 1.3), `prisma/` (`schema.prisma`, no domain models).
- Installed **Prisma 7.9.1** + `@prisma/client` + `@prisma/adapter-neon` (Prisma 7 requires an explicit driver adapter — no bundled query engine binary) + `dotenv`. Ran `prisma init --datasource-provider postgresql`, which generated the Prisma-7-native `schema.prisma` (`generator client { provider = "prisma-client"; output = "../lib/generated/prisma" }`, `datasource db { provider = "postgresql" }` with no inline `url`) and `prisma.config.ts` (loads `DATABASE_URL` via `env()` + `dotenv/config`).
  - `lib/generated/prisma` (the generated client) is gitignored and regenerated via `postinstall`/`build` scripts (`"postinstall": "prisma generate"`, `"build": "prisma generate && next build"`), consistent with Prisma 7's no-engine-binary model.
- `lib/server/db.ts`: Prisma client singleton using `PrismaNeon` adapter over `DATABASE_URL`, stashed on `globalThis` in non-production to survive dev hot-reload without opening duplicate pools.
- `lib/server/health.ts`: `checkDatabaseConnection()` runs `prisma.$queryRaw\`SELECT 1\`` and returns a boolean, swallowing errors (never throws).
- `app/api/health/route.ts`: Route Handler `GET` calls `checkDatabaseConnection()` and returns `Response.json({ ok: true })` or `Response.json({ ok: false }, { status: 503 })`. It does not import Prisma or the DB directly (AD-1/AD-2) — verified no `@prisma/client`/`lib/generated` import outside `lib/server/*`.
- Fixed a Next 16 typecheck issue in the generated `app/layout.tsx`: the default template typed `RootLayout` with the ambient `LayoutProps<"/">` global, which only exists after `next build`/`next dev` generate `.next/types`; this made a standalone `tsc --noEmit` fail with `Cannot find name 'LayoutProps'`. Replaced with an explicit `{ children: ReactNode }` prop type (`import type { ReactNode } from "react"`) so typecheck is green without a prior build. Also updated the placeholder `metadata` title/description away from the "Create Next App" default, and replaced `app/page.tsx` with a minimal SamThuongShop placeholder (no design tokens — Story 1.2 scope).
- `.env.example` documents `DATABASE_URL` plus placeholders for `AUTH_SECRET`, `RESEND_API_KEY`, `R2_*`, `PAYOS_*` (all later stories, not filled in). `.gitignore` updated: added `!.env.example` negation (the pre-existing `.env*` rule would otherwise have ignored the example file too), and `/lib/generated/prisma`. `node_modules` and `.next` were already ignored by the `create-next-app` default `.gitignore`.
- `vercel.json` pins `"regions": ["sin1"]`.
- Set `package.json` `"name"` to `"samthuongshop"` (was the scaffold's default `"app-scaffold"`).
- **Verification results (local, no real DB):** `npm run build` ✅ succeeds; `npm run lint` ✅ clean; `npx tsc --noEmit` ✅ clean; `npm run dev` ✅ starts, `/` renders (HTTP 200); `/api/health` returns HTTP 503 `{"ok":false}` — expected and correct, since no real `DATABASE_URL` is configured (the placeholder `.env` from `prisma init` points at a non-existent `localhost:5432`). The route/handler code path is verified correct: it would return `{ ok: true }` (HTTP 200) once a real Neon `DATABASE_URL` is set, per AD-1/AD-2 (Route Handler → `lib/server` → Prisma, never inline in the route).
- **Did NOT do** (credential-gated — left for the human/Operator to complete):
  1. **Create a Neon Postgres project in the Singapore (`ap-southeast-1`) region** and a dev branch; set the real connection string as `DATABASE_URL` in a local `.env` (copy from `.env.example`) and confirm `curl localhost:3000/api/health` returns `{"ok":true}`.
  2. **`vercel login`**, link this repo/directory to a Vercel project, and set `DATABASE_URL` in the Vercel project's environment variables (Production + Preview).
  3. **Deploy to Vercel.** `vercel.json` already pins `"regions": ["sin1"]`, but region pinning for Functions requires a **Vercel Pro plan** — if the account is on Hobby, deploy without the pin (default region) rather than blocking, and note the plan tier in a follow-up. After deploy, verify the placeholder page renders at the public URL and `/api/health` returns `{"ok":true}` against the real DB.
  4. Record both the local and the deployed `/api/health` results once the above is done (Task 5 in this story).
- Scope discipline followed: no domain tables/models, no design tokens/theme, no i18n/`[locale]` routing, no auth, no payments/storage/email were added — only the single placeholder page at `/` plus the health-check plumbing, per this story's Tasks/Dev Notes.

### File List

**Created:**
- `app/layout.tsx` (from scaffold, edited — see notes)
- `app/page.tsx` (from scaffold, replaced with placeholder)
- `app/globals.css`, `app/favicon.ico` (from scaffold, unmodified)
- `app/api/health/route.ts`
- `lib/server/db.ts`
- `lib/server/health.ts`
- `lib/server/README.md`
- `components/.gitkeep`
- `messages/.gitkeep`
- `prisma/schema.prisma` (via `prisma init`, unmodified)
- `prisma.config.ts` (via `prisma init`, unmodified)
- `.env` (via `prisma init`, placeholder value, gitignored — not committed)
- `.env.example`
- `.gitignore` (from scaffold, edited — added `!.env.example`, `/lib/generated/prisma`)
- `vercel.json`
- `package.json`, `package-lock.json` (from scaffold, edited — see notes)
- `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs` (from scaffold, unmodified)
- `next-env.d.ts` (generated, unmodified)
- `AGENTS.md`, `CLAUDE.md`, `README.md` (from scaffold defaults, unmodified)
- `lib/generated/prisma/**` (generated Prisma Client output — gitignored, regenerated by `postinstall`/`build`)
