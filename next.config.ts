import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Allow next/image to load display images from the public R2 bucket
// (Story 2.1). Host is derived from R2_PUBLIC_BASE_URL so it tracks whatever
// r2.dev subdomain / custom domain is configured.
function r2ImagePatterns(): NextConfig["images"] {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return undefined;
  try {
    const { hostname } = new URL(base);
    return { remotePatterns: [{ protocol: "https", hostname }] };
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  images: r2ImagePatterns(),

  // Portfolio-only revamp (R2): the portfolio moved to /work, and Contact is
  // now a section of About. Old links (shared before the revamp) keep working.
  async redirects() {
    return [
      {
        source: "/:locale(vi|en)/portfolio/:path*",
        destination: "/:locale/work/:path*",
        permanent: true,
      },
      {
        source: "/:locale(vi|en)/contact",
        destination: "/:locale/about#contact",
        permanent: true,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
