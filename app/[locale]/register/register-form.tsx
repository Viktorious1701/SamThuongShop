"use client";

// app/[locale]/register/register-form.tsx
//
// Client form so we can drive it with useActionState (inline validation
// errors, pending state) — the actual work happens server-side in
// actions.ts. Field/form errors are translation keys resolved here via
// useTranslations("Auth") so the message renders in the active locale.

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TextField } from "@/components/form/text-field";
import { SubmitButton } from "@/components/form/submit-button";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = { status: "idle" };

export function RegisterForm() {
  const t = useTranslations("Auth");
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <TextField
        id="name"
        name="name"
        type="text"
        autoComplete="name"
        label={t("nameLabel")}
        error={state.fieldErrors?.name ? t(state.fieldErrors.name) : undefined}
      />

      <TextField
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        requiredLabel={t("required")}
        label={t("emailLabel")}
        error={
          state.fieldErrors?.email ? t(state.fieldErrors.email) : undefined
        }
      />

      <TextField
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        requiredLabel={t("required")}
        label={t("passwordLabel")}
        error={
          state.fieldErrors?.password
            ? t(state.fieldErrors.password)
            : undefined
        }
      />

      {state.formError ? (
        <p className="text-caption text-error" role="alert">
          {t(state.formError)}
        </p>
      ) : null}

      <SubmitButton>{t("registerCta")}</SubmitButton>

      <p className="text-caption text-ink-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-sky-deep underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}
