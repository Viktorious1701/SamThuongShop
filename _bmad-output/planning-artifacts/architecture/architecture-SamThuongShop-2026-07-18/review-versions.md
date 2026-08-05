# Version / Tech-Freshness Review — SamThuongShop

**Reviewed:** 2026-08-04 (mid-2026)
**Source:** `ARCHITECTURE-SPINE.md` — Stack table + named technologies in the spine.

## Verdict summary

Stack is overwhelmingly current and well-chosen. Two items need attention:

1. **Auth.js (NextAuth) v5 — still BETA, not noted.** Pinned as `5.x` / marked `[ADOPTED]`, but v5 has not shipped a stable (non-beta) release; it is still published as `next-auth@beta` (`5.0.0-beta.x`) in 2026.
2. **payOS sandbox — likely does not exist.** The spine's dev environment assumes a "payOS sandbox," but payOS documents live mode only, with a sandbox listed as a future/roadmap item. The dev workflow should not depend on a payOS sandbox that may not be available.

Everything else: verified-current and fits its stated use.

---

## Per-technology findings

### Next.js 16.2.x (App Router) — VERIFIED-CURRENT
- v16 is the current major line in 2026. Latest stable is on the 16.2.x line (16.2.11 Active LTS / 16.2.12), released through mid-2026. Next.js 16 ships Turbopack default, React 19.2, Cache Components, async params, App Router as default.
- 16.2.x is real, current, and appropriate for a server-component-first App Router build.
- Source: https://nextjs.org/blog/next-16 ; https://nextjs.org/docs/app/guides/upgrading/version-16

### React 19.x — VERIFIED-CURRENT
- React 19 launched Dec 2024; 19.2 (Oct 2025) is the active line. Latest patch 19.2.8 (Jul 21, 2026). Stable, production-appropriate, and the version Next.js 16 builds on.
- Source: https://react.dev/blog/2025/10/01/react-19-2 ; https://github.com/facebook/react/releases/tag/v19.2.8

### TypeScript 5.x — VERIFIED-CURRENT
- 5.x remains the current major line in 2026. Fine as pinned.

### Prisma 7.x — VERIFIED-CURRENT
- Prisma 7 is a real major version, released Nov 19, 2025 (Rust-free TypeScript runtime). Patch releases through 2026: 7.3 (Jan), 7.7 (Apr), 7.8 latest (~mid-2026). Recommended for production; supported. Real and appropriate.
- Source: https://www.prisma.io/blog/announcing-prisma-orm-7-0-0 ; https://github.com/prisma/prisma/releases

### PostgreSQL 16 (Neon, Singapore) — VERIFIED-CURRENT (minor note)
- Postgres 16 is real and NOT EOL (community support well into 2026+). Neon offers a Singapore region (ap-southeast-1), so co-locating with Vercel sin1 is valid.
- Minor: Postgres 17/18 exist and are also offered by Neon; 16 is a conservative, fully-supported choice — not stale, but could be bumped if desired. No correction required.
- Source: Neon regions / Vercel–Neon integration docs (https://vercel.com/marketplace/neon)

### next-intl (current) — VERIFIED-CURRENT
- Actively maintained; latest ~4.13.x (published within days of review). The de-facto i18n/routing solution for Next.js 16 App Router. Fits the bilingual vi/en requirement.
- Source: https://www.npmjs.com/package/next-intl

### Auth.js (NextAuth) v5 — REAL but BETA-NOT-NOTED  ⚠️
- v5 exists and is the actively-developed line, but it has **not** reached a stable release — it is still distributed as `next-auth@beta` (`5.0.0-beta.x`) in 2026. Widely used in production, but formally beta.
- **Correction:** In the Stack table / AD-9, note the beta status explicitly (e.g. `5.x (beta — next-auth@beta)`), and pin an exact beta build in deps to avoid churn. The `[ADOPTED]` framing without a beta caveat is misleading.
- Source: https://authjs.dev/getting-started/migrating-to-v5 ; https://www.npmjs.com/package/next-auth?activeTab=versions ; https://github.com/nextauthjs/next-auth/discussions/13382

### payOS Node SDK (VietQR) — REAL; sandbox assumption likely WRONG  ⚠️
- SDK is real: `@payos/node` (payOSHQ/payos-lib-node), requires Node 20+. payOS is a Vietnamese A2A / VietQR bank-transfer gateway and supports **individual (cá nhân) and household (hộ kinh doanh) merchants** — good fit for an indie/household seller, and as of Jan 2026 offers a free (no setup/maintenance fee) tier.
- payOS is **VietQR / bank-account based, not a wallet aggregator** — it does not settle Momo/ZaloPay wallet balances, which matches the spine's Deferred note. Correct.
- **Problem:** The spine's environments assume a "payOS sandbox" for local dev, but payOS documents **live mode only**, with a sandbox described as a future/roadmap possibility. There is no reliably-available payOS sandbox as of mid-2026.
- **Correction:** Do not gate the dev workflow on a payOS sandbox. Plan for testing against live mode with a real (free-tier) merchant account and small/real transactions, or mock the `PaymentProvider` interface locally (AD-4 already isolates the gateway, which makes mocking clean). Verify sandbox availability with payOS directly before relying on it.
- Source: https://github.com/payOSHQ/payos-lib-node ; https://www.npmjs.com/package/@payos/node ; https://payos.vn/

### Cloudflare R2 (S3 presigned URLs) — VERIFIED-CURRENT
- R2 is current and supports S3-compatible presigned URLs. The spine mints presigned download URLs from the Next.js server on Vercel (Node runtime), where the standard AWS S3 SDK (`@aws-sdk/client-s3` / `getSignedUrl`) works normally.
- Note (not a defect): the common "don't use the AWS SDK, use aws4fetch" caveat applies only inside the Cloudflare **Workers** runtime, which this architecture does not use. The private-bucket + presigned-download pattern (AD-6) is sound.
- Source: Cloudflare R2 presigned-URL docs / issue tracker (https://github.com/cloudflare/cloudflare-docs/issues/19190)

### Resend — VERIFIED-CURRENT
- Actively developed transactional email API; 2025–2026 additions include idempotency keys (safe retries for order/delivery emails), inbound email, React Email v5. Good fit for order + digital-delivery mail.
- Source: https://resend.com/ ; https://resend.com/blog/new-features-in-2025

### Tailwind CSS 4.x — VERIFIED-CURRENT
- v4 is the current major. Latest stable ~4.3.3 (Jul 16, 2026). Compatible with React 19 / Next.js 16 (early 4.0.x PostCSS conflicts are resolved). Fine as pinned.
- Source: https://tailwindcss.com/blog/tailwindcss-v4 ; https://versionlog.com/tailwind-css/

### Vercel sin1 (Singapore) — VERIFIED-CURRENT (plan note)
- `sin1` (Singapore) is a real Vercel region for Functions and pairs with Neon's Singapore region for low DB latency.
- Note: configuring `sin1` as the function region (and multi-region) requires a **Pro plan** — confirm the account tier, since a Hobby project cannot pin sin1.
- Source: https://vercel.com/docs/regions ; https://vercel.com/docs/pricing/regional-pricing/sin1

---

## Nothing found to be EOL or non-existent.
All pinned versions correspond to real, shipping releases. The only true accuracy issues are the **Auth.js v5 beta status** (undisclosed) and the **payOS sandbox assumption** (likely unavailable).
