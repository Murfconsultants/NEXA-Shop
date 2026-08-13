import { Router } from "express";
import type { DataStore } from "../store.js";
import { requireApiKey } from "../middleware/auth.js";

export function productsRouter(store: DataStore) {
  const router = Router();

  router.get("/", async (_req, res) => {
    const products = await store.listProducts();
    res.json(products);
  });

  router.get("/:id", async (req, res) => {
    const product = await store.getProduct(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  });

  // --- admin-only writes ---
  router.post("/", requireApiKey("ADMIN_API_KEY"), async (req, res) => {
    const { name, description, priceUsdc, imageUrl, inventory, variants } = req.body ?? {};
    if (!name || !priceUsdc || inventory === undefined) {
      return res.status(400).json({ error: "name, priceUsdc, and inventory are required" });
    }
    const product = await store.createProduct({
      name,
      description: description ?? "",
      priceUsdc: String(priceUsdc),
      imageUrl,
      inventory: Number(inventory),
      variants,
    });
    res.status(201).json(product);
  });

  router.patch("/:id", requireApiKey("ADMIN_API_KEY"), async (req, res) => {
    const patch = req.body ?? {};
    if (patch.priceUsdc !== undefined) patch.priceUsdc = String(patch.priceUsdc);
    if (patch.inventory !== undefined) patch.inventory = Number(patch.inventory);
    const product = await store.updateProduct(req.params.id, patch);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  });

  router.delete("/:id", requireApiKey("ADMIN_API_KEY"), async (req, res) => {
    const ok = await store.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  });

  return router;
}
