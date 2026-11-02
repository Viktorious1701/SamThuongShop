# Revamp: Portfolio-only site

> **Status:** Done — gates + runtime green (2026-11-02) · **Branch:** suggest `portfolio-revamp` (from `portfolio-galleries`, 1.6 committed at `b86ff72`) · **Proposal + prototype:** `docs/proposals/portfolio-revamp/` (README.md + `index.html`) · **Supersedes:** Story 1.9 (Achievements), 1.7 / 1.8 / 1.10 as written in epics.md

**As** Sâm Thương, **I want** my site to be just my portfolio (Work · About · Contact), **so that** visitors and clients see my photography and nothing else gets in the way.

**Owner decisions (2026-11-02):**
1. Switch the shop **off**; keep the code.
2. URLs `/work`.
3. **One level of categories** (Birds · Sport & Events · Landscapes · People & Performance), managed in admin.
4. Template captions and dates for now.
5. The low-resolution photos are OK for now.

---

## 1. Decisions

| ID | Area | Decision |
|----|------|----------|
| D1 | Shop off | New flag **`SHOP_ENABLED`** (only `"true"` enables; default off, same style as the 3.8 flags). Shop pages move into a **route group** that doesn't change URLs: `app/[locale]/(shop)/…` (shop, cart, checkout, account, login, register, order) and `app/admin/(app)/(shop)/…` (products, collections, orders, settings). Each group's `layout.tsx` calls `notFound()` when the flag is off. So **every shop URL returns 404**, and the code is untouched apart from its folder. `createOrder()` also refuses when off, in case a server action is called directly. |
| D2 | Nav | Public header: **wordmark · Work · About · Contact · EN\|VN**. Cart and Account/Login appear **only if `SHOP_ENABLED`**. The footer has the same 3 links. Admin menu: **Dashboard · Galleries · Site**, with shop entries only if the flag is on. |
| D3 | URLs | `app/[locale]/portfolio` → **`app/[locale]/work`**. Permanent redirects `/:locale/portfolio(/:slug)` → `/:locale/work(/:slug)` in `next.config.ts`. `/contact` redirects to `/about#contact`. |
| D4 | Galleries flat | One level. The **group UI is removed**: no parent picker, a flat admin list, no group pages. The `parentId` column stays, unused, for now. Public read = published galleries that have photos, in admin order. |
| D5 | Photo fields | `species` → **`caption`** (vi/en), because not every photo is a bird. This is a **column rename** in the migration (`RENAME COLUMN`, not drop/add, so nothing is lost). `location` stays and is labelled "Place & date". The caption shows the active language with Vietnamese fallback. Showing both languages in one caption was a birder convention that doesn't suit sport or portraits; a bird caption can still be written "Sarus Crane · Sếu đầu đỏ". |
| D6 | Print link | Removed from the admin row and the lightbox. `productId` stays, unused, while the shop is off. |
| D7 | Site content | New singleton **`SiteContent`** (id `"site"`) holding:<br>• `heroImageId` (→ PortfolioImage, SetNull);<br>• `taglineVi/En` (the hero line);<br>• `aboutTeaserVi/En`, `bioVi/En`;<br>• a **portrait** (uploaded through the same pipeline as gallery photos, as a 1200 px copy);<br>• `exhibitionsVi/En`, `awardsVi/En`, `pressVi/En`;<br>• `email`, `facebookUrl`, `zalo`. |
| D8 | Record format | Each record section is **one textarea**, one entry per line: `2025 \| Exhibition name, venue \| https://link (optional)`. There are no extra tables or forms, and editing it feels like editing a list. Bad lines show as plain text and are never hidden. English is optional and falls back to Vietnamese. |
| D9 | Home | **Hero** = the chosen hero photo, else the first Featured photo. **Selected work** = Featured photos from published galleries, in gallery order then photo order, up to 12. **Galleries** = cards with a 4:5 cover (first Featured, else first photo). **About teaser** shows if one is written. |
| D10 | Gallery page | Heading + intro, `PhotoGrid` + `Lightbox` (reused from 1.6), and **`GalleryPager`** (previous / next published gallery). |
| D11 | Templates | Seed the 8 photos from `image_assets/portfolio/` into 4 galleries through the real admin upload, with placeholder captions such as *"Shining Sunbeam"* and *"Location · year — to be confirmed"*. Template bio, record and contact text are clearly marked as placeholders, ready for you to overwrite in admin. |
| D12 | Test data | Delete the 1.6 test galleries (*Chim Việt Nam (TEST)*, *Tràm Chim (TEST)*) and their 6 images. |
| D13 | Kept as-is | Upload pipeline (private original, ≤2400 px public copy, EXIF/GPS stripped), masonry grid, lightbox, bilingual routing, admin login. |

---

## 2. Source-tree changes

```text
lib/server/shop-config.ts            (mod) + shopEnabled()
lib/server/order.ts                  (mod) createOrder refuses when shop off
lib/server/portfolio.ts              (mod) flat galleries; caption fields; no printSlug; featured photos; pager neighbours
lib/server/portfolio-image.ts        (mod) kind: "portfolio" | "portrait"
lib/server/site-content.ts           (new) get/save SiteContent; parseRecord()
lib/validation/portfolio-schemas.ts  (mod) caption; no parentId/productId
lib/validation/site-schemas.ts       (new)
prisma/schema.prisma + migration     (mod/new) SiteContent; species→caption RENAME
next.config.ts                       (mod) redirects /portfolio→/work, /contact→/about#contact

app/[locale]/page.tsx                (mod) Home
app/[locale]/work/page.tsx           (moved from portfolio/) Work index
app/[locale]/work/[slug]/page.tsx    (moved) Gallery + pager
app/[locale]/about/page.tsx          (mod) bio + record + #contact
app/[locale]/contact/                (removed → redirect)
app/[locale]/(shop)/…                (moved, + layout.tsx guard)
app/admin/(app)/(shop)/…             (moved, + layout.tsx guard)
app/admin/(app)/layout.tsx           (mod) menu
app/admin/(app)/galleries/…          (mod) flat list; editor without group; image row without print link; caption labels
app/admin/(app)/site/                (new) page.tsx, site-editor.tsx, actions.ts

components/site-nav.tsx, site-footer.tsx         (mod)
components/home/hero.tsx                         (new)
components/portfolio/gallery-pager.tsx           (new)
components/about/record.tsx, contact-links.tsx   (new)
components/portfolio/caption.tsx, gallery-viewer.tsx, lightbox.tsx, gallery-card.tsx  (mod) caption field; no print link; 4:5 cover
messages/{en,vi}.json                            (mod) Nav.work, Home, About, Work
.env.example                                     (mod) SHOP_ENABLED
```

---

## 3. Tasks (checklist)

| ID | Task |
|----|------|
| R1 | **Shop off:** `shopEnabled()`; move shop routes into `(shop)` groups with guard layouts (public + admin); `createOrder` guard; `.env.example` |
| R2 | **Nav + URLs:** header and footer (Work · About · Contact; cart/login only if shop on); admin menu; move `portfolio/` → `work/`; redirects |
| R3 | **Flat galleries + caption:** schema rename + `SiteContent` model; migration SQL shown to you, **you apply it**; service, schemas, admin editor/list/image rows; remove group pages and the print link |
| R4 | **Site admin:** `/admin/site` with hero photo picker, tagline, teaser, bio, portrait upload, 3 record textareas (vi/en), contact fields |
| R5 | **Home:** Hero, Selected work, Galleries, About teaser |
| R6 | **About + Contact:** bio, portrait, Record (parsed lines), ContactLinks (`#contact`) |
| R7 | **Gallery pager**, Work page heading, 4:5 cards |
| R8 | **i18n:** en + vi for every new string |
| R9 | **Gates:** tsc · eslint · build (Windows Node) |
| R10 | **Content + walk:**<br>• delete the test galleries;<br>• create the 4 galleries and upload the 8 photos with template captions;<br>• fill in template Site content;<br>• headless walk at desktop and phone, vi and en: Home, Work, Gallery (lightbox, pager), About/Contact;<br>• every shop URL returns 404, and `/portfolio` and `/contact` redirect;<br>• screenshots for you. |

- [x] R1 [x] R2 [x] R3 [x] R4 [x] R5 [x] R6 [x] R7 [x] R8 [x] R9 [x] R10

---

## 4. Verification

- **Static gates:** ✅ tsc · eslint · `npm run build` (Next 16.4.3, Windows Node).
- **Migration:** ✅ `20261102085459_portfolio_revamp` applied. The species→caption columns were **renamed** (no data lost), and the `SiteContent` table was created.
- **Content (through the real admin UI):**
  - the 1.6 TEST gallery and its photos were deleted;
  - 4 galleries were created and published: Birds (5), Sport & Events (1), Landscapes (1), People & Performance (1);
  - the 8 photos have template captions (place/date "to be confirmed"), and 7 are Featured;
  - Site holds template tagline, teaser, bio, record and contact, with the hero set to Sarus Crane.
- **Runtime walk (headless, 34/34):**
  - `/en` and `/vi` Home, Work, Gallery and About all return 200;
  - the header is exactly Work · About · Contact, with no cart/login;
  - the hero is the chosen photo, Selected work shows the Featured photos minus the hero (6), and there are 4 gallery cards;
  - the gallery pager links to the next gallery;
  - lightbox →/← and Esc work, with no print link;
  - About shows 3 record sections and 3 contact links, and the press link opens a new tab;
  - **all shop URLs return 404** (shop, cart, checkout, login, account, register, order);
  - `/portfolio/*` redirects to `/work/*`, and `/contact` to `/about#contact`;
  - no console errors;
  - no sideways scroll at phone width (390).
- **Post-walk fix:** About no longer shows an empty grey box when there's no portrait yet; the text takes the full width.

## 5. Not in scope

Real captions, dates and bio (you'll write them in admin later) · larger originals · a contact form · Journal · turning the shop back on (only the flag would change) · dropping the unused `parentId` / `productId` columns (a later clean-up).
