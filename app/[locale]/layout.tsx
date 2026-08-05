import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Lora, Inter } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import "../globals.css";

// This layout owns the single <html> element for every locale-prefixed
// route (Story 1.3). `app/styleguide/layout.tsx` is the *other* root layout
// in this app — Next.js's "multiple root layouts" pattern
// (https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
// lets two sibling subtrees each own their own <html>/<body> as long as
// there is no shared layout.tsx directly in app/. That's what keeps
// /styleguide and /api/health working un-prefixed while this tree stays
// fully bilingual, without ever nesting two <html> tags for the same page.

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg-page text-ink font-inter">
        <NextIntlClientProvider>
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
