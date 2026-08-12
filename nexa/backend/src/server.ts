import { createApp } from "./app";

/**
 * Local/persistent-process entrypoint (`npm run dev` / `npm start`). Not
 * used on Vercel — see api/index.ts for the serverless entrypoint, which
 * imports the same createApp() but skips .listen() and the setInterval
 * below (Vercel Cron calls /api/cron/expire-orders instead — see app.ts).
 */
const app = createApp();

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[backend] listening on :${port}`);
});

// Restock and cancel abandoned carts so inventory doesn't lock forever.
// Only runs here, in a long-running process — the serverless deployment
// uses Vercel Cron against /api/cron/expire-orders instead.
const sweepIntervalMs = 60_000;

setInterval(async () => {
  try {
    const res = await fetch(`http://localhost:${port}/api/cron/expire-orders`, { method: "POST" });
    const { cancelled } = await res.json();
    if (cancelled?.length > 0) {
      console.log(`[expiry] cancelled ${cancelled.length} abandoned order(s): ${cancelled.join(", ")}`);
    }
  } catch (err) {
    console.error("[expiry] sweep failed:", err);
  }
}, sweepIntervalMs);
