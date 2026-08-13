import { Router } from "express";
import type { DataStore } from "../store.js";
import { requireApiKey } from "../middleware/auth.js";
import { signCloudinaryUpload } from "../cloudinary.js";

export function adminRouter(store: DataStore) {
  const router = Router();
  router.use(requireApiKey("ADMIN_API_KEY"));

  router.get("/orders", async (_req, res) => {
    const orders = await store.listOrders();
    res.json(orders);
  });

  /** Manual cancel — e.g. a customer emails asking to cancel before paying. Restocks the items. */
  router.post("/orders/:id/cancel", async (req, res) => {
    const order = await store.cancelOrder(req.params.id as `0x${string}`);
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(order);
  });

  /**
   * Returns a signed payload the admin dashboard uses to upload an image
   * file directly to Cloudinary from the browser — the file bytes never
   * pass through this server. See src/cloudinary.ts for the signing logic.
   */
  router.post("/uploads/signature", (_req, res) => {
    try {
      const signed = signCloudinaryUpload({ folder: "products" });
      res.json({ ...signed, folder: "products" });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Cloudinary not configured" });
    }
  });

  router.get("/stats", async (_req, res) => {
    const [orders, products] = await Promise.all([store.listOrders(), store.listProducts()]);

    const paidOrders = orders.filter((o) => o.status === "paid" || o.status === "overpaid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + BigInt(o.amount), 0n);

    const salesByProduct = new Map<string, number>();
    for (const order of paidOrders) {
      for (const item of order.items) {
        salesByProduct.set(item.productId, (salesByProduct.get(item.productId) ?? 0) + item.quantity);
      }
    }
    const topProducts = [...salesByProduct.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, unitsSold]) => ({
        productId,
        name: products.find((p) => p.id === productId)?.name ?? "Unknown product",
        unitsSold,
      }));

    res.json({
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      paidOrders: paidOrders.length,
      flaggedOrders: orders.filter((o) => o.status === "underpaid" || o.status === "overpaid").length,
      totalRevenueRaw: totalRevenue.toString(),
      lowStockProducts: products
        .filter((p) => p.inventory <= 5)
        .map((p) => ({ id: p.id, name: p.name, inventory: p.inventory })),
      topProducts,
    });
  });

  return router;
}
