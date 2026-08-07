// prisma/seed.ts
//
// Story 1.5, Task 1 (AC-1) — seeds the Operator account. There is no
// self-serve operator signup (AD-9): this script is the only way an
// operator user gets created. Reads OPERATOR_EMAIL / OPERATOR_PASSWORD from
// env, falling back to fixed dev defaults so a bare local checkout still
// gets a working operator login.
//
// Idempotent: `upsertUserWithRole` (lib/server/user.ts) upserts by email,
// so re-running this script just re-hashes the current env password over
// the existing row instead of failing or duplicating it. All Prisma access
// and password hashing stays inside lib/server (AD-2) — this script only
// orchestrates.

import "dotenv/config";
import { upsertUserWithRole } from "@/lib/server/user";
import { isR2Configured, seedDemoCatalog } from "@/lib/server/seed-catalog";

const DEV_OPERATOR_EMAIL = "admin@samthuong.shop";
const DEV_OPERATOR_PASSWORD = "Operator123!";

async function main() {
  const email = process.env["OPERATOR_EMAIL"] || DEV_OPERATOR_EMAIL;
  const password = process.env["OPERATOR_PASSWORD"] || DEV_OPERATOR_PASSWORD;

  const operator = await upsertUserWithRole({
    email,
    password,
    role: "operator",
    name: "Operator",
  });

  console.log(`Seeded operator user: ${operator.email} (role=${operator.role})`);

  // Story 2.1 — demo catalog. Needs R2 to store images/originals; skip
  // gracefully when it isn't configured yet so the operator seed still runs.
  if (isR2Configured()) {
    await seedDemoCatalog();
  } else {
    console.log("R2 not configured — skipping demo catalog seed.");
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { prisma } = await import("@/lib/server/db");
    await prisma.$disconnect();
  });
