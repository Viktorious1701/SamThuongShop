# Placeholder images — DEV STAND-INS ONLY

These are **temporary, generated placeholders** (Sky & Sedge palette, "placeholder"
watermark) used to build and demo the portfolio / hero / about / shop UI **before**
Sam Thuong provides real photos. **Replace them with real assets** per
[`image_assets/ASSET-GUIDE.md`](../../image_assets/ASSET-GUIDE.md).

Served by Next.js at `/placeholders/...` during development.

## Contents
| Path | Size | Stands in for |
|---|---|---|
| `hero/hero-01.jpg` | 2560×1440 | Home hero banner |
| `about/portrait.jpg` | 1200×1500 | Sam Thuong portrait (About) |
| `portfolio/bird-01…12.jpg` | 2000–2400px, varied aspect | Portfolio / product photos |
| `social/og.jpg` | 1200×630 | Social share (OpenGraph) |
| `favicon.png` | 512×512 | Favicon |
| `portfolio.json` | — | Caption/seed metadata (species EN+VN, location, collection) for the 12 portfolio images |

## Regenerate
`node scripts/gen-placeholders.mjs` (uses `sharp`, already in the project).

## When real assets arrive
Delete this folder (or swap files) and wire the components to the real images
(uploaded via the operator admin → R2 in Epic 2). `portfolio.json` can seed the
initial products/gallery until then.
