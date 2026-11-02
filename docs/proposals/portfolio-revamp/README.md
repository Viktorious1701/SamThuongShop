# Proposal: Portfolio-only revamp

**Status:** approved and built (2026-11-02). See `docs/plans/R-portfolio-revamp.plan.md` · **Prototype:** open `index.html` in this folder in a browser. It uses the real photos from `image_assets/portfolio/`. The yellow boxes name the component behind each part; the "Hide notes" button removes them.

## 1. Why

The site grew features nobody asked to use day to day: a shop, cart, checkout, customer accounts, orders, collections, an Achievements system, two-level gallery groups and print links. The owner said it plainly: *"there are so many functions … that even I don't know how it works."*

The photos also show the work is **not only birds**. There is sport and press (Asian Games 2026), landscape (aerial fields) and performance (dance portrait). So the site should be:

> **A portfolio of Sâm Thương's photographs. Nothing else on the public site.**

## 2. The whole site: 4 pages

```text
/                 Home       hero photo · Selected work · Galleries · About teaser
/work             Work       all galleries as cards
/work/[slug]      Gallery    photos of one gallery + lightbox
/about            About      bio · record (exhibitions / awards / press) · contact (#contact)
```

**Nav:** `Sâm Thương` (→ Home) · **Work · About · Contact** · EN | VN. That's all.
Vietnamese labels: Tác phẩm · Giới thiệu · Liên hệ.

## 3. HTML structure per page

All pages share `SiteHeader`, `<main>` and `SiteFooter`.

**Home `/`**
```html
<header class="site-header">…wordmark · nav · EN|VN…</header>
<main>
  <section class="hero">                     <!-- <Hero>: one full-bleed photo, name, one line -->
    <img …><div class="hero__text"><h1>Sâm Thương</h1><p>…</p></div>
  </section>
  <section aria-labelledby="selected">       <!-- <PhotoGrid photos={featured}> -->
    <div class="section__head"><h2>Selected work</h2><a>All galleries →</a></div>
    <ul class="photo-grid"> <li><figure><button class="photo-tile"><img></button><figcaption>…</figcaption></figure></li> … </ul>
  </section>
  <section aria-labelledby="galleries">      <!-- <GalleryCardGrid> -->
    <ul class="categories"> <li><a class="category-card"><img><h3>Birds</h3><span>5 photos</span></a></li> … </ul>
  </section>
  <section aria-labelledby="about-teaser">…two lines + "Read more →"</section>
</main>
<footer class="site-footer">…</footer>
<div id="lightbox" role="dialog" aria-modal="true" hidden>…</div>   <!-- <Lightbox> -->
```

**Work `/work`:** `<header class="page-head"><h1>Work</h1></header>` followed by the same `<GalleryCardGrid>`.

**Gallery `/work/[slug]`**
```html
<header class="page-head">
  <nav class="crumbs">Work / Birds</nav><h1>Birds</h1><p>intro</p>
</header>
<ul class="photo-grid">…tiles with captions…</ul>    <!-- <PhotoGrid> -->
<nav class="pager">← previous gallery · next gallery →</nav>   <!-- <GalleryPager> -->
<div id="lightbox" …>                                  <!-- <Lightbox> -->
```

**About `/about`**
```html
<section class="about">
  <div class="about__portrait"><img></div>
  <div class="about__bio">
    <h1>About</h1><p>bio…</p>                                    <!-- <AboutBio> -->
    <div class="record"><h2>Exhibitions</h2><ul><li><time>2025</time><span>…</span></li></ul> …</div>  <!-- <Record> -->
  </div>
</section>
<section id="contact" class="contact">…Email · Facebook · Zalo…</section>   <!-- <ContactLinks> -->
```

## 4. Components (8 in total)

| Component | Kind | Used on | Notes |
|---|---|---|---|
| `SiteHeader` | server | all | Wordmark, 3 links, language toggle. No cart, no login. |
| `SiteFooter` | server | all | © line + the same 3 links |
| `Hero` | server | Home | One photo chosen in admin |
| `PhotoGrid` | client | Home, Gallery | Masonry with natural shapes and captions; tiles open the lightbox. **Already built** (`gallery-viewer.tsx`). |
| `Lightbox` | client | Home, Gallery | **Already built and tested** (keyboard, swipe, focus, `?image=` share link) |
| `GalleryCardGrid` / `GalleryCard` | server | Home, Work | **Already built** (`gallery-card.tsx`) |
| `GalleryPager` | server | Gallery | Previous/next gallery links |
| `AboutBio` + `Record` + `ContactLinks` | server | About | Plain content from one "Site" record |

## 5. Data: three things to manage

| What | Fields | Change from today |
|---|---|---|
| **Gallery** | name (vi/en), URL name, intro (vi/en), order, published | **Groups removed.** One level only (Birds, Sport & Events, Landscapes, People & Performance…). |
| **Photo** | caption (vi/en), place & date (vi/en), Featured, order | "Species" becomes **caption**, because not every photo is a bird. A bird caption can still read "Sarus Crane · Sếu đầu đỏ". **Print link removed.** |
| **Site** (one record) | hero photo, bio (vi/en), record list, email / Facebook / Zalo, portrait | New. Replaces the separate About, Achievements and Contact plans. |

**Admin menu:** **Galleries** (with photos inside) and **Site**. Nothing else.

## 6. What happens to the existing features

| Feature | Proposal |
|---|---|
| Shop, cart, checkout, accounts, orders, products, collections, shipping settings | **Switched off, not deleted.** A single setting `SHOP_ENABLED` (default off) hides every shop route and link, and its admin menu entries. The code stays, so it can come back later without rebuilding. |
| Achievements page (planned Story 1.9) | **Dropped.** It becomes the plain "Record" list on About. |
| Gallery groups (built in 1.6) | Hidden in admin; the database column is unused (it can be removed later). |
| "View this print" in the lightbox | Removed. Prints are arranged through Contact. |
| Contact form (planned 1.8) | Replaced by three links (email, Facebook, Zalo). No email service needed. |

**What's kept from the work already done:** the photo upload pipeline (bulk upload; private originals; ≤2400 px public copies with GPS removed), the masonry grid, the lightbox, gallery cards, bilingual routing, and the admin login.

## 7. Decisions for the owner

1. **Switch the shop off (code kept)**, or delete it entirely? *Recommended: switch off.*
2. **URLs `/work`** (as in the prototype) or keep `/portfolio`? *Recommended: `/work`, which is shorter and suits more than birds.*
3. **Gallery list:** Birds · Sport & Events · Landscapes · People & Performance. Is that right? Are there others (Travel? Wildlife other than birds?)
4. **Captions:** the placeholders in the prototype are guesses. Species, places and dates need the photographer's input.
5. **Photo quality:** the Asian Games photo is only 620 × 349 px. Is there a larger original?

## 8. Build plan (after approval)

| Step | Work |
|---|---|
| R1 | `SHOP_ENABLED` flag: hide shop routes, nav and admin entries |
| R2 | New nav/footer (Work · About · Contact); routes `/work`, `/work/[slug]` (redirect `/portfolio`) |
| R3 | Galleries one level: remove the group UI; relabel photo fields to caption / place; remove the print link |
| R4 | `Site` record + admin page (hero, bio, record, contact links, portrait) |
| R5 | Home page (hero, Selected work, galleries, about teaser) |
| R6 | About page (bio, record, contact) |
| R7 | Gallery pager; upload the real photos; run-through on desktop and phone |
