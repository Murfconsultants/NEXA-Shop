import { Pool, type PoolClient } from "pg";
import type { DataStore } from "./storeInterface";
import type { Order, OrderItem, Product } from "./types";
import { formatUsdc } from "./storeInterface";

function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex.replace(/^0x/, ""), "hex");
}
function bufferToHex(buf: Buffer): `0x${string}` {
  return `0x${buf.toString("hex")}`;
}

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceUsdc: row.price_usdc,
    imageUrl: row.image_url ?? undefined,
    inventory: row.inventory,
    variants: row.variants ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}

function rowToOrder(row: any): Order {
  return {
    id: bufferToHex(row.id),
    items: row.items,
    amount: row.amount,
    displayAmount: formatUsdc(BigInt(row.amount)),
    status: row.status,
    buyerAddress: row.buyer_address ?? undefined,
    txHash: row.tx_hash ?? undefined,
    blockNumber: row.block_number != null ? String(row.block_number) : undefined,
    email: row.email ?? undefined,
    shippingAddress: row.shipping_address ?? undefined,
    createdAt: row.created_at.toISOString(),
    paidAt: row.paid_at ? row.paid_at.toISOString() : undefined,
  };
}

/**
 * Real-database implementation of DataStore. Run migrations/schema.sql
 * against your Postgres instance before using this (or point a migration
 * tool at it). Selected automatically by src/store.ts when DATABASE_URL is
 * set — see that file's factory function.
 */
export class PostgresStore implements DataStore {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  // --- Products -----------------------------------------------------------

  async listProducts(): Promise<Product[]> {
    const { rows } = await this.pool.query("select * from products order by created_at desc");
    return rows.map(rowToProduct);
  }

  async getProduct(id: string): Promise<Product | null> {
    const { rows } = await this.pool.query("select * from products where id = $1", [id]);
    return rows[0] ? rowToProduct(rows[0]) : null;
  }

  async createProduct(input: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const { rows } = await this.pool.query(
      `insert into products (name, description, price_usdc, image_url, inventory, variants)
       values ($1, $2, $3, $4, $5, $6) returning *`,
      [input.name, input.description, input.priceUsdc, input.imageUrl ?? null, input.inventory, input.variants ? JSON.stringify(input.variants) : null]
    );
    return rowToProduct(rows[0]);
  }

  async updateProduct(id: string, patch: Partial<Omit<Product, "id" | "createdAt">>): Promise<Product | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    const map: Record<string, unknown> = {
      name: patch.name,
      description: patch.description,
      price_usdc: patch.priceUsdc,
      image_url: patch.imageUrl,
      inventory: patch.inventory,
      variants: patch.variants ? JSON.stringify(patch.variants) : undefined,
    };
    for (const [col, val] of Object.entries(map)) {
      if (val !== undefined) {
        fields.push(`${col} = $${i++}`);
        values.push(val);
      }
    }
    if (fields.length === 0) return this.getProduct(id);

    values.push(id);
    const { rows } = await this.pool.query(
      `update products set ${fields.join(", ")} where id = $${i} returning *`,
      values
    );
    return rows[0] ? rowToProduct(rows[0]) : null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.pool.query("delete from products where id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // --- Orders ---------------------------------------------------------------

  async listOrders(): Promise<Order[]> {
    const { rows } = await this.pool.query("select * from orders order by created_at desc");
    return rows.map(rowToOrder);
  }

  async getOrder(id: `0x${string}`): Promise<Order | null> {
    const { rows } = await this.pool.query("select * from orders where id = $1", [hexToBuffer(id)]);
    return rows[0] ? rowToOrder(rows[0]) : null;
  }

  async getOrdersByBuyer(buyer: `0x${string}`): Promise<Order[]> {
    const { rows } = await this.pool.query(
      "select * from orders where lower(buyer_address) = lower($1) order by created_at desc",
      [buyer]
    );
    return rows.map(rowToOrder);
  }

  /**
   * Uses SELECT ... FOR UPDATE to lock the relevant product rows for the
   * duration of the transaction — this is the real fix for the race the
   * file store could only handle by being single-process. Two concurrent
   * checkouts for the last unit now serialize instead of racing.
   */
  async createOrder(
    orderId: `0x${string}`,
    items: OrderItem[],
    shippingAddress?: Order["shippingAddress"],
    email?: string
  ): Promise<Order> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      let total = 0n;
      for (const item of items) {
        const { rows } = await client.query(
          "select price_usdc, inventory, name from products where id = $1 for update",
          [item.productId]
        );
        const product = rows[0];
        if (!product) throw new Error(`Unknown product: ${item.productId}`);
        if (product.inventory < item.quantity) {
          throw new Error(`Insufficient inventory for ${product.name}`);
        }
        total += BigInt(product.price_usdc) * BigInt(item.quantity);
      }

      for (const item of items) {
        await client.query("update products set inventory = inventory - $1 where id = $2", [
          item.quantity,
          item.productId,
        ]);
      }

      const { rows } = await client.query(
        `insert into orders (id, items, amount, status, shipping_address, email)
         values ($1, $2, $3, 'pending', $4, $5) returning *`,
        [
          hexToBuffer(orderId),
          JSON.stringify(items),
          total.toString(),
          shippingAddress ? JSON.stringify(shippingAddress) : null,
          email ?? null,
        ]
      );

      await client.query("commit");
      return rowToOrder(rows[0]);
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
  }

  async markPaid(args: {
    orderId: `0x${string}`;
    buyer: `0x${string}`;
    paidAmount: bigint;
    txHash: `0x${string}`;
    blockNumber: bigint;
  }): Promise<Order | null> {
    const existing = await this.getOrder(args.orderId);
    if (!existing) return null;
    if (existing.txHash === args.txHash) return existing; // already applied — idempotent

    const expected = BigInt(existing.amount);
    const status: Order["status"] =
      args.paidAmount === expected ? "paid" : args.paidAmount > expected ? "overpaid" : "underpaid";

    const { rows } = await this.pool.query(
      `update orders
       set status = $1, buyer_address = $2, tx_hash = $3, block_number = $4, paid_at = now()
       where id = $5 returning *`,
      [status, args.buyer, args.txHash, args.blockNumber.toString(), hexToBuffer(args.orderId)]
    );
    return rowToOrder(rows[0]);
  }

  async cancelOrder(orderId: `0x${string}`): Promise<Order | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const { rows } = await client.query("select * from orders where id = $1 for update", [
        hexToBuffer(orderId),
      ]);
      const order = rows[0] ? rowToOrder(rows[0]) : null;
      if (!order) {
        await client.query("rollback");
        return null;
      }
      if (order.status !== "pending") {
        await client.query("rollback");
        return order;
      }

      for (const item of order.items) {
        await client.query("update products set inventory = inventory + $1 where id = $2", [
          item.quantity,
          item.productId,
        ]);
      }
      const { rows: updated } = await client.query(
        "update orders set status = 'cancelled' where id = $1 returning *",
        [hexToBuffer(orderId)]
      );
      await client.query("commit");
      return rowToOrder(updated[0]);
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
  }

  async expirePendingOrders(maxAgeMs: number): Promise<`0x${string}`[]> {
    const client = await this.pool.connect();
    const expired: `0x${string}`[] = [];
    try {
      await client.query("begin");
      const cutoff = new Date(Date.now() - maxAgeMs).toISOString();
      const { rows } = await client.query(
        "select * from orders where status = 'pending' and created_at <= $1 for update",
        [cutoff]
      );

      for (const row of rows) {
        const order = rowToOrder(row);
        for (const item of order.items) {
          await client.query("update products set inventory = inventory + $1 where id = $2", [
            item.quantity,
            item.productId,
          ]);
        }
        await client.query("update orders set status = 'cancelled' where id = $1", [row.id]);
        expired.push(order.id);
      }

      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
    return expired;
  }
}
