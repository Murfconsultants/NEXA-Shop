# Arc store — admin dashboard

Next.js (App Router) dashboard for order fulfillment and inventory
management. Talks to the backend API entirely from server components and
server actions, so `ADMIN_API_KEY` never reaches the browser.

## Setup

```bash
npm install
cp .env.example .env.local
# make sure ADMIN_API_KEY matches the backend's .env
npm run dev   # runs on :3001 so it doesn't collide with the storefront on :3000
```

Requires the backend API running (see `../arc-backend`).

## Pages

- `/` — order counts, total revenue, top products, low-stock callouts
  (`GET /api/admin/stats`).
- `/orders` — full order table with status badges; click through to
  `/orders/[id]` for line items, buyer address, and an ArcScan link once
  `txHash` is set.
- `/products` — inventory table with inline quantity updates and a create
  form. Price is entered in display units (`24.99`) and converted to raw
  6-decimal USDC in `app/products/actions.ts` before hitting the API —
  that's the one place in this app that does that conversion, so it doesn't
  drift from `lib/api.ts`'s `formatUsdc` (the inverse).

## Why `server-only` + a non-`NEXT_PUBLIC_` env var

`lib/api.ts` imports the `server-only` package specifically so any accidental
client-component import of it fails at build time instead of silently
leaking `ADMIN_API_KEY` into a client bundle. Keep all admin API calls in
server components or server actions (as the existing pages do) rather than
client-side `fetch`.

## Auth

There's no login screen here — access control is "can you reach this
deployment." Before exposing this beyond localhost, put real session auth in
front of it (e.g. NextAuth backed by an admin user table) rather than
relying on network placement alone.

## Product images

The "Add product" form (`components/ProductForm.tsx` + `components/ImageUploader.tsx`) uploads directly to Cloudinary from the browser using a short-lived signature fetched from `app/api/upload-signature/route.ts` — a server-side Next.js route handler that attaches `ADMIN_API_KEY` and proxies to the backend's `/api/admin/uploads/signature`. The key never reaches the browser; only the resulting signature does. If Cloudinary isn't configured on the backend, the plain "paste an image URL" field still works.
