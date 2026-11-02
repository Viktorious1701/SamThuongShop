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
//   - Right credentials, but the account isn't an operator -> a clear "not
//     an operator account" error, and NO session is ever created (the role
//     is checked before signIn), so the visitor is never left signed in with
//     a customer session on the login page (the redirect loop AC-4 calls
//     out).
//   - Right credentials, operator account -> signIn, redirect to /admin.

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { authenticateUser } from "@/lib/server/user";
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

  // Check credentials + role BEFORE creating a session. Reading the session
  // back with auth() right after signIn() doesn't work: auth() sees only the
  // cookies the browser sent with this request, not the one signIn() just
  // set — so the first attempt was always rejected (and a non-operator was
  // left holding a session cookie the same-request signOut couldn't clear).
  const user = await authenticateUser(parsed.data.email, parsed.data.password);
  if (!user) {
    return { status: "error", formError: "Incorrect email or password." };
  }
  if (user.role !== "operator") {
    return { status: "error", formError: "This isn't an operator account." };
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

  redirect("/admin");
}

/** Used by the login page when a non-operator session already exists
 * (i.e. the visitor was bounced here by requireOperator()) — signs them
 * out so the plain login form reappears instead of looping. */
export async function adminSignOutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
