"use server";

// lib/actions/auth-actions.ts
//
// Shared logout Server Action — used by both the nav's Logout link and the
// /account page's logout button, so there's one place that calls signOut.

import { getLocale } from "next-intl/server";
import { signOut } from "@/auth";

export async function logoutAction(): Promise<void> {
  const locale = await getLocale();
  await signOut({ redirectTo: `/${locale}` });
}
