// app/admin/(app)/(shop)/layout.tsx
//
// Portfolio-only revamp (R1). The shop's admin screens — products,
// collections, orders, store settings — 404 while SHOP_ENABLED is off. The
// parent (app) layout still enforces the operator role first.

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { shopEnabled } from "@/lib/server/shop-config";

export default function AdminShopGroupLayout({ children }: { children: ReactNode }) {
  if (!shopEnabled()) notFound();
  return children;
}
