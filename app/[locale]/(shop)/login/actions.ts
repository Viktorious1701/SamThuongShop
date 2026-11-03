"use server";

// app/[locale]/login/actions.ts
//
// Login Server Action (Story 1.4, Task 2/4). Zod-validates the input, then
// calls Auth.js's `signIn` with the Credentials provider. `authorize()` in
// auth.ts delegates the actual lookup + bcrypt.compare to
// lib/server/user.ts — this file never touches Prisma or password hashes
// directly (AD-2).

import { getLocale } from "next-intl/server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validation/auth-schemas";

export type LoginState = {
  status: "idle" | "error";
  fieldErrors?: Partial<Record<"email" | "password", string>>;
  formError?: string;
};

// NOTE: a "use server" file may only export async functions — the initial
// useActionState value is a plain object, so it lives in the client form
// component instead of here.

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === "email" || key === "password") && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  const locale = await getLocale();

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: `/${locale}/account`,
    });
  } catch (error) {
    // Wrong credentials surface as a CredentialsSignin AuthError — give a
    // single generic message so we never reveal whether the email exists
    // (AC-2). The redirect Auth.js throws on *success* must keep
    // propagating, so only AuthError is caught here.
    if (error instanceof AuthError) {
      return { status: "error", formError: "invalidCredentials" };
    }
    throw error;
  }

  return { status: "idle" };
}
