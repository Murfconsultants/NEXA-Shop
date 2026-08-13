import { promises as fs } from "fs";
import { type DataStore, formatUsdc } from "./storeInterface.js";
import path from "path";
import type { Order, OrderItem, Product } from "./types.js";

interface FileShape {
  products: Record<string, Product>;
  orders: Record<string, Order>;
}

const DEFAULT_PATH = path.join(process.cwd(), "store.json");

/**
 * Flat-file store for local development and demoing the full flow without a
 * database. Not safe for concurrent writers or production traffic — replace
 * with Postgres (or similar) before going live. Suggested schema:
 *
 *   create table products (
 *     id text primary key, name text, description text,
 *     price_usdc numeric not null, image_url text, inventory int not null
 *   );
 *   create table orders (
 *     id bytea primary key, items jsonb not null, amount numeric not null,
 *     status text not null default 'pending', buyer_address text,
 *     tx_hash text unique, block_number bigint,
 *     shipping_address jsonb, created_at timestamptz not null default now(),
 *     paid_at timestamptz
 *   );
 *
 * The important part to preserve if you swap this out: `createOrder` must
 * decrement inventory and create the order in one transaction, and
 * `markPaid` must be safe to call twice for the same tx hash (see the
 * `hasProcessedTx`-equivalent check below).
 */
export class FileStore implements DataStore {
  constructor(private readonly filePath: string = DEFAULT_PATH) {}

  private async read(): Promise<FileShape> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as FileShape;
    } catch {
      return { products: {}, orders: {} };
    }
  }

  private async write(data: FileShape): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  // --- Products ---------------------------------------------------------

  async listProducts(): Promise<Product[]> {
    const data = await this.read();
    return Object.values(data.products);
  }

  async getProduct(id: string): Promise<Product | null> {
    const data = await this.read();
    return data.products[id] ?? null;
  }

  async createProduct(input: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const data = await this.read();
    const product: Product = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    data.products[product.id] = product;
    await this.write(data);
    return product;
  }

  async updateProduct(id: string, patch: Partial<Omit<Product, "id" | "createdAt">>): Promise<Product | null> {
    const data = await this.read();
    const existing = data.products[id];
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    data.products[id] = updated;
    await this.write(data);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const data = await this.read();
    if (!data.products[id]) return false;
    delete data.products[id];
    await this.write(data);
    return true;
  }

  /**
   * Cancels a pending order and restocks its items. Safe to call on an
   * already-settled order (no-op) — only ever touches `pending` orders, so a
   * race with a payment landing at the same moment can't un-fulfil someone
   * who actually paid.
   */
  async cancelOrder(orderId: `0x${string}`): Promise<Order | null> {
    const data = await this.read();
    const order = data.orders[orderId];
    if (!order) return null;
    if (order.status !== "pending") return order;

    for (const item of order.items) {
      const product = data.products[item.productId];
      if (product) product.inventory += item.quantity;
    }
    order.status = "cancelled";
    data.orders[orderId] = order;
    await this.write(data);
    return order;
  }

  /**
   * Restocks and cancels any order still `pending` past `maxAgeMs`. Call
   * this on an interval (see server.ts) so abandoned carts don't lock
   * inventory forever. Returns the ids it cancelled, for logging.
   */
  async expirePendingOrders(maxAgeMs: number): Promise<`0x${string}`[]> {
    const data = await this.read();
    const cutoff = Date.now() - maxAgeMs;
    const expired: `0x${string}`[] = [];

    for (const order of Object.values(data.orders)) {
      if (order.status !== "pending") continue;
      if (new Date(order.createdAt).getTime() > cutoff) continue;

      for (const item of order.items) {
        const product = data.products[item.productId];
        if (product) product.inventory += item.quantity;
      }
      order.status = "cancelled";
      data.orders[order.id] = order;
      expired.push(order.id);
    }

    if (expired.length > 0) await this.write(data);
    return expired;
  }

  // --- Orders (continued) --------------------------------------------------

  async listOrders(): Promise<Order[]> {
    const data = await this.read();
    return Object.values(data.orders).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getOrder(id: `0x${string}`): Promise<Order | null> {
    const data = await this.read();
    return data.orders[id] ?? null;
  }

  async getOrdersByBuyer(buyer: `0x${string}`): Promise<Order[]> {
    const data = await this.read();
    return Object.values(data.orders)
      .filter((o) => o.buyerAddress?.toLowerCase() === buyer.toLowerCase())
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  /**
   * Computes the total server-side from current product prices and reserves
   * inventory. Throws if any item is out of stock or unknown — callers
   * should surface that as a 4xx to the client.
   */
  async createOrder(
    orderId: `0x${string}`,
    items: OrderItem[],
    shippingAddress?: Order["shippingAddress"],
    email?: string
  ): Promise<Order> {
    const data = await this.read();

    let total = 0n;
    for (const item of items) {
      const product = data.products[item.productId];
      if (!product) throw new Error(`Unknown product: ${item.productId}`);
      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient inventory for ${product.name}`);
      }
      total += BigInt(product.priceUsdc) * BigInt(item.quantity);
    }

    // Reserve stock now so two buyers can't both check out the last unit.
    // Released automatically by expirePendingOrders() if never paid — see server.ts.
    for (const item of items) {
      data.products[item.productId].inventory -= item.quantity;
    }

    const order: Order = {
      id: orderId,
      items,
      amount: total.toString(),
      displayAmount: formatUsdc(total),
      status: "pending",
      shippingAddress,
      email,
      createdAt: new Date().toISOString(),
    };
    data.orders[orderId] = order;
    await this.write(data);
    return order;
  }

  /**
   * Applied by the indexer once a payment is confirmed on-chain. Idempotent:
   * re-applying the same tx hash to an already-settled order is a no-op.
   */
  async markPaid(args: {
    orderId: `0x${string}`;
    buyer: `0x${string}`;
    paidAmount: bigint;
    txHash: `0x${string}`;
    blockNumber: bigint;
  }): Promise<Order | null> {
    const data = await this.read();
    const order = data.orders[args.orderId];
    if (!order) return null;
    if (order.txHash === args.txHash) return order; // already applied

    const expected = BigInt(order.amount);
    const status: Order["status"] =
      args.paidAmount === expected ? "paid" : args.paidAmount > expected ? "overpaid" : "underpaid";

    order.status = status;
    order.buyerAddress = args.buyer;
    order.txHash = args.txHash;
    order.blockNumber = args.blockNumber.toString();
    order.paidAt = new Date().toISOString();

    data.orders[args.orderId] = order;
    await this.write(data);
    return order;
  }
}

