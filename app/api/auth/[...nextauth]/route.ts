// app/api/auth/[...nextauth]/route.ts
//
// Auth.js v5 catch-all Route Handler. All config lives in the root auth.ts;
// this file only re-exports the generated handlers (AD-9).

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
