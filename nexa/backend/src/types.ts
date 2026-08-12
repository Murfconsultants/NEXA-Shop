export interface ProductVariantGroup {
  /** e.g. "Size" or "Color" */
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Raw USDC amount, 6 decimals — the only place a price is defined. */
  priceUsdc: string; // stored as string (bigint-safe JSON)
  imageUrl?: string;
  inventory: number;
  /** Display-only variant choices (e.g. Size: S/M/L). Inventory is tracked
   *  at the product level, not per-variant, in this demo — see README. */
  variants?: ProductVariantGroup[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  /** Selected variant options, e.g. { Size: "M", Color: "Black" }. Display-only. */
  selectedVariants?: Record<string, string>;
}

export type OrderStatus = "pending" | "paid" | "underpaid" | "overpaid" | "cancelled";

export interface Order {
  /** bytes32 hex string used on-chain as PaymentReceiver's orderId. */
  id: `0x${string}`;
  items: OrderItem[];
  /** Server-computed total, raw USDC 6-decimal units — never trust a client-supplied total. */
  amount: string;
  displayAmount: string;
  status: OrderStatus;
  buyerAddress?: `0x${string}`;
  txHash?: `0x${string}`;
  blockNumber?: string;
  /** Used for order confirmation emails — collected at checkout, not tied to wallet identity. */
  email?: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  paidAt?: string;
}
