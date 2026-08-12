import rateLimit from "express-rate-limit";

/**
 * Both limiters below use express-rate-limit's default in-memory store.
 * That's exact and correct for `npm run dev` (one persistent process), but
 * on Vercel each serverless invocation can get its own memory — so these
 * become "best effort" there rather than a hard cap shared across all
 * traffic. Unlike session/nonce storage (see session.ts + redis.ts), this
 * is a soft degradation, not a correctness bug: worst case, spammy requests
 * get through when they'd otherwise be blocked. If you need real teeth in
 * production, swap to `@upstash/ratelimit` against the same Redis instance
 * used for sessions.
 */

/** Applied to every route. Generous — this is a floor against basic abuse/scraping. */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Applied to order creation and SIWE verification specifically — both are
 * cheap to spam and both have a real cost if abused: order creation
 * decrements real inventory (see Store.createOrder), and SIWE verification
 * does signature-recovery work per request.
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — slow down and try again shortly." },
});
