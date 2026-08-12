# NEXA

USDC-native e-commerce on Arc Testnet. Five pieces, each independently
deployable:

| Folder | What it is | Runs on |
|---|---|---|
| `contracts/` | `PaymentReceiver.sol` — Foundry project | Arc Testnet (via `forge script`) |
| `backend/` | Express API: products, orders, SIWE auth, email, admin stats | Vercel (serverless) or any Node host |
| `indexer/` | Watches the contract for payments, reports to `backend/` | **Not Vercel** — needs a persistent process (Docker image included) |
| `storefront/` | Next.js buyer-facing site (this is "NEXA") | Vercel |
| `admin/` | Next.js order/inventory dashboard | Vercel |

For the actual step-by-step to a live public site on Vercel, see
**[DEPLOY.md](./DEPLOY.md)**. This file covers running everything locally
first, which is worth doing before you deploy anything.

## Quick start (local)

```bash
bash setup.sh   # npm install in each subproject, copies .env.example -> .env everywhere
```

Then fill in each `.env` — see the table below for what's required even for
local dev vs. what can wait until deploy time.

| Variable | Where | Required locally? |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `storefront/.env` | Yes — free at cloud.walletconnect.com |
| `NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS` | `storefront/.env` | Yes — after deploying `contracts/` |
| `PAYMENT_RECEIVER_ADDRESS` | `indexer/.env` | Yes — same address |
| `ADMIN_API_KEY` / `INDEXER_API_KEY` | `backend/.env`, and matching in `admin/.env` / `indexer/.env` | Yes — any string, just keep them matching |
| `SESSION_SECRET` | `backend/.env` | Yes — any random string (`openssl rand -hex 32`) |
| `DATABASE_URL` | `backend/.env` | No locally — falls back to a local `store.json` file |
| `UPSTASH_REDIS_REST_URL/TOKEN` | `backend/.env` | No locally — falls back to in-memory sessions |
| `RESEND_API_KEY`, `CLOUDINARY_*` | `backend/.env` | No — those features just no-op without them |

Run order (each in its own terminal):

```bash
cd backend    && npm run seed && npm run dev   # :4000 — seeds 3 demo products
cd indexer    && npm run dev                    # polls Arc Testnet
cd storefront && npm run dev                    # :3000 — the public storefront
cd admin      && npm run dev                    # :3001 — order/inventory dashboard
```

Visit `localhost:3000`, add something to the cart, check out with a wallet
funded from `faucet.circle.com`, and watch it show up as `paid` in
`localhost:3001/orders`.

## Where things live

Each subproject has its own README with the details:

- `contracts/README.md` — Foundry setup, tests, deploy, verify
- `backend/README.md` — API reference, DB swap, SIWE, email, rate limiting, Cloudinary
- `indexer/README.md` — how the polling/confirmation logic works
- `storefront/README.md` — checkout flow, cart, SIWE
- `admin/README.md` — dashboard pages, image uploads
