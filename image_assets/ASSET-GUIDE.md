# SamThuongShop — Image Asset Guide

*A guide for gathering Sam Thuong's photos so the website looks its best. Provide images at the sizes below and they'll drop straight into the design — no re-doing.*

The whole site is built on one rule: **the photograph is the loudest thing on the page.** So the images matter more than anything. This guide lists exactly what's needed, where each one shows up, and the size to send.

---

## Quick reference (send these)

| # | Asset | Where it appears | Size to send (pixels) | Shape | Format | How many |
|---|---|---|---|---|---|---|
| 1 | **Hero banner** | The big image at the top of the home page | **2560 × 1440** (at least 2400 wide) | Wide / landscape | JPEG | 1 (up to 3 if you want it to rotate) |
| 2 | **Portrait of Sam Thuong** | The About page | **1200 × 1500** | Tall / portrait | JPEG | 1 |
| 3 | **Bird photographs** | Portfolio gallery, shop, product pages | **long side 2000–2400** — keep the photo's natural shape | Any (mixed is good) | JPEG | A curated set (see below) |
| 4 | **Favicon** | Tiny browser-tab icon | *We'll make this for you* | Square | — | 0 (optional input) |
| 5 | **Social share image** | Preview when a link is shared on Facebook/Zalo | *We'll make this from a hero photo* | Wide | — | 0 (reuses the hero) |

> **You do NOT need to send a logo.** The shop name "Sâm Thương" is shown as elegant typography, not an image.

---

## 1. Hero banner — the first impression

**Where:** the large image across the top of the home page. On phones it fills the full width of the screen; on computers it sits beside a short intro.

**Why it matters:** it's the first thing every visitor sees. It should be Sam Thuong's single most striking bird photograph.

**Send:** **2560 × 1440 px**, landscape (wide). 16:9 or 3:2 both work. JPEG, up to ~1.5 MB.

**Tips:**
- Pick a photo with a strong, clear subject and a bit of calm space around it.
- Landscape orientation only (wide, not tall).
- *(Your current `banner.jpg` is 1107 × 738 — it works but will look soft on big screens. If you have the original, re-export it at 2400+ px wide.)*

---

## 2. Portrait of Sam Thuong — the About page

**Where:** the About page, next to his short story/bio.

**Why it matters:** buyers trust a real person. A good portrait says "this is a serious, professional birder."

**Send:** **1200 × 1500 px**, portrait (tall). JPEG, up to ~800 KB.

**Tips:**
- In the field is ideal — with binoculars or camera, natural light, an uncluttered background (trees, water, sky).
- Head-and-shoulders or waist-up, with a little space above his head.
- Face roughly centered (so it can also be cropped to a circle if we ever need a small avatar).

---

## 3. Bird photographs — the heart of the site

**Where:** the portfolio gallery (a magazine-style grid of mixed sizes), the shop, and each product page.

**Why it matters:** these are both the showcase *and* the products. Everything else exists to frame them.

**Send:** **long side 2000–2400 px** each. **Keep each photo's natural shape** — do NOT crop them all to the same size. The gallery is designed to mix tall and wide photos beautifully. JPEG (~quality 85), up to ~1 MB each.

**How many:** whatever's ready — but **a tight, well-chosen set beats a big dump.** A great launch is roughly **12–24 photos**, grouped into a few themes (e.g. *Wetlands*, *Forest birds*, *Kingfishers*, *Raptors*). We can always add more later.

**IMPORTANT — for each photo, also tell us:**
- **Species** — in **English AND Vietnamese** (e.g. *Common Kingfisher / Bói cá lam*)
- **Location** — where it was taken (e.g. *Tràm Chim National Park*)
- **Date** — roughly when

The site prints a caption under every photo like *"Common Kingfisher · Tràm Chim"*, so we need this info. Use the **`photo-metadata-template.csv`** in this folder — one row per photo.

---

## 4 & 5. Favicon + social image — we make these

- **Favicon** (the tiny browser-tab icon) and the **social-share preview** (what shows when a link is posted to Facebook/Zalo) — **we'll create these for you** from a bird photo + the shop name. No action needed, though if Sam Thuong has a preference, let us know.

---

## Golden rules for every image

1. **Export as sRGB** color (not Adobe RGB / ProPhoto). This is a setting in Lightroom/Photoshop "Export." Wrong color space = dull, washed-out colors in the browser.
2. **Format: JPEG** for photos (quality ~85). The website automatically makes modern optimized versions — you don't need to.
3. **⭐ Keep your full-resolution originals!** These web images are shrunk down for speed. But when Sam Thuong starts **selling prints**, we'll need the *full-size, high-resolution* files (300 DPI) — so **never delete the originals.** (Print-file specs come later, when we set up the shop.)
4. **File names:** simple is fine — `kingfisher-tramchim-01.jpg`. The details go in the CSV, not the filename.

---

## Where to put the files

Drop images into these folders (each has a short note inside):

```
image_assets/
├── hero/            ← the home-page banner (item 1)
├── about/           ← the portrait of Sam Thuong (item 2)
├── portfolio/       ← the bird photographs (item 3)
├── favicon-og/      ← (we fill this — leave empty)
└── photo-metadata-template.csv   ← fill one row per bird photo
```

---

## ✅ Sam Thuong's checklist

- [ ] **1 hero banner** — best bird shot, landscape, ~2560 × 1440
- [ ] **1 portrait** of himself — tall, ~1200 × 1500
- [ ] **~12–24 bird photos** — long side 2000–2400, natural shapes, grouped into a few themes
- [ ] **The CSV filled in** — species (EN + VN), location, date for each photo
- [ ] Everything exported as **sRGB JPEG**
- [ ] **Full-resolution originals kept safe** (for future print sales)

*Questions on any of this? Ask Thinh An.*
