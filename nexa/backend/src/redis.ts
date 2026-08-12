import { Redis } from "@upstash/redis";

/**
 * Returns a shared Redis client if Upstash env vars are set, else null.
 *
 * Why this matters: session.ts and rateLimit.ts originally used plain
 * in-memory Maps. That's fine for `npm run dev` (one persistent process)
 * but silently breaks on Vercel — serverless invocations don't share
 * memory, so a nonce issued by one invocation may not exist in the
 * invocation that verifies it, and a session created in one may vanish on
 * the next request. Upstash's Redis is REST-based (no persistent
 * connection to manage), which is what makes it a fit for serverless.
 *
 * Local dev without Upstash configured still works — callers fall back to
 * in-memory storage when this returns null.
 */
export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}
