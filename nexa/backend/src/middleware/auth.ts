import type { NextFunction, Request, Response } from "express";

/**
 * Minimal API-key auth for demo purposes. Real deployments should use proper
 * session auth for the admin dashboard (e.g. NextAuth with a real user table)
 * and a rotated service credential (or mTLS) for the indexer→backend call —
 * a static bearer token is a starting point, not an end state.
 */
export function requireApiKey(envVarName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const expected = process.env[envVarName];
    if (!expected) {
      res.status(500).json({ error: `Server misconfigured: ${envVarName} not set` });
      return;
    }
    const provided = req.header("x-api-key");
    if (provided !== expected) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  };
}
