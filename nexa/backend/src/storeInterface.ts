import type { Order, OrderItem, Product } from "./types.js";

export interface DataStore {
  // Products
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(input: Omit<Product, "id" | "createdAt">): Promise<Product>;
  updateProduct(id: string, patch: Partial<Omit<Product, "id" | "createdAt">>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;

  // Orders
  listOrders(): Promise<Order[]>;
  getOrder(id: `0x${string}`): Promise<Order | null>;
  getOrdersByBuyer(buyer: `0x${string}`): Promise<Order[]>;
  createOrder(
    orderId: `0x${string}`,
    items: OrderItem[],
    shippingAddress?: Order["shippingAddress"],
    email?: string
  ): Promise<Order>;
  markPaid(args: {
    orderId: `0x${string}`;
    buyer: `0x${string}`;
    paidAmount: bigint;
    txHash: `0x${string}`;
    blockNumber: bigint;
  }): Promise<Order | null>;
  cancelOrder(orderId: `0x${string}`): Promise<Order | null>;
  expirePendingOrders(maxAgeMs: number): Promise<`0x${string}`[]>;
}

export function formatUsdc(raw: bigint): string {
  const decimals = 6n;
  const whole = raw / 10n ** decimals;
  const frac = (raw % 10n ** decimals).toString().padStart(6, "0").slice(0, 2);
  return `${whole}.${frac}`;
}
