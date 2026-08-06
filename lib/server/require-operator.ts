// lib/server/require-operator.ts
//
// Story 1.5, Task 3 (AC-5) — the single shared server guard for the
// operator role. `auth.ts` already puts `role` on the session (Story 1.4);
// this is the ONE place that checks it's "operator" before letting a
// request through to admin routes/actions. `app/admin/(app)/layout.tsx`
// calls this now; any future admin Server Action must call it too instead
// of re-checking `session.user.role` inline (AD-9).
//
// Non-operators (including signed-out visitors and signed-in customers)
// are redirected to /admin/login, which lives OUTSIDE the guarded `(app)`
// route group — so it's always reachable and there's no redirect loop
// (AC-4). The login page itself detects a signed-in-but-non-operator
// session and shows an error instead of calling this guard again.

import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireOperator() {
  const session = await auth();

  if (session?.user?.role !== "operator") {
    redirect("/admin/login");
  }

  return session;
}
