// proxy.ts
//
// next-intl locale routing, using Next.js 16's `proxy` file convention (the
// renamed successor to `middleware.ts` — see
// https://nextjs.org/docs/messages/middleware-to-proxy). `middleware.ts`
// still works in 16.3 but is deprecated and logs a build warning; `proxy.ts`
// is the current, non-deprecated convention, so that's what this project
// uses to keep `npm run build` warning-free (Story 1.3, AC-6).
//
// Matcher excludes /api/*, /_next/*, /_vercel/*, static files (anything with
// a dot, e.g. favicon.ico), and /styleguide — those must keep working
// un-prefixed (Story 1.1's /api/health, Story 1.2's /styleguide).

import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|styleguide|.*\\..*).*)"],
};
