// Generate on-brand DEV placeholder images (Sky & Sedge) with Node + sharp.
// These are temporary stand-ins for Sam Thuong's real photos — see
// image_assets/ASSET-GUIDE.md. Re-runnable: `node scripts/gen-placeholders.mjs`.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const OUT = "public/placeholders";

// Sky & Sedge palette
const C = {
  cream: "#FBF9F4", surface: "#FFFFFF", sunken: "#F1EDE4",
  ink: "#3B4147", muted: "#6B7178", caption: "#71736B", border: "#E4DFD3",
  skySoft: "#7E9AAB", skyDeep: "#4C6577", sageSoft: "#8B9B7A", sageDeep: "#5E6F4B",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// a small flock of simple flying-bird silhouettes (double-arc gull shape)
function flock(cx, cy, s, color, op) {
  const gull = (x, y, k) =>
    `<path d="M ${x - k} ${y} Q ${x - k / 2} ${y - k * 0.7} ${x} ${y} Q ${x + k / 2} ${y - k * 0.7} ${x + k} ${y}" fill="none" stroke="${color}" stroke-width="${k * 0.12}" stroke-linecap="round" opacity="${op}"/>`;
  return [
    gull(cx, cy, s),
    gull(cx - s * 1.8, cy + s * 0.5, s * 0.7),
    gull(cx + s * 1.7, cy + s * 0.4, s * 0.8),
    gull(cx - s * 0.6, cy - s * 0.9, s * 0.55),
    gull(cx + s * 0.9, cy - s * 1.0, s * 0.5),
  ].join("");
}

function svg({ w, h, title, sub, kicker, c1, c2, accent }) {
  const short = Math.min(w, h);
  const titleSize = Math.round(short * 0.075);
  const subSize = Math.round(short * 0.032);
  const kickSize = Math.round(short * 0.028);
  const pad = Math.round(short * 0.03);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w * 0.5}" cy="${h * 0.5}" r="${short * 0.55}" fill="${C.cream}" opacity="0.10"/>
  ${flock(w * 0.5, h * 0.36, short * 0.11, accent, 0.5)}
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" fill="none" stroke="${C.surface}" stroke-opacity="0.55" stroke-width="${Math.max(2, short * 0.004)}"/>
  <text x="50%" y="${h * 0.55}" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-weight="700" font-size="${titleSize}" fill="${C.ink}">${esc(title)}</text>
  <text x="50%" y="${h * 0.55 + titleSize * 0.95}" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="${subSize}" fill="${C.caption}">${esc(sub)}</text>
  ${kicker ? `<text x="50%" y="${h * 0.55 - titleSize * 0.9}" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="${kickSize}" letter-spacing="2" fill="${accent}">${esc(kicker.toUpperCase())}</text>` : ""}
  <text x="50%" y="${h - pad * 1.6}" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="${kickSize}" fill="${C.muted}" opacity="0.85">${w} × ${h} · placeholder</text>
</svg>`;
}

async function render(rel, spec, kind = "jpeg") {
  const out = join(OUT, rel);
  mkdirSync(dirname(out), { recursive: true });
  const buf = Buffer.from(svg(spec));
  // resize to the exact target px (librsvg renders SVG user-units at 72/96 dpi,
  // which otherwise scales the output — pin it to the intended dimensions).
  let img = sharp(buf, { density: 96 }).resize(spec.w, spec.h);
  img = kind === "png" ? img.png() : img.jpeg({ quality: 85, chromaSubsampling: "4:4:4" });
  await img.toFile(out);
  return out;
}

// tone pairs to vary portfolio images
const tones = [
  [C.skySoft, C.cream], [C.sageSoft, C.cream], [C.skyDeep, C.skySoft],
  [C.sageDeep, C.sageSoft], [C.skySoft, C.sageSoft], [C.cream, C.skySoft],
];
const accents = [C.skyDeep, C.sageDeep];

// 12 portfolio birds — real VN species, varied aspect ratios
const birds = [
  { file: "bird-01.jpg", w: 2400, h: 1600, en: "Common Kingfisher", vi: "Bói cá lam", loc: "Tràm Chim", coll: "Wetlands" },
  { file: "bird-02.jpg", w: 1600, h: 2000, en: "Grey Heron", vi: "Diệc xám", loc: "Xuân Thủy", coll: "Wetlands" },
  { file: "bird-03.jpg", w: 2400, h: 1350, en: "Sarus Crane", vi: "Sếu đầu đỏ", loc: "Tràm Chim", coll: "Wetlands" },
  { file: "bird-04.jpg", w: 2000, h: 2000, en: "Painted Stork", vi: "Cò nhạn", loc: "U Minh Thượng", coll: "Wetlands" },
  { file: "bird-05.jpg", w: 1600, h: 2000, en: "Oriental Dwarf Kingfisher", vi: "Bồng chanh đỏ", loc: "Cát Tiên", coll: "Forest" },
  { file: "bird-06.jpg", w: 2400, h: 1600, en: "Red-whiskered Bulbul", vi: "Chào mào", loc: "Cát Tiên", coll: "Forest" },
  { file: "bird-07.jpg", w: 2000, h: 2000, en: "Black-crowned Night Heron", vi: "Vạc", loc: "Xuân Thủy", coll: "Wetlands" },
  { file: "bird-08.jpg", w: 2400, h: 1600, en: "Little Egret", vi: "Cò trắng", loc: "Đồng Tháp", coll: "Wetlands" },
  { file: "bird-09.jpg", w: 1600, h: 2000, en: "Purple Heron", vi: "Diệc lửa", loc: "Tràm Chim", coll: "Wetlands" },
  { file: "bird-10.jpg", w: 2400, h: 1600, en: "Oriental Magpie-Robin", vi: "Chích chòe than", loc: "Cát Tiên", coll: "Forest" },
  { file: "bird-11.jpg", w: 2000, h: 2000, en: "White-throated Kingfisher", vi: "Sả đầu nâu", loc: "Đồng Tháp", coll: "Kingfishers" },
  { file: "bird-12.jpg", w: 2400, h: 1350, en: "White-breasted Waterhen", vi: "Cuốc ngực trắng", loc: "Gò Công", coll: "Wetlands" },
];

const run = async () => {
  const made = [];
  made.push(await render("hero/hero-01.jpg", {
    w: 2560, h: 1440, kicker: "SamThuongShop", title: "Ảnh bìa", sub: "Hero banner",
    c1: C.skySoft, c2: C.cream, accent: C.skyDeep,
  }));
  made.push(await render("about/portrait.jpg", {
    w: 1200, h: 1500, kicker: "Giới thiệu", title: "Sâm Thương", sub: "Chân dung / Portrait",
    c1: C.sageSoft, c2: C.cream, accent: C.sageDeep,
  }));
  const meta = birds.map((b) => ({
    file: `portfolio/${b.file}`, species_en: b.en, species_vi: b.vi, location: b.loc,
    date: "2026", orientation: b.w > b.h ? "landscape" : b.w < b.h ? "portrait" : "square", collection: b.coll,
  }));
  for (let i = 0; i < birds.length; i++) {
    const b = birds[i]; const [c1, c2] = tones[i % tones.length]; const accent = accents[i % accents.length];
    made.push(await render(`portfolio/${b.file}`, { w: b.w, h: b.h, kicker: b.coll, title: b.vi, sub: b.en + " · " + b.loc, c1, c2, accent }));
  }
  made.push(await render("social/og.jpg", { w: 1200, h: 630, kicker: "SamThuongShop", title: "Nhiếp ảnh chim", sub: "Bird photography · Việt Nam", c1: C.skyDeep, c2: C.sageDeep, accent: C.cream }));
  made.push(await render("favicon.png", { w: 512, h: 512, kicker: "", title: "ST", sub: "", c1: C.skyDeep, c2: C.sageDeep, accent: C.cream }, "png"));

  writeFileSync(join(OUT, "portfolio.json"), JSON.stringify(meta, null, 2) + "\n");
  console.log("generated " + made.length + " images + portfolio.json");
};
run().catch((e) => { console.error(e); process.exit(1); });
