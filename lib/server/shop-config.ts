// lib/server/shop-config.ts
//
// Story 3.8 — capability switches for the (secondary) Shop. Until payOS
// (Story 3.3) and digital delivery (Story 3.6) ship, the live shop must only
// offer what can actually be fulfilled: Physical Prints, paid by COD. Each
// later story flips its flag in the deployment env. This module is the only
// reader of these variables — server-only, never `NEXT_PUBLIC_`.
//
// Only the exact value "true" enables a flag; unset or anything else is off,
// so a missing env var always falls back to the safe interim behaviour.

function flag(name: string): boolean {
  return process.env[name] === "true";
}

/** VietQR via payOS is offered at checkout (Story 3.3). */
export function onlinePaymentEnabled(): boolean {
  return flag("SHOP_ONLINE_PAYMENT_ENABLED");
}

/**
 * Digital Download variants are visible and buyable (Story 3.6). Requires
 * online payment too: COD can never pay for a digital line (AD-8), so
 * digital-on with payment-off would recreate an unpayable cart.
 */
export function digitalSalesEnabled(): boolean {
  return flag("SHOP_DIGITAL_SALES_ENABLED") && onlinePaymentEnabled();
}
