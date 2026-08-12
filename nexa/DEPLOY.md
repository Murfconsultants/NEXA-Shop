# Deploying NEXA

This walks through going from "unzipped this folder in a Codespace" to a
live, public storefront on Vercel. Rough order: accounts → contract →
database/cache → backend → indexer → storefront + admin.

Budget more time than it looks like — this is five separate deployments
wired together with env vars, and every one of them has to match the
others exactly (same `PAYMENT_RECEIVER_ADDRESS`, same `ADMIN_API_KEY`, etc).

## 0. Unpack in your Codespace

If you got this as `nexa.zip` / `nexa.tar.gz`:

```bash
unzip nexa.zip -d nexa   # or: tar -xzf nexa.tar.gz
cd nexa
bash setup.sh
```

`setup.sh` runs `npm install` in each subproject and copies every
`.env.example` to `.env`. If you want the devcontainer's extensions/port
forwarding (`.devcontainer/devcontainer.json`) to actually apply, commit
this into a repo and rebuild the Codespace from it — unpacking into an
already-running Codespace still works fine, it just skips that file.

## 1. Accounts you'll need (all free tiers work)

- **WalletConnect Cloud** — cloud.walletconnect.com — for the storefront's wallet connect button.
- **Neon** (or Supabase, or Vercel Postgres) — a real Postgres instance. `backend/`'s `FileStore` fallback does not work on Vercel (see `backend/README.md` and the guard in `backend/src/store.ts`) — you need this.
- **Upstash** — console.upstash.com — a Redis database (REST-based, free tier is enough). Without this, SIWE login breaks on Vercel because the in-memory nonce/session store doesn't survive across serverless invocations. See `backend/src/session.ts`.
- **Vercel** — for `backend/`, `storefront/`, and `admin/` (three separate Vercel projects).
- **Resend** (optional) — order confirmation emails. Skip and it just no-ops.
- **Cloudinary** (optional) — product image uploads in the admin dashboard. Skip and use plain image URLs instead.
- Somewhere to run `indexer/` as a persistent process — Railway, Render (background worker), Fly.io, or any small VPS. **Not Vercel** — it's a polling loop, not a request handler.

## 2. Deploy the contract

```bash
cd contracts
forge install foundry-rs/forge-std --no-commit
forge build && forge test -vvv

export ARC_TESTNET_RPC="https://rpc.testnet.arc.network"   # confirm current URL in docs.arc.io
export USDC_ADDRESS="0x3600000000000000000000000000000000000000"
export STORE_OWNER="0xYourTreasuryOrMultisig"
export DEPLOYER_PRIVATE_KEY="0x..."   # funded via faucet.circle.com

forge script script/Deploy.s.sol:Deploy \
  --rpc-url $ARC_TESTNET_RPC --broadcast --private-key $DEPLOYER_PRIVATE_KEY
```

Note the deployed address and the block number it landed in (from the
broadcast output, or look it up on ArcScan) — you'll need both.

## 3. Provision Postgres and Redis

- Create a Neon project, copy its connection string into `DATABASE_URL`.
- Run the schema against it: `psql "$DATABASE_URL" -f backend/migrations/schema.sql` (or paste the file into Neon's SQL editor).
- Create an Upstash Redis database, copy the REST URL and token.

## 4. Deploy the backend to Vercel

```bash
cd backend
npx vercel link      # creates a new Vercel project, or link an existing one
npx vercel env add DATABASE_URL production
npx vercel env add UPSTASH_REDIS_REST_URL production
npx vercel env add UPSTASH_REDIS_REST_TOKEN production
npx vercel env add ADMIN_API_KEY production
npx vercel env add INDEXER_API_KEY production
npx vercel env add SESSION_SECRET production
npx vercel env add CRON_SECRET production
npx vercel env add FRONTEND_ORIGIN production   # fill in after step 6 — see note below
# optional:
npx vercel env add RESEND_API_KEY production
npx vercel env add EMAIL_FROM production
npx vercel env add CLOUDINARY_CLOUD_NAME production
npx vercel env add CLOUDINARY_API_KEY production
npx vercel env add CLOUDINARY_API_SECRET production

npx vercel --prod
```

(The Vercel dashboard's Project → Settings → Environment Variables page
works just as well as the CLI for all of the above, if you'd rather click
through it.)

Note the deployment URL (e.g. `https://nexa-backend.vercel.app`) — this is
`BACKEND_URL` / `NEXT_PUBLIC_BACKEND_URL` everywhere else.

**About the cron:** `vercel.json` schedules `/api/cron/expire-orders` every
15 minutes. Vercel's Hobby plan limits cron frequency (check your current
plan's limit — this has changed over time) — if 15 minutes isn't available
on your plan, either upgrade or adjust the schedule and
`ORDER_EXPIRY_MINUTES` together so they're consistent. The admin
dashboard's manual "Cancel & restock" button works regardless, as a fallback.

**About `FRONTEND_ORIGIN`:** this has to exactly match the storefront's live
URL for SIWE cookies to work (credentialed CORS can't use a wildcard). You
won't have that URL until step 6 — deploy the backend once now, come back
and set this + redeploy after the storefront is live. Same chicken-and-egg
applies to `NEXT_PUBLIC_BACKEND_URL` on the storefront side.

## 5. Deploy the indexer somewhere persistent

Using the included Dockerfile (works on Railway, Render, Fly.io, or any
Docker host):

```bash
cd indexer
docker build -t nexa-indexer .
docker run -d --env-file .env nexa-indexer
```

Fill `.env` with the deployed contract address + block from step 2, and
`BACKEND_URL` pointing at the Vercel backend URL from step 4, with a
matching `INDEXER_API_KEY`.

If you're using Railway or Render specifically: point their "Docker" deploy
mode at this `Dockerfile`, set the same env vars in their dashboard, and
make sure it's configured as a **worker/background service**, not a web
service — it doesn't listen on a port.

## 6. Deploy the storefront (NEXA) to Vercel

```bash
cd storefront
npx vercel link
npx vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production
npx vercel env add NEXT_PUBLIC_BACKEND_URL production      # the backend's Vercel URL from step 4
npx vercel env add NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS production
npx vercel env add NEXT_PUBLIC_ARC_RPC_URL production
npx vercel env add NEXT_PUBLIC_USDC_ADDRESS production
npx vercel --prod
```

This is your live public site. Take its URL and:

1. Go back to the backend's Vercel project → Settings → Environment
   Variables → set `FRONTEND_ORIGIN` to this URL → redeploy the backend.

## 7. Deploy the admin dashboard to Vercel

```bash
cd admin
npx vercel link
npx vercel env add BACKEND_URL production        # same backend URL, server-side only
npx vercel env add ADMIN_API_KEY production       # must match the backend's
npx vercel --prod
```

There's no login screen on this one (see `admin/README.md`) — its Vercel
deployment URL is effectively the access control until you add real auth.
Consider Vercel's built-in password protection (Pro plan) or restricting it
to your team, rather than leaving it as a guessable public URL.

## 8. Smoke test

- `storefront` URL loads, shows the 3 seeded products (re-run `backend`'s
  seed script against production if you didn't already — `DATABASE_URL=... npm run seed` from `backend/`).
- Connect a wallet on Arc Testnet, add something to cart, check out.
- Confirm the payment on ArcScan.
- Within the indexer's poll interval, the order should flip to `paid` —
  check `admin` → Orders.
- If Resend is configured, confirm the email arrived.

## Common failure points

- **SIWE sign-in fails silently or nonce errors** → `UPSTASH_REDIS_REST_URL`/`TOKEN` not set on the backend's Vercel project, or `FRONTEND_ORIGIN` doesn't exactly match the storefront's URL (including `https://`, no trailing slash).
- **Orders never flip to paid** → indexer isn't running, or its `BACKEND_URL`/`INDEXER_API_KEY` don't match the deployed backend; check the indexer's logs.
- **"DATABASE_URL is required when deployed on Vercel"** → exactly what it says — the backend refuses to boot without Postgres in that environment on purpose (see `backend/src/store.ts`).
- **Checkout button does nothing** → `NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS` or `NEXT_PUBLIC_USDC_ADDRESS` unset/wrong on the storefront.
