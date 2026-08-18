"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cartTotalRaw, useCart } from "@/lib/cart";
import { api, formatUsdc } from "@/lib/api";
import { Input } from "./Input";
import { Button } from "./Button";

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function CartButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const items = useCart((s) => s.items);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  if (compact) {
    return (
      <>
        <button onClick={() => setOpen(true)} className="relative flex flex-col items-center gap-1 text-text-secondary">
          <CartIcon />
          {count > 0 && (
            <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {count}
            </span>
          )}
          Cart
        </button>
        {open && <CartDrawer onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Cart"
        className="relative flex h-[36px] w-[36px] items-center justify-center rounded-btn text-text-secondary transition-colors hover:bg-surface hover:text-text"
      >
        <CartIcon />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
            {count}
          </span>
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
  const count = items.reduce((n, i) => n + i.quantity, 0);

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col gap-6 border-l border-border-strong bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-h3">Your cart</h2>
          <button onClick={onClose} aria-label="Close cart" className="text-text-secondary hover:text-text">
            ✕
          </button>
        </div>

        {items.length > 0 && (
          <p className="-mt-4 text-small text-text-secondary">
            {count} {count === 1 ? "item" : "items"}
          </p>
        )}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-h3">Your cart is waiting.</p>
            <p className="text-body text-text-secondary">Discover something worth owning.</p>
            <Button variant="secondary" onClick={onClose}>
              Explore products →
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {items.map((item) => (
              <div
                key={`${item.productId}-${JSON.stringify(item.selectedVariants ?? {})}`}
                className="flex items-start justify-between gap-3 rounded-card border border-border bg-surface-elevated p-4"
              >
                <div>
                  <div className="text-body">{item.name}</div>
                  {item.selectedVariants && (
                    <div className="mt-1 text-micro text-text-secondary">
                      {Object.entries(item.selectedVariants)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </div>
                  )}
                  <div className="mt-2 text-small tabular text-text-secondary">
                    {formatUsdc(item.priceUsdc)} USDC
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) =>
                      setQuantity(item.productId, Number(e.target.value), item.selectedVariants)
                    }
                    className="h-8 w-16 rounded-input border border-border-strong bg-bg px-2 text-small tabular text-text"
                  />
                  <button
                    onClick={() => remove(item.productId, item.selectedVariants)}
                    className="text-micro text-text-secondary hover:text-error"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <div className="flex justify-between text-body">
              <span className="text-text-secondary">Subtotal</span>
              <span className="tabular font-medium">{formatUsdc(total.toString())} USDC</span>
            </div>
            <Input
              type="email"
              placeholder="Email for order confirmation"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-small text-error">{error}</p>}
            <Button variant="primary" size="large" onClick={handleCheckout} disabled={loading} className="w-full">
              {loading ? "Starting checkout…" : "Proceed to checkout"}
            </Button>
            <p className="text-center text-micro text-text-secondary">
              Pay securely with USDC on Arc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
