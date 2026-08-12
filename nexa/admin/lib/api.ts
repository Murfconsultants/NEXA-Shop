import "server-only";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

/**
 * All calls happen in server components / server actions, so `ADMIN_API_KEY`
 * (a plain, non-`NEXT_PUBLIC_` env var) never reaches the browser bundle.
 */
async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ADMIN_API_KEY ?? "",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend request failed (${res.status}): ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  priceUsdc: string;
  imageUrl?: string;
  inventory: number;
}

export interface AdminOrder {
  id: string;
  items: { productId: string; quantity: number }[];
  amount: string;
  displayAmount: string;
  status: "pending" | "paid" | "underpaid" | "overpaid" | "cancelled";
  buyerAddress?: string;
  txHash?: string;
  createdAt: string;
  paidAt?: string;
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  flaggedOrders: number;
  totalRevenueRaw: string;
  lowStockProducts: { id: string; name: string; inventory: number }[];
  topProducts: { productId: string; name: string; unitsSold: number }[];
}

export const api = {
  listProducts: () => adminFetch<AdminProduct[]>("/api/products"),
  createProduct: (input: Omit<AdminProduct, "id">) =>
    adminFetch<AdminProduct>("/api/products", { method: "POST", body: JSON.stringify(input) }),
  updateProduct: (id: string, patch: Partial<Omit<AdminProduct, "id">>) =>
    adminFetch<AdminProduct>(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteProduct: (id: string) => adminFetch<void>(`/api/products/${id}`, { method: "DELETE" }),

  listOrders: () => adminFetch<AdminOrder[]>("/api/admin/orders"),
  cancelOrder: (id: string) => adminFetch<AdminOrder>(`/api/admin/orders/${id}/cancel`, { method: "POST" }),
  getStats: () => adminFetch<AdminStats>("/api/admin/stats"),
};

/** Raw USDC (6 decimals) → display string, e.g. "24990000" -> "24.99". */
export function formatUsdc(raw: string): string {
  const value = BigInt(raw);
  const whole = value / 1_000_000n;
  const frac = (value % 1_000_000n).toString().padStart(6, "0").slice(0, 2);
  return `${whole}.${frac}`;
}
