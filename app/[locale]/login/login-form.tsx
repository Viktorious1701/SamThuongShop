"use client";

// app/[locale]/login/login-form.tsx
//
// Client form for useActionState-driven inline validation/pending state;
// the sign-in itself happens server-side in actions.ts.

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TextField } from "@/components/form/text-field";
import { SubmitButton } from "@/components/form/submit-button";
import { loginAction, initialLoginState } from "./actions";

export function LoginForm() {
  const t = useTranslations("Auth");
  const [state, formAction] = useActionState(loginAction, initialLoginState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
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
        autoComplete="current-password"
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

      <SubmitButton>{t("loginCta")}</SubmitButton>

      <p className="text-caption text-ink-muted">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-sky-deep underline">
          {t("registerLink")}
        </Link>
      </p>
    </form>
  );
}
