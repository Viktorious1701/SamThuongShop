import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Lora, Inter } from "next/font/google";
import "../globals.css";

// /admin is deliberately outside the /[locale] tree (Story 1.5 — decided
// with the user: the admin shell is English-only and un-prefixed, for the
// single non-technical Operator). Like /styleguide, it needs its own root
// layout — Next.js's "multiple root layouts" pattern (sibling subtrees
// under app/, neither nested inside the other, each supplying its own
// <html>/<body>) — since there is no shared app/layout.tsx.

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
  title: "SamThuongShop Admin",
  description: "SamThuongShop operator admin area",
};

export default function AdminRootLayout({
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
