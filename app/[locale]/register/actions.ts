"use server";

// app/[locale]/register/actions.ts
//
// Registration Server Action (Story 1.4, Task 3). Zod-validates the input,
// then delegates the actual hash + insert to lib/server/user.ts (AD-2 —
// only lib/server touches Prisma or password hashes). On success, signs the
// new user in immediately (JWT session) and redirects to /account — the
// Credentials provider itself never auto-creates users, so registration
// and authentication are deliberately two steps chained here.
//
// Error/field-error strings returned are translation *keys*, resolved by
// the client form against messages/{locale}.json's "Auth" namespace.

import { getLocale } from "next-intl/server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { createUser } from "@/lib/server/user";
import { registerSchema } from "@/lib/validation/auth-schemas";

export type RegisterState = {
  status: "idle" | "error";
  fieldErrors?: Partial<Record<"email" | "password" | "name", string>>;
  formError?: string;
};

// NOTE: a "use server" file may only export async functions — the initial
// useActionState value is a plain object, so it lives in the client form
// component instead of here.

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? ""),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: collectFieldErrors(parsed.error) };
  }

  const result = await createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name || null,
  });

  if (!result.ok) {
    return {
      status: "error",
      fieldErrors: { email: "emailTaken" },
    };
  }

  const locale = await getLocale();

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: `/${locale}/account`,
    });
  } catch (error) {
    // `signIn` throws a special redirect signal on success — only an
    // AuthError here means sign-in itself actually failed. Anything else
    // (the redirect) must keep propagating.
    if (error instanceof AuthError) {
      return { status: "error", formError: "genericError" };
    }
    throw error;
  }

  return { status: "idle" };
}

function collectFieldErrors(
  error: import("zod").ZodError,
): RegisterState["fieldErrors"] {
  const fieldErrors: RegisterState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (
      (key === "email" || key === "password" || key === "name") &&
      !fieldErrors[key]
    ) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}
