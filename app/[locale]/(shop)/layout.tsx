// app/[locale]/(shop)/layout.tsx
//
// Portfolio-only revamp (R1). Every storefront route — shop, cart, checkout,
// account, login, register, order — lives in this route group (the folder
// name doesn't appear in URLs). While SHOP_ENABLED is off they all 404; the
// code stays intact so the shop can be switched back on with one env var.

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { shopEnabled } from "@/lib/server/shop-config";

export default function ShopGroupLayout({ children }: { children: ReactNode }) {
  if (!shopEnabled()) notFound();
  return children;
}
