// lib/server/health.ts
//
// Database connectivity check used by the /api/health Route Handler.
// Lives in lib/server so the route handler never talks to Prisma directly
// (AD-1, AD-2).

import { prisma } from "@/lib/server/db";

/**
 * Runs a trivial `SELECT 1` against the database to confirm connectivity.
 * Returns true if the database answered, false otherwise. Never throws.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
