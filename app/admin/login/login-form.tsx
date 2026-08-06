"use client";

// app/admin/login/login-form.tsx
//
// Client form, mirroring the customer login form's useActionState pattern
// (Story 1.4) but English-only and calling adminLoginAction instead —
// /admin is outside next-intl entirely (Dev Notes), so no useTranslations
// here, just literal English copy.

import { useActionState } from "react";
import { TextField } from "@/components/form/text-field";
import { SubmitButton } from "@/components/form/submit-button";
import { adminLoginAction, type AdminLoginState } from "./actions";

const initialState: AdminLoginState = { status: "idle" };

export function AdminLoginForm() {
  const [state, formAction] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <TextField
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        requiredLabel="Required"
        label="Email"
        error={state.fieldErrors?.email}
      />

      <TextField
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        requiredLabel="Required"
        label="Password"
        error={state.fieldErrors?.password}
      />

      {state.formError ? (
        <p className="text-caption text-error" role="alert">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}
