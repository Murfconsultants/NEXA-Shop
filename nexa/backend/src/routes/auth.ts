import { Router } from "express";
import { SiweMessage } from "siwe";
import { consumeNonce, createSession, destroySession, getSessionAddress, issueNonce } from "../session.js";
import { sensitiveLimiter } from "../middleware/rateLimit.js";

export function authRouter() {
  const router = Router();

  /** Frontend fetches this, embeds it in the SIWE message it asks the wallet to sign. */
  router.get("/nonce", sensitiveLimiter, async (_req, res) => {
    res.json({ nonce: await issueNonce() });
  });

  /** Frontend posts the signed SIWE message + signature here to establish a session. */
  router.post("/verify", sensitiveLimiter, async (req, res) => {
    const { message, signature } = req.body ?? {};
    if (!message || !signature) {
      return res.status(400).json({ error: "message and signature are required" });
    }

    try {
      const siweMessage = new SiweMessage(message);
      const { data } = await siweMessage.verify({ signature });

      if (!(await consumeNonce(data.nonce))) {
        return res.status(401).json({ error: "Invalid or expired nonce" });
      }

      await createSession(res, data.address as `0x${string}`);
      res.json({ address: data.address });
    } catch (err) {
      res.status(401).json({ error: err instanceof Error ? err.message : "Verification failed" });
    }
  });

  router.get("/session", async (req, res) => {
    const address = await getSessionAddress(req);
    res.json({ address });
  });

  router.post("/logout", async (req, res) => {
    await destroySession(req, res);
    res.status(204).send();
  });

  return router;
}
