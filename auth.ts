// auth.ts
//
// Auth.js v5 (next-auth@beta) root config (AD-9 — single auth system,
// operator + customer principals; operator gating arrives in Story 1.5).
// Credentials provider only — no OAuth in this story. `authorize()`
// delegates to lib/server/user.ts (AD-2 — only lib/server imports Prisma
// or touches password hashes); this file never queries the database
// directly.
//
// Session strategy is JWT: the Credentials provider requires it (Auth.js
// does not support database sessions for Credentials-based sign-in).

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateUser } from "@/lib/server/user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : null;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : null;

        if (!email || !password) {
          return null;
        }

        const user = await authenticateUser(email, password);

        if (!user) {
          return null;
        }

        // Shape returned here becomes `user` in the `jwt` callback below.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role ?? "customer";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },
});
