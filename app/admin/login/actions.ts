"use server";

// app/admin/login/actions.ts
//
// Story 1.5, Task 4 (AC-3, AC-4) — operator sign-in Server Action. Same
// Credentials provider as the customer login (Story 1.4) — auth.ts is not
// forked — but this action additionally enforces the operator role right
// after a successful credential check:
//
//   - Wrong email/password  -> signIn throws a CredentialsSignin AuthError
//     (same as the customer flow) -> generic "invalid credentials" error.
//   - Right credentials, but the account isn't an operator -> the session
//     Auth.js just created is immediately torn down (signOut) and a clear
//     "not an operator account" error is shown. The visitor is NEVER left
//     signed in with a customer session on the login page (that would be
//     what triggers requireOperator() to bounce them right back here on
//     their next request — the redirect loop AC-4 calls out).
//   - Right credentials, operator account -> redirect to /admin.
//
// `signIn(..., { redirect: false })` returns instead of throwing on
// success, which is what lets this action inspect the role before
// deciding whether to redirect or roll the session back.

import { z } from "zod";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";

const adminLoginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginState = {
  status: "idle" | "error";
  fieldErrors?: Partial<Record<"email" | "password", string>>;
  formError?: string;
};

export async function adminLoginAction(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = adminLoginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: AdminLoginState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === "email" || key === "password") && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", formError: "Incorrect email or password." };
    }
    throw error;
  }

  const session = await auth();

  if (session?.user?.role !== "operator") {
    // Successful login, wrong role — never leave a non-operator session
    // sitting around for requireOperator() to bounce again.
    await signOut({ redirect: false });
    return {
      status: "error",
      formError: "This isn't an operator account.",
    };
  }

  redirect("/admin");
}

/** Used by the login page when a non-operator session already exists
 * (i.e. the visitor was bounced here by requireOperator()) — signs them
 * out so the plain login form reappears instead of looping. */
export async function adminSignOutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
