# Arc store — backend API

Express + TypeScript API owning products, order creation, and order status.
The frontend and admin dashboard both talk to this; the payment indexer
calls into it once a payment confirms on-chain.

## Setup

```bash
npm install
cp .env.example .env
npm run seed   # creates 3 demo products in store.json
npm run dev
```

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/products` | — | list products |
| GET | `/api/products/:id` | — | one product |
| POST | `/api/products` | `x-api-key: ADMIN_API_KEY` | create product |
| PATCH | `/api/products/:id` | `x-api-key: ADMIN_API_KEY` | update price/inventory/etc |
| DELETE | `/api/products/:id` | `x-api-key: ADMIN_API_KEY` | remove product |
| POST | `/api/orders` | — | create a pending order from `{ items, shippingAddress }` |
| GET | `/api/orders/:id` | — | poll order status |
| POST | `/api/orders/:id/mark-paid` | `x-api-key: INDEXER_API_KEY` | called by the indexer once confirmed |
| GET | `/api/admin/orders` | `x-api-key: ADMIN_API_KEY` | full order list |
| GET | `/api/admin/stats` | `x-api-key: ADMIN_API_KEY` | revenue, top products, low stock |

## Where amounts come from

`POST /api/orders` takes `{ items: [{ productId, quantity }] }` — **never** a
price. `Store.createOrder` looks up each product's current `priceUsdc` and
computes the total server-side. That's the number that goes to the frontend
as `amount`, and it's the number `mark-paid` checks the on-chain payment
against (see `Store.markPaid` — mismatches are recorded as
`underpaid`/`overpaid` rather than silently accepted).

## Inventory

`createOrder` decrements inventory immediately, to stop two buyers racing
for the last unit. This demo doesn't release that reservation if the buyer
never pays — for production, add either a TTL sweep (cancel + restock orders
still `pending` after N minutes) or restock explicitly on a `cancelOrder`
call you expose from the admin dashboard.

## Wiring the indexer to this backend

The indexer project (separate deliverable) currently writes directly to its
own `orders.json`. Point it at this backend instead so there's a single
source of truth: in the indexer's `src/index.ts`, replace the direct
`JsonFileStore` writes in `onOrderSettled` with a call here:

```ts
async onOrderSettled({ orderId, buyer, amount, txHash }) {
  await fetch(`${process.env.BACKEND_URL}/api/orders/${orderId}/mark-paid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.INDEXER_API_KEY!,
    },
    body: JSON.stringify({ buyer, amount: amount.toString(), txHash, blockNumber: /* from the log */ "0" }),
  });
}
```

And have the indexer's `getOrder`/`hasProcessedTx` checks read from this
backend's `/api/orders/:id` instead of its local file, so both services
agree on order state. In production this collapses further: point both the
backend and the indexer at the same Postgres instance and skip the HTTP hop
entirely.

## Swapping in a real database

`DataStore` (`src/storeInterface.ts`) is the interface every route depends on. `src/store.ts` is a factory: set `DATABASE_URL` and it returns `PostgresStore` (real transactions, row-level locking via `SELECT ... FOR UPDATE`, safe under concurrent traffic); leave it unset and it falls back to `FileStore` (the `store.json` demo — single-process only, fine for local dev, not for production). Run `npm run migrate` (or `psql $DATABASE_URL -f migrations/schema.sql` directly) before pointing at Postgres.

The one behavioral difference worth knowing: `PostgresStore.createOrder` locks the relevant product rows for the transaction's duration, so two concurrent checkouts for the last unit genuinely serialize instead of racing — `FileStore` can only approximate that by being single-process.

## Rate limiting

`src/middleware/rateLimit.ts` has two limiters: `generalLimiter` (300 req/15min, applied globally in `server.ts`) as a floor against scraping/abuse, and `sensitiveLimiter` (10 req/min) on `POST /api/orders` and the SIWE `nonce`/`verify` routes specifically — those three are the ones with a real cost per call (inventory decrement; signature-recovery CPU work). Tune the numbers in that file for your actual traffic before launch; these are reasonable defaults, not measured ones.

## Before production

- Replace the static API-key auth with real session auth for the dashboard
  and a scoped/rotatable service credential for the indexer.
- Add the inventory-release-on-expiry job mentioned above.
- Add request validation (zod or similar) instead of the ad-hoc checks here.

## SIWE auth

- `GET /api/auth/nonce` issues a one-time nonce (5 min TTL) the frontend embeds in the SIWE message.
- `POST /api/auth/verify` verifies the signed message + signature (via the `siwe` package), consumes the nonce, and sets an httpOnly session cookie.
- `GET /api/auth/session` returns `{ address }` (or `{ address: null }`) for the current cookie.
- `GET /api/orders/mine` returns the signed-in wallet's order history.

Sessions and nonces are in-memory (`src/session.ts`) — fine for one process, gone on restart. Swap for Redis or a DB table before running more than one instance. CORS is credentialed and locked to `FRONTEND_ORIGIN` (required for cookies to work cross-origin — can't combine `credentials: true` with a wildcard origin).

## Order confirmation email

`src/email.ts` wraps Resend and is called from `POST /api/orders/:id/mark-paid` once status is `"paid"`. It no-ops with a log line if `RESEND_API_KEY` isn't set, and never throws into the request path — a broken email provider should never block marking an order paid. Collect the buyer's `email` in your checkout form and pass it through in `POST /api/orders`.

## Order expiry / inventory release

A `setInterval` in `src/server.ts` calls `Store.expirePendingOrders` every 60s, cancelling and restocking any order still `pending` past `ORDER_EXPIRY_MINUTES` (default 15). This closes the gap where `createOrder` reserves inventory immediately (to stop two buyers racing for the last unit) but nothing previously released that reservation if the buyer abandoned checkout.

`POST /api/admin/orders/:id/cancel` does the same thing on demand — wired up in the admin dashboard's order detail page as a "Cancel & restock" button, shown only while an order is still `pending`. Both paths only ever touch `pending` orders, so a payment landing at the same moment as an expiry sweep can't cancel someone who actually paid.

In production, replace the `setInterval` with a real scheduled job (cron, or your queue's delayed-job feature) so it doesn't depend on the process staying up continuously.

## Product images

`POST /api/admin/uploads/signature` (admin-only) signs a direct-to-Cloudinary upload payload — see `src/cloudinary.ts`. The admin dashboard's product form uploads the file straight to Cloudinary from the browser using that signature; the image bytes never pass through this backend, only the signature request does. Requires `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`. Entirely optional — `imageUrl` is a plain string field, so pasting any URL (or leaving it blank) works fine without Cloudinary configured.
