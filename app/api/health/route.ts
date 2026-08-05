// app/api/health/route.ts
//
// Route Handler (presentation/integration boundary, AD-1). Delegates the
// actual database check to lib/server — this file never imports Prisma or
// queries the database directly (AD-2).

import { checkDatabaseConnection } from "@/lib/server/health";

export async function GET() {
  const isDbReachable = await checkDatabaseConnection();

  if (!isDbReachable) {
    return Response.json({ ok: false }, { status: 503 });
  }

  return Response.json({ ok: true });
}
