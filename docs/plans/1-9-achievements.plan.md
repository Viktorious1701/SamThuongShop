# Story 1.9: Achievements (manage + view)

> ⛔ **SUPERSEDED 2026-11-02** by the portfolio-only revamp (`docs/plans/R-portfolio-revamp.plan.md`). Achievements become a plain "Record" list on About; this plan won't be built.

> **Epic:** 1 · **FR:** FR-26, FR-22 · **AD:** AD-1, AD-2, AD-7, AD-9, AD-15 · **Status:** ready-for-dev (plan under review) · **Branch:** suggest `achievements` (from `portfolio-galleries` once 1.6 is committed) · **Commit:** —
> **Source story:** `_bmad-output/planning-artifacts/epics.md#story-19` · **UX:** `EXPERIENCE.md` → surface 14, *Achievement entry* component · **Reference:** sprint-change-proposal §2.5 (HN's CV-style record, HTD's press cards)

**As a** visitor, **I want** to see Sam Thuong's awards, exhibitions, publications and honours, **so that** I can judge his professional standing.

The story delivers:
- a new **Achievements** page (`/vi/thanh-tuu`-style localized paths are *not* used; the URL is `/[locale]/achievements` like the other pages);
- an admin section to manage achievements;
- the `Achievement` table.

Story 1.10 will read the Featured achievements for the Home strip.

---

## 1. Gaps & Decisions

| ID | Area | Decision | Status |
|----|------|----------|--------|
| D1 | Data | **Four kinds**, as an enum: `AWARD` (Awards & competitions), `EXHIBITION`, `PUBLICATION` (Publications & press), `HONOUR` (Honours & memberships: titles such as A.FIAP or VAPA membership, ambassadorships). The public page uses this group order. Empty groups are hidden. | ✅ Proposed |
| D2 | Data | **Date = `year` (required) + optional `month`** (1–12). That covers "2019" and "March 2022" without inventing fake days. A CV-style record rarely needs the day. An optional `endYear` covers spans like *Sony ambassador 2017–2024*. | ✅ Proposed |
| D3 | Ordering | **Newest first** within each group: year ↓, then month ↓ (no month sorts after dated ones in the same year), then manual position. The admin ↑/↓ only reorders entries that tie (same kind, year and month). Moving a 2018 award above a 2023 one isn't possible, which keeps "newest first" true. | ✅ Proposed |
| D4 | Content | **Bilingual fields** (vi + en, Vietnamese fallback, AD-7): `title` (required in vi; en optional, falls back to vi), `organisation` (organiser / venue / outlet), and `description` (description or press excerpt). Proper nouns that don't translate can stay identical in both. | ✅ Proposed |
| D5 | Content | **Optional external link** (`https://` only, validated). It shows as "Read more / Xem thêm" and opens in a new tab with `rel="noopener noreferrer"`. Its `aria-label` names the destination, e.g. "Read more on vnexpress.net (opens in a new tab)". | ✅ Proposed |
| D6 | Image | **Optional image, from one of two sources** (the story allows both): **(a)** pick an existing **portfolio image** from a dropdown grouped by gallery, a soft FK that unlinks if the image is deleted; or **(b)** **upload** a new one, e.g. a certificate, exhibition poster or magazine page. Uploads reuse the 1.6 pipeline: browser → private original → sharp resize. The resize is to **≤1200 px** under the `achievements/` prefix, because these are thumbnails rather than portfolio photos. Uploads are stored with width, height and blur like portfolio images. Choosing one source clears the other. | ✅ Proposed |
| D7 | Image pipeline | **Generalize `processPortfolioUpload`** into `processDisplayUpload(originalKey, { kind })`. `kind` = `"portfolio"` (2400 px, `portfolio/`) or `"achievement"` (1200 px, `achievements/`). Each kind keeps its own private originals prefix and the same "only this prefix" guard. The 1.6 behaviour stays identical. | ✅ Proposed |
| D8 | Featured | **Featured flag** (default off). It's only stored and edited here; 1.10's Home strip reads it. | ✅ Proposed |
| D9 | Visibility | **Published flag** (default **on**). Unlike galleries, an achievement is a single entry, so it's usually ready as soon as it's saved. Unpublishing lets you hide one without deleting it. | ✅ Proposed |
| D10 | Nav | **Add "Achievements / Thành tựu" to the top nav and footer** now, between Portfolio and About, so the page is reachable. The full nav reorder (Portfolio first, Shop last), the cart-only-when-non-empty rule and moving Login to the footer **stay in 1.10**. | ✅ Proposed |
| D11 | SEO | **Per-locale metadata + OpenGraph** (an AC of this story). A small shared helper `lib/seo.ts` builds title, description, `alternates.languages` (vi ↔ en) and `openGraph` (locale `vi_VN`/`en_US`, type `website`, image = the first Featured achievement's image when there is one). It needs an absolute site URL, so it adds **`NEXT_PUBLIC_SITE_URL`** (`.env.example`) as `metadataBase` in the locale layout. If that's unset, Next falls back to the Vercel URL or localhost. 1.10 and others can reuse the helper. | ✅ Proposed |
| D12 | Look | **Quiet CV-style list, not cards with badges** (EXPERIENCE: "no trophy icons — the record speaks for itself"). Each entry has a meta line (*2022 · Hội Nhiếp ảnh Việt Nam*), a title (h3), and an optional one-paragraph description or excerpt. An optional thumbnail sits on the right on desktop and above on phone, with a reserved ratio. Publications read like **press cards** (outlet · year, title, excerpt, "Read more →"). | ✅ Proposed |
| D13 | Scope | **Out of scope:** the Home achievements strip and nav reorder (1.10), About (1.7), Journal/essays/videos (backlog), and importing achievements from a file. | ✅ Proposed |

---

## 2. Architecture

### 2.1 Source-tree layout

```text
prisma/
├── schema.prisma                                    # (mod) enum AchievementKind, model Achievement; PortfolioImage back-relation
└── migrations/{ts}_add_achievements/                # (new) additive

lib/
├── seo.ts                                           # (new) localizedMetadata() — alternates + openGraph
├── server/
│   ├── achievement.ts                               # (new) CRUD, tie-only reorder, public grouped read, featured read
│   ├── portfolio-image.ts                           # (mod) → processDisplayUpload(kind) — portfolio | achievement
│   └── portfolio.ts                                 # (mod) listImageOptions() for the "use a portfolio image" picker
└── validation/
    └── achievement-schemas.ts                       # (new) achievementSchema (literal English — admin)

app/
├── [locale]/layout.tsx                              # (mod) metadataBase from NEXT_PUBLIC_SITE_URL
├── [locale]/achievements/page.tsx                   # (new) grouped list + metadata/OG
└── admin/(app)/
    ├── layout.tsx                                   # (mod) "Achievements" admin nav link
    └── achievements/
        ├── page.tsx                                 # (new) list grouped by kind; ↑/↓ (ties), publish, featured, delete
        ├── actions.ts                               # (new) save / move / publish / delete / upload-url / process
        ├── achievement-editor.tsx                   # (new) client: fields + image source (none / portfolio / upload)
        ├── row-controls.tsx                         # (new) client: ↑/↓, publish, delete
        ├── new/page.tsx                             # (new)
        └── [id]/page.tsx                            # (new)

components/
├── achievement-entry.tsx                            # (new) one entry (meta · title · excerpt · thumb · link)
├── site-nav.tsx                                     # (mod) + Achievements link
└── site-footer.tsx                                  # (mod) + Achievements link

messages/{en,vi}.json                                # (mod) Achievements namespace + Nav.achievements
.env.example                                         # (mod) NEXT_PUBLIC_SITE_URL
```

### 2.2 Data model

| Model / Enum | Key fields | Notes |
|--------------|------------|-------|
| `AchievementKind` | `AWARD`, `EXHIBITION`, `PUBLICATION`, `HONOUR` | Group order on the page (D1) |
| `Achievement` | `id`, `kind`, `titleVi`, `titleEn?`, `organisationVi?`, `organisationEn?`, `descriptionVi?`, `descriptionEn?`, `year Int`, `month Int?`, `endYear Int?`, `url?`, `position Int @default(0)`, `featured Boolean @default(false)`, `published Boolean @default(true)`, **image (D6):** `portfolioImageId?` (FK → PortfolioImage, `SetNull`), `imageKey?`, `imageOriginalKey?`, `imageWidth?`, `imageHeight?`, `imageBlurDataUrl?`; timestamps; `@@index([kind, year])`, `@@index([featured])` | Uploaded-image keys are owned by the row (AD-15), so deleting the achievement or replacing the image removes both R2 objects. |

Migration: additive only. I write the SQL from `prisma migrate diff` and show it to you; **you apply it** with `npx prisma migrate deploy`.

### 2.3 Layer responsibilities

| Layer | Owns | File(s) |
|-------|------|---------|
| RSC pages | Read DTOs, render, metadata | `app/[locale]/achievements/page.tsx`, admin pages |
| Server Actions | `requireOperator()` → Zod → delegate → revalidate | `app/admin/(app)/achievements/actions.ts` |
| `lib/server/achievement.ts` | Ordering rules (D3), image ownership/cleanup (D6), published-only public read (D9) | — |
| `lib/server/portfolio-image.ts` | Resize pipeline per kind (D7) | — |
| `lib/seo.ts` | Metadata shape (D11); pure, no server imports | — |

### 2.4 Business rules & invariants

| Rule | Source | Enforced in |
|------|--------|-------------|
| Groups in fixed kind order; empty groups hidden | FR-26, D1 | `achievement.ts` public read + page |
| Newest first; manual order only among ties | FR-26, D3 | `achievement.ts` (`orderBy` + `moveAchievement` tie check) |
| vi required, en falls back to vi | AD-7, D4 | schema + `pickLocalized` |
| External link `https://` only; new tab + accessible label | D5 | schema + `achievement-entry.tsx` |
| One image source at a time; uploaded objects deleted with the row or on replace | D6, AD-15 | `achievement.ts` |
| Upload processing only accepts the achievements originals prefix | D7 | `portfolio-image.ts` |
| Operator-only mutations | AD-9 | `actions.ts` |
| A portfolio image used here stays visible even if its gallery is a draft | D6 | `achievement.ts` (reads the key directly; it's already a public object) |

### 2.5 Result / error flows

| Scenario | Outcome |
|----------|---------|
| Missing Vietnamese title / bad year (outside 1900–2100) / month not 1–12 / `endYear < year` / non-https link | `{ ok:false, error: "<English>" }` in the editor |
| Upload fails or the file isn't an image | Error under the image field; the rest of the form is kept |
| Unknown id in admin | `notFound()` |
| No published achievements | Public page shows a calm empty line instead of an empty layout |

### 2.6 i18n keys

- **`Nav.achievements`:** "Achievements" / "Thành tựu".
- **`Achievements` namespace:**
  - `title`, `intro`, `empty`;
  - group headings `award` ("Awards & competitions" / "Giải thưởng & cuộc thi"), `exhibition` ("Exhibitions" / "Triển lãm"), `publication` ("Publications & press" / "Ấn phẩm & báo chí"), `honour` ("Honours & memberships" / "Danh hiệu & hội viên");
  - `readMore` ("Read more" / "Xem thêm") and `readMoreOn` ("Read more on {site} (opens in a new tab)");
  - `metaDescription`.

---

## 3. Tasks (checklist)

| ID | Task | File |
|----|------|------|
| T01 | Schema: `AchievementKind`, `Achievement`, back-relation; `prisma generate` | `prisma/schema.prisma` |
| T02 | Migration SQL (additive) written and shown; **you apply it** | `prisma/migrations/…` |
| T03 | Zod schema (kind, bilingual fields, year/month/endYear rules, https url, image source) | `lib/validation/achievement-schemas.ts` |
| T04 | Generalize the resize pipeline → `processDisplayUpload(kind)`; 1.6 callers unchanged in behaviour | `lib/server/portfolio-image.ts`, `galleries/actions.ts` |
| T05 | `listImageOptions()` for the portfolio-image picker | `lib/server/portfolio.ts` |
| T06 | Achievement service: CRUD, tie-only move, publish/feature, image ownership + cleanup, `getAchievementGroups()`, `listFeaturedAchievements()` | `lib/server/achievement.ts` |
| T07 | Admin actions | `app/admin/(app)/achievements/actions.ts` |
| T08 | Admin list (grouped by kind, ↑/↓ on ties, publish, delete) + admin nav link | `achievements/page.tsx`, `row-controls.tsx`, `(app)/layout.tsx` |
| T09 | Editor (all fields, date, link, image source: none / portfolio picker / upload) + new/edit pages | `achievement-editor.tsx`, `new/`, `[id]/` |
| T10 | `lib/seo.ts` + `metadataBase` + `NEXT_PUBLIC_SITE_URL` in `.env.example` | `lib/seo.ts`, `[locale]/layout.tsx`, `.env.example` |
| T11 | Public page: grouped entries, empty state, metadata/OG | `app/[locale]/achievements/page.tsx`, `components/achievement-entry.tsx` |
| T12 | Nav + footer link (D10) | `site-nav.tsx`, `site-footer.tsx` |
| T13 | i18n en + vi | `messages/*.json` |
| T14 | Gates via Windows Node: tsc · eslint · build | — |
| T15 | Runtime walk (headless):<br>• create one of each kind, including a publication with link + excerpt, one with an uploaded image and one using a portfolio image;<br>• check `/vi` and `/en`: group order, newest first, empty group hidden, VN fallback for a missing English title;<br>• the link opens a new tab with its aria-label;<br>• `og:*` and `hreflang` tags present;<br>• phone width;<br>• deleting an uploaded-image achievement removes both R2 objects | — |

- [ ] T01 [ ] T02 [ ] T03 [ ] T04 [ ] T05 [ ] T06 [ ] T07 [ ] T08 [ ] T09 [ ] T10 [ ] T11 [ ] T12 [ ] T13 [ ] T14 [ ] T15

---

## 4. Verification

- **Static gates:** `cmd.exe /c "npx tsc --noEmit && npx eslint . && npm run build"`.
- **Runtime:** T15 walk with screenshots (desktop + phone, vi + en).
- **Regression:** a 1.6 upload still produces a ≤2400 px public copy after the T04 refactor.

---

## 5. Dev Agent Record — File List

*(filled in after implementation)*

**Not in scope (later stories):** Home achievements strip + nav reorder → 1.10 · About → 1.7 · Journal → backlog.
