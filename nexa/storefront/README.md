# Arc store — checkout frontend

Next.js + wagmi + RainbowKit checkout flow: connect wallet → approve USDC →
pay → wait for confirmation, wired against `PaymentReceiver.sol`.

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — from cloud.walletconnect.com
- `NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS` — from the contracts project's deploy step
- Double-check `NEXT_PUBLIC_ARC_RPC_URL` / `NEXT_PUBLIC_USDC_ADDRESS` against
  `docs.arc.io` — testnet values can change.

```bash
npm run dev
```

Visit `/checkout/0x<some-bytes32-orderId>` — the page component currently
hardcodes a demo `amount`; wire it to a real fetch from your backend (see the
comment in `app/checkout/[orderId]/page.tsx`).

## How the payment flow works

`hooks/useCheckout.ts` is a small state machine keyed off two on-chain reads
(current USDC allowance, and whether the order is already marked paid) plus
the in-flight state of two writes (`approve`, `pay`):

```
idle → checking-allowance → needs-approval → approving ─┐
                          ↘ ready-to-pay ←───────────────┘
                                        → paying → paid
```

- **Amount always comes from the backend**, never computed in the browser —
  `Checkout` takes `amount` (raw 6-decimal bigint) as a prop. Never trust a
  client-supplied price for what actually gets charged.
- **Allowance is re-checked after approval confirms** (`refetchAllowance`),
  so the UI naturally advances to "ready to pay" without a manual refresh.
- **`getPayment(orderId)` is the source of truth for "already paid"** — if
  someone reloads the page after paying, the UI shows "paid" immediately
  instead of prompting to pay again.

## Notes

- Uses Arc's ERC-20 USDC interface exclusively (6 decimals) for balance,
  allowance, and payment amounts — never the native 18-decimal balance. See
  `lib/contracts.ts`.
- The "Arc Testnet — this is test USDC" banner in `components/Checkout.tsx`
  is intentional per Arc's own UX guidance for testnet apps; keep something
  like it visible through to mainnet migration to avoid confusing real funds
  with test funds during that transition.
- `arcTestnet` is defined manually in `lib/chains.ts` rather than imported
  from `viem/chains`, since support there is recent — swap to the package
  export if your installed viem version has it, keeping the values in sync.

## Catalog, cart, and checkout flow

- `/` — storefront grid with client-side search (`components/ProductGrid.tsx`), fetched server-side from the backend (`api.listProducts`, revalidated every 30s).
- `/products/[id]` — product detail with optional variant selectors (`components/AddToCart.tsx`) — variants are display-only; inventory is tracked at the product level (see the backend README for that trade-off).
- Cart (`lib/cart.ts`) is a `zustand` store persisted to `localStorage`, so it survives a refresh. Checking out (`components/Cart.tsx`) posts `{ items, email }` to `POST /api/orders` — the backend computes the authoritative total from current prices, never trusting whatever price was cached in the cart — then routes to `/checkout/[orderId]`, which now fetches the real order from the backend instead of a hardcoded stub.

## Sign in with Ethereum

`components/SiweButton.tsx` implements the standard flow: fetch a nonce → build a `SiweMessage` → `signMessage` via wagmi → POST the signed message to the backend, which sets an httpOnly session cookie. `/account` uses that session (via `GET /api/orders/mine`) to show order history without asking for a wallet address again. Because the backend and frontend run on different ports, this requires `credentials: "include"` on every `fetch` (already set in `lib/api.ts`) and credentialed, origin-locked CORS on the backend side.

## Product images

`ProductCard` and the product detail page render `imageUrl` via `next/image` for automatic optimization/lazy-loading. `next.config.js` allow-lists `res.cloudinary.com` in `images.remotePatterns` — add your own image host there if you're not using Cloudinary. Products without an `imageUrl` fall back to a plain gray placeholder block rather than a broken-image icon.
