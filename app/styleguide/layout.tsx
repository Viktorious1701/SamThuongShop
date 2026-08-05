import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Lora, Inter } from "next/font/google";
import "../globals.css";

// /styleguide is deliberately outside the /[locale] tree (Story 1.3 —
// it must keep working un-prefixed and is excluded from the next-intl
// middleware). Since the previous single app/layout.tsx has been replaced
// by app/[locale]/layout.tsx (which owns <html lang={locale}>), /styleguide
// needs its own root layout to still get exactly one <html>/<body> with the
// Lora/Inter font variables + globals.css preserved from Story 1.2. This is
// Next.js's documented "multiple root layouts" pattern — two sibling
// subtrees under app/, neither nested inside the other, each supplying its
// own root layout.

const lora = Lora({
  variable: "--lora-font",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--inter-font",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SamThuongShop",
  description: "SamThuongShop — scaffold placeholder",
};

export default function StyleguideRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg-page text-ink font-inter">
        {children}
      </body>
    </html>
  );
}
