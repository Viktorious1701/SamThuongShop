// lib/server/settings.ts
//
// Store-wide settings — a single row (id "store"). v1 holds only the flat
// shipping fee (integer VND, AD-5) that checkout applies to Physical Print
// Orders (FR-20 → consumed by FR-7 / AD-10 at checkout). Only lib/server
// touches Prisma (AD-2).

import { prisma } from "@/lib/server/db";

const STORE_ID = "store";

export type StoreSettings = { shippingFeeVnd: number };

/** Reads the singleton, creating it with defaults on first access. */
export async function getStoreSettings(): Promise<StoreSettings> {
  const row = await prisma.storeSetting.upsert({
    where: { id: STORE_ID },
    update: {},
    create: { id: STORE_ID },
  });
  return { shippingFeeVnd: row.shippingFeeVnd };
}

export async function updateShippingFee(shippingFeeVnd: number): Promise<void> {
  await prisma.storeSetting.upsert({
    where: { id: STORE_ID },
    update: { shippingFeeVnd },
    create: { id: STORE_ID, shippingFeeVnd },
  });
}
