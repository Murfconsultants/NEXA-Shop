"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { api, type ApiProduct } from "@/lib/api";
import { Button } from "./Button";

export function AddToCart({ product }: { product: ApiProduct }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingSelection = (product.variants ?? []).some((group) => !selected[group.name]);
  const soldOut = product.inventory === 0;

  const handleAddToCart = () => {
    add(
      {
        productId: product.id,
        name: product.name,
        priceUsdc: product.priceUsdc,
        selectedVariants: Object.keys(selected).length ? selected : undefined,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // "Buy now" skips the cart entirely — creates a single-item order and
  // goes straight to checkout. Uses the same real order-creation API as the
  // cart flow, just with one item instead of whatever's accumulated in cart.
  const handleBuyNow = async () => {
    setError(null);
    setBuying(true);
    try {
      const order = await api.createOrder({
        items: [
          {
            productId: product.id,
            quantity,
            selectedVariants: Object.keys(selected).length ? selected : undefined,
          },
        ],
      });
      router.push(`/checkout/${order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout");
      setBuying(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {product.variants?.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <span className="text-micro uppercase tracking-wide text-text-secondary">{group.name}</span>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = selected[group.name] === option;
              return (
                <button
                  key={option}
                  onClick={() => setSelected((s) => ({ ...s, [group.name]: option }))}
                  className={`h-[36px] rounded-btn border px-4 text-small transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/15 text-highlight"
                      : "border-border-strong text-text hover:border-text-secondary"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!soldOut && (
        <div className="flex items-center gap-3">
          <span className="text-micro uppercase tracking-wide text-text-secondary">Quantity</span>
          <div className="flex items-center gap-3 rounded-btn border border-border-strong px-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-[36px] w-[36px] items-center justify-center text-text hover:text-primary"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-6 text-center tabular text-body">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.inventory, q + 1))}
              className="flex h-[36px] w-[36px] items-center justify-center text-text hover:text-primary"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          size="large"
          disabled={soldOut || missingSelection}
          onClick={handleAddToCart}
          className="flex-1"
        >
          {soldOut ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
        </Button>
        <Button
          variant="primary"
          size="large"
          disabled={soldOut || missingSelection || buying}
          onClick={handleBuyNow}
          className="flex-1"
        >
          {buying ? "Starting checkout…" : "Buy now"}
        </Button>
      </div>
      {error && <p className="text-small text-error">{error}</p>}

      <div className="flex flex-col gap-2 text-small text-text-secondary">
        <span>✓ Fast checkout on Arc</span>
        <span>✓ Low network fees, paid in USDC</span>
      </div>
    </div>
  );
}
