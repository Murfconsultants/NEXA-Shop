import { Router } from "express";
import type { DataStore } from "../store";
import { generateOrderId } from "../orderId";
import { requireApiKey } from "../middleware/auth";
import { getSessionAddress } from "../session";
import { sendOrderConfirmation } from "../email";
import { sensitiveLimiter } from "../middleware/rateLimit";

export function ordersRouter(store: DataStore) {
  const router = Router();

  /**
   * Buyer-facing: create a pending order from cart contents. The amount is
   * always computed here from current product prices — the client only ever
   * sends product ids and quantities, never a price.
   */
  router.post("/", sensitiveLimiter, async (req, res) => {
    const { items, shippingAddress, email } = req.body ?? {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items is required" });
    }

    const orderId = generateOrderId();
    try {
      const order = await store.createOrder(orderId, items, shippingAddress, email);
      res.status(201).json(order);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Could not create order" });
    }
  });

  /** Signed-in buyer's own order history — reads the wallet address off their SIWE session. */
  router.get("/mine", async (req, res) => {
    const address = await getSessionAddress(req);
    if (!address) return res.status(401).json({ error: "Not signed in" });
    const orders = await store.getOrdersByBuyer(address);
    res.json(orders);
  });

  /** Buyer/frontend polls this to learn when an order flips to "paid". */
  router.get("/:id", async (req, res) => {
    const order = await store.getOrder(req.params.id as `0x${string}`);
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(order);
  });

  /**
   * Called by the payment indexer once a PaymentReceived event has cleared
   * the confirmation depth. Protected separately from the admin key so the
   * indexer's credential can be rotated/scoped independently.
   */
  router.post("/:id/mark-paid", requireApiKey("INDEXER_API_KEY"), async (req, res) => {
    const { buyer, amount, txHash, blockNumber } = req.body ?? {};
    if (!buyer || !amount || !txHash || blockNumber === undefined) {
      return res.status(400).json({ error: "buyer, amount, txHash, blockNumber are required" });
    }
    const order = await store.markPaid({
      orderId: req.params.id as `0x${string}`,
      buyer,
      paidAmount: BigInt(amount),
      txHash,
      blockNumber: BigInt(blockNumber),
    });
    if (!order) return res.status(404).json({ error: "Not found" });

    if (order.status === "paid") {
      // Fire-and-forget — see comment in email.ts on why this never blocks the response.
      void sendOrderConfirmation(order);
    }

    res.json(order);
  });

  return router;
}
