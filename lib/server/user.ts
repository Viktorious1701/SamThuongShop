// lib/server/user.ts
//
// All User-table Prisma access + password hashing/verification lives here
// (AD-2 — only lib/server imports Prisma). auth.ts's Credentials
// authorize() and the register Server Action both delegate to this module;
// neither one talks to Prisma or bcryptjs directly.

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/server/db";

const BCRYPT_SALT_ROUNDS = 12;

export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

function toSafeUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
}): SafeUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/**
 * Verifies email + password against the stored bcrypt hash. Used by
 * Auth.js's Credentials `authorize()`. Returns the safe user record (never
 * the hash) on success, or `null` on any failure (unknown email, wrong
 * password) — callers must not distinguish the two to the end user.
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return toSafeUser(user);
}

export type CreateUserResult =
  | { ok: true; user: SafeUser }
  | { ok: false; error: "duplicate-email" };

/**
 * Hashes the password and creates a new User row. Registration is a
 * separate step from authentication — the Credentials provider never
 * auto-creates users (Dev Notes: Auth.js Credentials gotcha).
 */
export async function createUser(input: {
  email: string;
  password: string;
  name?: string | null;
}): Promise<CreateUserResult> {
  const email = input.email.toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: input.name?.trim() ? input.name.trim() : null,
      },
    });

    return { ok: true, user: toSafeUser(user) };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: "duplicate-email" };
    }

    throw error;
  }
}

/** Narrow check for Prisma's unique-constraint violation (P2002) without
 * importing Prisma's error classes into every caller. */
function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
