"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cartTotalRaw, useCart } from "@/lib/cart";
import { api, formatUsdc } from "@/lib/api";

export function CartButton() {
  const [open, setOpen] = useState(false);
  const items = useCart((s) => s.items);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <>
      <button onClick={() => setOpen(true)} className="relative text-sm text-neutral-300">
        Cart
        {count > 0 && (
          <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs">{count}</span>
        )}
      </button>
      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </>
  );
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { items, remove, setQuantity, clear } = useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = cartTotalRaw(items);

  const handleCheckout = async () => {
    setError(null);
    if (!email) {
      setError("Enter an email for your order confirmation.");
      return;
    }
    setLoading(true);
    try {
      const order = await api.createOrder({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          selectedVariants: i.selectedVariants,
        })),
        email,
      });
      clear();
      router.push(`/checkout/${order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col gap-4 bg-neutral-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <button onClick={onClose} className="text-neutral-400">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-neutral-500">Your cart is empty.</p>
        ) : (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {items.map((item) => (
              <div
                key={`${item.productId}-${JSON.stringify(item.selectedVariants ?? {})}`}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div>
                  <div>{item.name}</div>
                  {item.selectedVariants && (
                    <div className="text-xs text-neutral-500">
                      {Object.entries(item.selectedVariants)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </div>
                  )}
                  <div className="text-xs text-neutral-500">{formatUsdc(item.priceUsdc)} USDC each</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) =>
                      setQuantity(item.productId, Number(e.target.value), item.selectedVariants)
                    }
                    className="w-14 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => remove(item.productId, item.selectedVariants)}
                    className="text-xs text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-neutral-800 pt-4">
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span className="font-semibold">{formatUsdc(total.toString())} USDC</span>
            </div>
            <input
              type="email"
              placeholder="Email for order confirmation"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Starting checkout…" : "Checkout"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
