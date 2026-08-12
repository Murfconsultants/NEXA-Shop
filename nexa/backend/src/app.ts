import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createStore } from "./store";
import { productsRouter } from "./routes/products";
import { ordersRouter } from "./routes/orders";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { generalLimiter } from "./middleware/rateLimit";

/**
 * Builds the Express app without calling `.listen()` or starting any
 * `setInterval`, so it can be imported both by `server.ts` (local/persistent
 * dev — see that file for the listen call + background expiry sweep) and by
 * `api/index.ts` (Vercel serverless — see that file and the top-level
 * DEPLOY.md for why the sweep becomes a Vercel Cron hitting
 * /api/cron/expire-orders instead of a setInterval there).
 */
export function createApp() {
  const app = express();
  const store = createStore();

  // Credentialed CORS is required for SIWE session cookies to round-trip
  // from the storefront (a different origin) — a wildcard origin can't be
  // used together with credentials: true per the CORS spec.
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
  app.use(cors({ origin: frontendOrigin, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(generalLimiter);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/products", productsRouter(store));
  app.use("/api/orders", ordersRouter(store));
  app.use("/api/admin", adminRouter(store));
  app.use("/api/auth", authRouter());

  /**
   * Serverless-friendly replacement for the local setInterval sweep.
   * Trigger this on a schedule (Vercel Cron in production — see
   * vercel.json — or curl it from any scheduler) instead of relying on a
   * long-running process, since Vercel functions don't keep one alive.
   */
  app.all("/api/cron/expire-orders", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      // Vercel Cron sends this header automatically; set CRON_SECRET so
      // this endpoint can't be triggered by anyone who finds the URL.
      const auth = req.header("authorization");
      if (auth !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }
    const expiryMinutes = Number(process.env.ORDER_EXPIRY_MINUTES ?? 15);
    const expired = await store.expirePendingOrders(expiryMinutes * 60_000);
    res.json({ cancelled: expired });
  });

  return app;
}
