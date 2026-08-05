// lib/server/db.ts
//
// Shared Prisma client singleton (AD-1, AD-2 — only lib/server imports Prisma).
// Guards against creating a new client (and a new connection pool) on every
// hot-reload in dev by stashing the instance on `globalThis`.

import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Supabase Postgres via the transaction pooler (DATABASE_URL, port 6543).
  const connectionString = process.env.DATABASE_URL;

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
