import { randomUUID, createHmac } from "crypto";
import type { Request, Response } from "express";
import { getRedis } from "./redis.js";

const SESSION_COOKIE = "nexa_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const NONCE_TTL_SECONDS = 5 * 60; // 5 minutes

interface Session {
  address: `0x${string}`;
  expiresAt: number;
}

// In-memory fallback for local dev (no Upstash configured). Gone on
// restart, and NOT safe across multiple processes/serverless invocations —
// see redis.ts for why Vercel deployments need UPSTASH_REDIS_REST_URL set.
const memorySessions = new Map<string, Session>();
const memoryNonces = new Map<string, number>();

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function issueNonce(): Promise<string> {
  const nonce = randomUUID().replace(/-/g, "");
  const redis = getRedis();
  if (redis) {
    await redis.set(`nonce:${nonce}`, "1", { ex: NONCE_TTL_SECONDS });
  } else {
    memoryNonces.set(nonce, Date.now() + NONCE_TTL_SECONDS * 1000);
  }
  return nonce;
}

export async function consumeNonce(nonce: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    // GETDEL is atomic — two concurrent verifies for the same nonce can't both succeed.
    const value = await redis.getdel(`nonce:${nonce}`);
    return value !== null;
  }
  const expiry = memoryNonces.get(nonce);
  memoryNonces.delete(nonce);
  return typeof expiry === "number" && expiry > Date.now();
}

export async function createSession(res: Response, address: `0x${string}`): Promise<void> {
  const sessionId = randomUUID();
  const redis = getRedis();
  if (redis) {
    await redis.set(`session:${sessionId}`, JSON.stringify({ address }), { ex: SESSION_TTL_SECONDS });
  } else {
    memorySessions.set(sessionId, { address, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 });
  }

  const signature = sign(sessionId);
  res.cookie(SESSION_COOKIE, `${sessionId}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
}

export async function destroySession(req: Request, res: Response): Promise<void> {
  const raw = req.cookies?.[SESSION_COOKIE];
  if (raw) {
    const [sessionId] = String(raw).split(".");
    const redis = getRedis();
    if (redis) {
      await redis.del(`session:${sessionId}`);
    } else {
      memorySessions.delete(sessionId);
    }
  }
  res.clearCookie(SESSION_COOKIE);
}

export async function getSessionAddress(req: Request): Promise<`0x${string}` | null> {
  const raw = req.cookies?.[SESSION_COOKIE];
  if (!raw) return null;

  const [sessionId, signature] = String(raw).split(".");
  if (!sessionId || !signature) return null;
  if (sign(sessionId) !== signature) return null; // tampered cookie

  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(`session:${sessionId}`);
    if (!raw) return null;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed.address;
  }

  const session = memorySessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    memorySessions.delete(sessionId);
    return null;
  }
  return session.address;
}
