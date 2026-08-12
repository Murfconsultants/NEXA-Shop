# Arc payment indexer

Watches `PaymentReceiver` on Arc Testnet for `PaymentReceived` events, waits
for a configurable confirmation depth, and reports settled payments to the
backend API (`arc-backend`), which is the single source of truth for order
status.

## How it works

- **Polling, not just `watchContractEvent`.** Every `POLL_INTERVAL_MS`, it
  reads the latest block, subtracts `CONFIRMATIONS`, and scans `getLogs`
  from where it left off up to that "safe" block. This is more robust for
  money-handling code than a live subscription: it survives restarts,
  doesn't depend on a websocket staying open, and never processes a log
  until it's past your chosen confirmation depth.
- **Order truth lives in the backend.** `BackendOrderStore` (`src/db.ts`)
  calls `GET /api/orders/:id` and `POST /api/orders/:id/mark-paid` on
  `arc-backend` — it holds no order data itself.
- **Indexer-local progress is tracked separately**, in a small local
  `progress.json`: the last-scanned block (cursor) and which tx hashes have
  already been applied. This is this process's own bookkeeping, not order
  data, so a restart resumes scanning from the right place without
  re-querying the backend for it.
- **Idempotent by tx hash**, both locally (skips redelivered logs before
  even calling the backend) and on the backend side (`Store.markPaid` in
  `arc-backend` no-ops if the same tx hash was already applied).
- **Never trusts the on-chain amount blindly against a stale local copy** —
  `expectedAmount` is fetched fresh from the backend for each order before
  comparing; a mismatch is logged, not silently treated as fulfillment.

## Setup

```bash
npm install
cp .env.example .env
# fill in PAYMENT_RECEIVER_ADDRESS, START_BLOCK (the contract's deploy block),
# and BACKEND_URL / INDEXER_API_KEY matching arc-backend's .env
```

## Run

```bash
npm run dev
```

Make sure `arc-backend` is running first — every tick that finds new
payments calls out to it.

## Fulfillment

Confirmation email and any other post-payment fulfillment now live in
`arc-backend` (triggered from its `mark-paid` route), not here. `onOrderSettled`
in `src/index.ts` is left as an indexer-side observability/alerting hook —
add paging, metrics, whatever you want visibility into at the indexing layer
specifically.
