# lib/server

This is the **application/domain layer** (Architecture Spine — Design Paradigm, AD-1, AD-2).

**Rule: only this layer imports Prisma / talks to the database.** Presentation
code (`app/`, `components/`) never imports `@prisma/client` and never queries
the database directly — it calls into `lib/server/*` functions, Server
Actions, or Route Handlers that in turn call `lib/server/*`.

- Route Handlers (`app/api/**/route.ts`) handle inbound external calls
  (webhooks, downloads, auth callbacks) and delegate business logic here.
- Server Actions handle mutations and also delegate business logic here.
- Each domain/aggregate gets its own service module in this directory
  (e.g. `order.ts`, `product.ts`, `payment.ts`, `storage.ts`, `email.ts`).

`db.ts` exports the single shared Prisma client singleton used by every
service module in this layer.
