"use client";

// app/[locale]/checkout/checkout-form.tsx — Story 3.2. Email (guests only) +
// a shipping-address block shown only when the cart has a physical print.
// Mirrors the auth forms' useActionState pattern; error strings are keys
// resolved against the Checkout namespace.

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { SubmitButton } from "@/components/form/submit-button";
import { placeOrder, type CheckoutState } from "./actions";

const initialState: CheckoutState = { status: "idle" };

export function CheckoutForm({
  hasPhysical,
  signedIn,
}: {
  hasPhysical: boolean;
  signedIn: boolean;
}) {
  const t = useTranslations("Checkout");
  const [state, formAction] = useActionState(placeOrder, initialState);
  const err = (k?: string) => (k ? t(k) : undefined);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {signedIn ? null : (
        <TextField
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          requiredLabel={t("required")}
          label={t("emailLabel")}
          error={err(state.fieldErrors?.email)}
        />
      )}

      {hasPhysical ? (
        <fieldset className="space-y-4">
          <legend className="text-caption text-ink">
            {t("shippingHeading")}
          </legend>
          <TextField
            id="shipName"
            name="shipName"
            autoComplete="name"
            required
            requiredLabel={t("required")}
            label={t("nameLabel")}
            error={err(state.fieldErrors?.shipName)}
          />
          <TextField
            id="shipPhone"
            name="shipPhone"
            type="tel"
            autoComplete="tel"
            required
            requiredLabel={t("required")}
            label={t("phoneLabel")}
            error={err(state.fieldErrors?.shipPhone)}
          />
          <TextareaField
            id="shipAddress"
            name="shipAddress"
            required
            requiredLabel={t("required")}
            label={t("addressLabel")}
            error={err(state.fieldErrors?.shipAddress)}
          />
          <TextField
            id="shipCity"
            name="shipCity"
            required
            requiredLabel={t("required")}
            label={t("cityLabel")}
            error={err(state.fieldErrors?.shipCity)}
          />
        </fieldset>
      ) : (
        <p className="text-caption text-ink-muted">{t("digitalOnlyNote")}</p>
      )}

      {state.formError ? (
        <p role="alert" className="text-caption text-error">
          {err(state.formError)}
        </p>
      ) : null}

      <div className="max-w-xs">
        <SubmitButton>{t("placeOrder")}</SubmitButton>
      </div>
    </form>
  );
}
