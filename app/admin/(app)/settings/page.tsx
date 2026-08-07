// app/admin/(app)/settings/page.tsx — Story 2.3 store settings.
// Single flat shipping fee (VND) applied to Physical Print orders at
// checkout (FR-20 → FR-7). Server-action form; the saved value re-renders
// via revalidatePath.

import { requireOperator } from "@/lib/server/require-operator";
import { getStoreSettings } from "@/lib/server/settings";
import { TextField } from "@/components/form/text-field";
import { SubmitButton } from "@/components/form/submit-button";
import { updateShippingFeeAction } from "./actions";

export default async function SettingsPage() {
  await requireOperator();
  const { shippingFeeVnd } = await getStoreSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Store settings</h1>

      <form action={updateShippingFeeAction} className="max-w-xs space-y-4">
        <TextField
          id="shippingFeeVnd"
          name="shippingFeeVnd"
          type="number"
          inputMode="numeric"
          min={0}
          label="Flat shipping fee (VND)"
          defaultValue={String(shippingFeeVnd)}
        />
        <p className="text-caption text-ink-muted">
          Applied once per order that contains a physical print. Digital-only
          orders ship free.
        </p>
        <SubmitButton>Save</SubmitButton>
      </form>
    </div>
  );
}
