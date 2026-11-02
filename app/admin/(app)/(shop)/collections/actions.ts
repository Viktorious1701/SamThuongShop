"use server";

// app/admin/(app)/collections/actions.ts — Story 2.3 collection mutations
// (AD-1). Each guards via requireOperator() (AD-9) and delegates to
// lib/server/collection.ts (AD-2). English-only admin.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOperator } from "@/lib/server/require-operator";
import {
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/lib/server/collection";
import { collectionSchema } from "@/lib/validation/collection-schemas";

export type CollectionFormState = { status: "idle" | "error"; error?: string };

export async function saveCollection(
  id: string | null,
  _prev: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  await requireOperator();

  const raw = {
    nameVi: String(formData.get("nameVi") ?? ""),
    nameEn: String(formData.get("nameEn") ?? ""),
    descriptionVi: String(formData.get("descriptionVi") ?? "") || null,
    descriptionEn: String(formData.get("descriptionEn") ?? "") || null,
    productIds: formData.getAll("productIds").map(String),
  };
  const parsed = collectionSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid." };
  }

  const result = id
    ? await updateCollection(id, parsed.data)
    : await createCollection(parsed.data);
  if (!result.ok) return { status: "error", error: result.error };

  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}

export async function deleteCollectionAction(id: string): Promise<void> {
  await requireOperator();
  await deleteCollection(id);
  revalidatePath("/admin/collections");
}
