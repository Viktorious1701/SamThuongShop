import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLoginForm } from "./login-form";
import { adminSignOutAction } from "./actions";

// app/admin/login/page.tsx
//
// Story 1.5, Task 4 (AC-2, AC-3, AC-4) — PUBLIC operator sign-in. Lives
// OUTSIDE the guarded app/admin/(app) route group so it's always
// reachable: requireOperator() sends non-operators here, and this page
// must never send them anywhere that could bounce back (AC-4, no
// redirect loop).
//
// Three states on load:
//  - Already signed in as the operator -> nothing to do here, go to /admin.
//  - Signed in as something else (e.g. a customer session) -> that's the
//    "denied" case from AC-4: show the message plus a sign-out control,
//    no login form (they'd fail the role check again anyway).
//  - Signed out -> plain login form.
export async function generateMetadata(): Promise<Metadata> {
  return { title: "Operator sign in — SamThuongShop Admin" };
}

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user?.role === "operator") {
    redirect("/admin");
  }

  const nonOperatorSession = session?.user ? session.user : null;

  return (
    <div className="mx-auto max-w-md px-margin-mobile py-16 md:px-margin-desktop md:py-24">
      <h1 className="text-h1 text-ink">Operator sign in</h1>

      <div className="mt-8 rounded-md border border-border bg-surface p-gutter">
        {nonOperatorSession ? (
          <div className="space-y-4">
            <p className="text-caption text-error" role="alert">
              This isn&apos;t an operator account. Signed in as{" "}
              {nonOperatorSession.email}, which doesn&apos;t have access to
              the admin area.
            </p>
            <form action={adminSignOutAction}>
              <button
                type="submit"
                className="w-full rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
              >
                Sign out and try a different account
              </button>
            </form>
          </div>
        ) : (
          <AdminLoginForm />
        )}
      </div>
    </div>
  );
}
