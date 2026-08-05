// lib/validation/auth-schemas.ts
//
// Zod schemas for the register/login forms. Issue messages are translation
// *keys* (looked up in messages/{locale}.json under "Auth"), not literal
// text — validation runs in Server Actions, which can't assume a locale
// until they read it, and keeping the schema locale-agnostic lets both the
// register and login pages render the same error key bilingually.

import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "required")
    .email("invalidEmail")
    .toLowerCase(),
  password: z.string().min(8, "passwordTooShort").max(72, "passwordTooLong"),
  name: z
    .string()
    .trim()
    .max(120, "nameTooLong")
    .optional()
    .or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "required").email("invalidEmail"),
  password: z.string().min(1, "required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
