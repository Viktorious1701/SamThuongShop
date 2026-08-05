// next-auth.d.ts
//
// Module augmentation: adds `id` + `role` to the session user, and
// `userId` + `role` to the JWT, so `auth()`'s callbacks in auth.ts and
// every consumer (site-nav.tsx, account/page.tsx) get typed access
// without casts.

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
  }
}
