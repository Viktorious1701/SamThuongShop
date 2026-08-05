import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Styleguide — SamThuongShop",
  description: "Sky & Sedge design-token reference.",
};

const VIETNAMESE_SAMPLE =
  "Sâm Thương · Bói cá lam · Diệc xám · Đồng bằng sông Cửu Long · ẦẨẪẬ ầẩẫậ ỀỄỆ ệ ỮỰ ữự Đđ";

type ColorToken = {
  name: string;
  cssVar: string;
  hex: string;
  swatchClass: string;
  role: "surface" | "text";
  aaNote: string;
};

const COLOR_TOKENS: ColorToken[] = [
  {
    name: "bg-page",
    cssVar: "--color-bg-page",
    hex: "#FBF9F4",
    swatchClass: "bg-bg-page",
    role: "surface",
    aaNote: "Page canvas only — never used for text or over imagery.",
  },
  {
    name: "surface",
    cssVar: "--color-surface",
    hex: "#FFFFFF",
    swatchClass: "bg-surface",
    role: "surface",
    aaNote: "Cards, inputs, nav. Never used as the page background.",
  },
  {
    name: "surface-sunken",
    cssVar: "--color-surface-sunken",
    hex: "#F1EDE4",
    swatchClass: "bg-surface-sunken",
    role: "surface",
    aaNote:
      "Recessed footer / status-pill / band tone. ink-muted fails AA here (4.22:1) — use ink for text on this surface.",
  },
  {
    name: "border",
    cssVar: "--color-border",
    hex: "#E4DFD3",
    swatchClass: "bg-border",
    role: "surface",
    aaNote: "Hairline only — replaces shadow as the depth mechanism. Never fill or text.",
  },
  {
    name: "ink",
    cssVar: "--color-ink",
    hex: "#3B4147",
    swatchClass: "bg-ink",
    role: "text",
    aaNote: "AA on cream & white. Primary text, headings, and VND prices.",
  },
  {
    name: "ink-muted",
    cssVar: "--color-ink-muted",
    hex: "#6B7178",
    swatchClass: "bg-ink-muted",
    role: "text",
    aaNote: "AA on cream. Secondary/meta text; not for long body passages.",
  },
  {
    name: "caption-deep",
    cssVar: "--color-caption-deep",
    hex: "#71736B",
    swatchClass: "bg-caption-deep",
    role: "text",
    aaNote: "AA on cream. Reserved for photo captions / image meta only.",
  },
  {
    name: "sky-soft",
    cssVar: "--color-sky-soft",
    hex: "#7E9AAB",
    swatchClass: "bg-sky-soft",
    role: "surface",
    aaNote: "Decorative/large-area only — fails AA as text. Never text, never a small control.",
  },
  {
    name: "sky-deep",
    cssVar: "--color-sky-deep",
    hex: "#4C6577",
    swatchClass: "bg-sky-deep",
    role: "text",
    aaNote: "AA on cream & white. Primary interactive: links, primary buttons, focus rings.",
  },
  {
    name: "sage-soft",
    cssVar: "--color-sage-soft",
    hex: "#8B9B7A",
    swatchClass: "bg-sage-soft",
    role: "surface",
    aaNote: "Decorative/large-area only (tag chips backed by deep text) — fails AA as small text.",
  },
  {
    name: "sage-deep",
    cssVar: "--color-sage-deep",
    hex: "#5E6F4B",
    swatchClass: "bg-sage-deep",
    role: "text",
    aaNote: "AA on cream & white. Secondary interactive: secondary buttons/links.",
  },
  {
    name: "success",
    cssVar: "--color-success",
    hex: "#4F7A52",
    swatchClass: "bg-success",
    role: "text",
    aaNote:
      "AA on cream/white as short status text or the status dot; fails AA on surface-sunken (4.24:1) — pill label stays ink there.",
  },
  {
    name: "pending",
    cssVar: "--color-pending",
    hex: "#96681F",
    swatchClass: "bg-pending",
    role: "text",
    aaNote:
      "AA on cream/white as short status text or the status dot; fails AA on surface-sunken (4.18:1) — pill label stays ink there.",
  },
  {
    name: "error",
    cssVar: "--color-error",
    hex: "#A85248",
    swatchClass: "bg-error",
    role: "text",
    aaNote: "AA on cream & white. Failed/cancelled states and validation errors. Never decorative.",
  },
  {
    name: "info",
    cssVar: "--color-info",
    hex: "#4C6577",
    swatchClass: "bg-info",
    role: "text",
    aaNote: "AA on cream & white. Same value as sky-deep so system messaging reads as primary voice.",
  },
];

type TypeRampRow = {
  role: string;
  className: string;
  spec: string;
  sample: string;
};

const TYPE_RAMP: TypeRampRow[] = [
  {
    role: "display",
    className: "text-display",
    spec: "Lora 700 · 56px / 1.08 / -0.01em",
    sample: "Sâm Thương",
  },
  {
    role: "h1",
    className: "text-h1",
    spec: "Lora 700 · 40px / 1.15 / -0.005em",
    sample: "Bói cá lam",
  },
  {
    role: "h2",
    className: "text-h2",
    spec: "Lora 600 · 30px / 1.2",
    sample: "Diệc xám",
  },
  {
    role: "h3",
    className: "text-h3",
    spec: "Lora 600 · 22px / 1.3",
    sample: "Đồng bằng sông Cửu Long",
  },
  {
    role: "body-lg",
    className: "text-body-lg",
    spec: "Inter 400 · 18px / 1.65",
    sample: "Bản in A3 — ảnh chim hoang dã Việt Nam, 980.000₫.",
  },
  {
    role: "body",
    className: "text-body",
    spec: "Inter 400 · 16px / 1.6",
    sample: "Ảnh gốc, in chất lượng cao trên giấy mỹ thuật.",
  },
  {
    role: "caption",
    className: "text-caption",
    spec: "Inter 500 · 13px / 1.45 / +0.02em",
    sample: "Diệc xám — Vườn quốc gia Xuân Thủy",
  },
];

const SPACING_SCALE: { token: string; px: string }[] = [
  { token: "spacing-1", px: "4px" },
  { token: "spacing-2", px: "8px" },
  { token: "spacing-3", px: "12px" },
  { token: "spacing-4", px: "16px" },
  { token: "spacing-6", px: "24px" },
  { token: "spacing-8", px: "32px" },
  { token: "spacing-12", px: "48px" },
  { token: "spacing-16", px: "64px" },
  { token: "spacing-24", px: "96px" },
];

const NAMED_SPACING: { token: string; px: string }[] = [
  { token: "spacing-gutter", px: "24px" },
  { token: "spacing-margin-mobile", px: "20px" },
  { token: "spacing-margin-desktop", px: "32px" },
  { token: "spacing-max-content", px: "1200px" },
];

const RADIUS_SCALE: { token: string; px: string }[] = [
  { token: "radius-sm", px: "2px" },
  { token: "radius-md (default)", px: "6px" },
  { token: "radius-lg", px: "12px" },
  { token: "radius-full", px: "9999px" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-h2 text-ink border-b border-border pb-3">{children}</h2>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-max-content px-margin-mobile py-16 md:px-margin-desktop">
      <header className="mb-16 space-y-4">
        <p className="text-caption text-ink-muted uppercase">
          Sky &amp; Sedge design system
        </p>
        <h1 className="text-display text-ink">Styleguide</h1>
        <p className="text-body-lg text-ink-muted max-w-2xl">
          Every color, type, spacing, radius, and shadow token defined in{" "}
          <code className="text-caption bg-surface-sunken rounded-sm px-1 py-0.5">
            app/globals.css
          </code>
          , rendered using the tokens themselves.
        </p>
      </header>

      {/* Vietnamese diacritic sample */}
      <section className="mb-16 space-y-4">
        <SectionHeading>Vietnamese diacritic sample</SectionHeading>
        <div className="rounded-md border border-border bg-surface p-gutter shadow-overlay">
          <p className="text-h3 text-ink">{VIETNAMESE_SAMPLE}</p>
        </div>
      </section>

      {/* Colors */}
      <section className="mb-16 space-y-6">
        <SectionHeading>Colors (15 tokens)</SectionHeading>
        <p className="text-body text-ink-muted">
          <span className="text-ink font-medium">Deep / text tokens</span> pass
          WCAG AA (≥4.5:1) on cream <code>#FBF9F4</code> and white. The{" "}
          <span className="italic">soft</span> variants are decorative/large-area
          only — never text.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_TOKENS.map((token) => (
            <div
              key={token.name}
              className="rounded-md border border-border bg-surface overflow-hidden"
            >
              <div
                className={`h-20 w-full border-b border-border ${token.swatchClass}`}
              />
              <div className="p-4 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-body text-ink font-medium">
                    {token.name}
                  </span>
                  <span className="text-caption text-ink-muted">
                    {token.hex}
                  </span>
                </div>
                <p className="text-caption text-ink-muted">{token.cssVar}</p>
                <p
                  className={`text-caption pt-1 ${
                    token.role === "text" ? "text-success" : "text-pending"
                  }`}
                >
                  {token.aaNote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Type ramp */}
      <section className="mb-16 space-y-6">
        <SectionHeading>Type ramp (7 roles)</SectionHeading>
        <p className="text-body text-ink-muted">
          Headings (display / h1 / h2 / h3) are always Lora; body / caption are
          always Inter. Headings wrap — Vietnamese runs longer and is never
          truncated.
        </p>
        <div className="divide-y divide-border rounded-md border border-border bg-surface">
          {TYPE_RAMP.map((row) => (
            <div key={row.role} className="p-gutter space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-caption text-ink-muted">
                  .{row.className}
                </span>
                <span className="text-caption text-ink-muted">{row.spec}</span>
              </div>
              <p className={`${row.className} text-ink`}>{row.sample}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section className="mb-16 space-y-6">
        <SectionHeading>Spacing scale</SectionHeading>
        <p className="text-body text-ink-muted">
          4px base scale (Tailwind default <code>--spacing: 0.25rem</code>{" "}
          multiplier) plus named semantic tokens.
        </p>
        <div className="space-y-3">
          {[...SPACING_SCALE, ...NAMED_SPACING].map((s) => (
            <div key={s.token} className="flex items-center gap-4">
              <span className="text-caption text-ink-muted w-48 shrink-0">
                {s.token}
              </span>
              <div
                className="bg-sky-soft h-3 rounded-sm"
                style={{ width: s.px }}
              />
              <span className="text-caption text-ink-muted">{s.px}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Radius */}
      <section className="mb-16 space-y-6">
        <SectionHeading>Radius scale</SectionHeading>
        <div className="flex flex-wrap gap-6">
          {RADIUS_SCALE.map((r) => (
            <div key={r.token} className="text-center space-y-2">
              <div
                className="h-20 w-20 border border-border bg-surface-sunken"
                style={{ borderRadius: r.px === "9999px" ? "9999px" : r.px }}
              />
              <p className="text-caption text-ink-muted">{r.token}</p>
              <p className="text-caption text-ink-muted">{r.px}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shadow */}
      <section className="space-y-6">
        <SectionHeading>Elevation</SectionHeading>
        <p className="text-body text-ink-muted">
          The only shadow in the system — reserved for transient overlays.
          Resting elements use whitespace + a hairline <code>border</code>,
          never a shadow.
        </p>
        <div className="flex items-center gap-8">
          <div className="rounded-md bg-surface p-8 shadow-overlay">
            <p className="text-caption text-ink-muted">shadow-overlay</p>
          </div>
          <p className="text-caption text-ink-muted">
            0 6px 24px -8px rgba(59,65,71,0.18)
          </p>
        </div>
      </section>
    </main>
  );
}
