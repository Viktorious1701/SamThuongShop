"use client";

// app/admin/(app)/collections/collection-editor.tsx — Story 2.3.
// Bilingual name/description + a checkbox list to assign products (the m-n
// membership). Uses useActionState like the auth/admin forms; product
// checkboxes submit as repeated `productIds` fields read by the action.

import { useActionState } from "react";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { SubmitButton } from "@/components/form/submit-button";
import { saveCollection, type CollectionFormState } from "./actions";
import type { CollectionDTO } from "@/lib/server/collection";

type ProductOption = { id: string; name: string };

const initialState: CollectionFormState = { status: "idle" };

export function CollectionEditor({
  initial,
  collectionId,
  products,
}: {
  initial?: CollectionDTO;
  collectionId?: string;
  products: ProductOption[];
}) {
  const [state, formAction] = useActionState(
    saveCollection.bind(null, collectionId ?? null),
    initialState,
  );
  const assigned = new Set(initial?.productIds ?? []);

  return (
    <form action={formAction} className="max-w-2xl space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          id="nameVi"
          name="nameVi"
          label="Name (Vietnamese)"
          required
          requiredLabel="Required"
          defaultValue={initial?.nameVi ?? ""}
        />
        <TextField
          id="nameEn"
          name="nameEn"
          label="Name (English)"
          required
          requiredLabel="Required"
          defaultValue={initial?.nameEn ?? ""}
        />
        <TextareaField
          id="descriptionVi"
          name="descriptionVi"
          label="Description (Vietnamese)"
          defaultValue={initial?.descriptionVi ?? ""}
        />
        <TextareaField
          id="descriptionEn"
          name="descriptionEn"
          label="Description (English)"
          defaultValue={initial?.descriptionEn ?? ""}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-caption text-ink">
          Products in this collection
        </legend>
        {products.length === 0 ? (
          <p className="text-caption text-ink-muted">No products yet.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {products.map((p) => (
              <li key={p.id}>
                <label className="flex items-center gap-2 text-body text-ink">
                  <input
                    type="checkbox"
                    name="productIds"
                    value={p.id}
                    defaultChecked={assigned.has(p.id)}
                    className="h-4 w-4 accent-sky-deep"
                  />
                  {p.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {state.error ? (
        <p role="alert" className="text-caption text-error">
          {state.error}
        </p>
      ) : null}

      <div className="max-w-xs">
        <SubmitButton>
          {collectionId ? "Save changes" : "Create collection"}
        </SubmitButton>
      </div>
    </form>
  );
}
