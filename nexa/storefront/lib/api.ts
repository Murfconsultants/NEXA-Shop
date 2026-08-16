const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  priceUsdc: string;
  imageUrl?: string;
  inventory: number;
  variants?: { name: string; options: string[] }[];
}

export interface ApiOrder {
  id: `0x${string}`;
  amount: string;
  displayAmount: string;
  status: "pending" | "paid" | "underpaid" | "overpaid" | "cancelled";
  txHash?: `0x${string}`;
  buyerAddress?: `0x${string}`;
  items: { productId: string; quantity: number }[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    credentials: "include", // send/receive the SIWE session cookie
    cache: "no-store", // never let Next.js's Data Cache serve stale product/order data
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listProducts: () => request<ApiProduct[]>("/api/products"),
  getProduct: (id: string) => request<ApiProduct>(`/api/products/${id}`),

  createOrder: (input: {
    items: { productId: string; quantity: number; selectedVariants?: Record<string, string> }[];
    email?: string;
    shippingAddress?: Record<string, string>;
  }) => request<ApiOrder>("/api/orders", { method: "POST", body: JSON.stringify(input) }),
  getOrder: (id: string) => request<ApiOrder>(`/api/orders/${id}`),
  getMyOrders: () => request<ApiOrder[]>("/api/orders/mine"),

  getNonce: () => request<{ nonce: string }>("/api/auth/nonce"),
  verifySiwe: (message: string, signature: string) =>
    request<{ address: string }>("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ message, signature }),
    }),
  getSession: () => request<{ address: string | null }>("/api/auth/session"),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
};

/** Raw USDC (6 decimals) → display string. */
export function formatUsdc(raw: string): string {
  const value = BigInt(raw);
  const whole = value / 1_000_000n;
  const frac = (value % 1_000_000n).toString().padStart(6, "0").slice(0, 2);
  return `${whole}.${frac}`;
}
