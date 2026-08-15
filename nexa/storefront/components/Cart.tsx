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
      <button onClick={() => setOpen(true)} className="text-body-sm text-muted transition-colors hover:text-fg">
        Cart{count > 0 && <span className="ml-1.5 font-mono text-fg">{count}</span>}
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
    <div className="fixed inset-0 z-50 flex justify-end bg-fg/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col gap-6 border-l border-border bg-bg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-h3">Cart</h2>
          <button onClick={onClose} className="text-body-sm text-muted hover:text-fg">
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-body-sm text-muted">Your cart is empty.</p>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto">
            {items.map((item) => (
              <div
                key={`${item.productId}-${JSON.stringify(item.selectedVariants ?? {})}`}
                className="flex min-h-[48px] items-center justify-between gap-3 border-b border-border py-3 text-body-sm"
              >
                <div>
                  <div>{item.name}</div>
                  {item.selectedVariants && (
                    <div className="text-caption text-muted">
                      {Object.entries(item.selectedVariants)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </div>
                  )}
                  <div className="font-mono text-caption tabular text-muted">
                    {formatUsdc(item.priceUsdc)} USDC each
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) =>
                      setQuantity(item.productId, Number(e.target.value), item.selectedVariants)
                    }
                    className="w-14 border border-border bg-surface px-2 py-1 text-caption tabular"
                  />
                  <button
                    onClick={() => remove(item.productId, item.selectedVariants)}
                    className="text-caption text-muted hover:text-fg"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-border pt-5">
            <div className="flex justify-between text-body-sm">
              <span className="text-muted">Total</span>
              <span className="font-mono tabular">{formatUsdc(total.toString())} USDC</span>
            </div>
            <input
              type="email"
              placeholder="Email for order confirmation"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ height: 40 }}
              className="border border-border bg-surface px-3 text-body-sm placeholder:text-muted focus:border-fg"
            />
            {error && <p className="text-caption text-error">{error}</p>}
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{ height: 48 }}
              className="w-full bg-fg px-8 text-body font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              {loading ? "Starting checkout…" : "Checkout"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
