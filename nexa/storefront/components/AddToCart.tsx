"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { ApiProduct } from "@/lib/api";

export function AddToCart({ product }: { product: ApiProduct }) {
  const add = useCart((s) => s.add);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const missingSelection = (product.variants ?? []).some((group) => !selected[group.name]);

  return (
    <div className="flex flex-col gap-5">
      {product.variants?.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <span className="font-display text-xs tracking-widest text-slate">
            {group.name.toUpperCase()}
          </span>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => (
              <button
                key={option}
                onClick={() => setSelected((s) => ({ ...s, [group.name]: option }))}
                className={`border px-3 py-1.5 text-sm transition-colors ${
                  selected[group.name] === option
                    ? "border-settle text-settle"
                    : "border-hairline text-paper hover:border-slate"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        disabled={product.inventory === 0 || missingSelection}
        onClick={() => {
          add({
            productId: product.id,
            name: product.name,
            priceUsdc: product.priceUsdc,
            selectedVariants: Object.keys(selected).length ? selected : undefined,
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="w-full bg-settle px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-settle/90 disabled:cursor-not-allowed disabled:bg-panel disabled:text-slate"
      >
        {product.inventory === 0 ? "Out of stock" : added ? "Added" : "Add to cart"}
      </button>
    </div>
  );
}
