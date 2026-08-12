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
    <div className="flex flex-col gap-4">
      {product.variants?.map((group) => (
        <div key={group.name} className="flex flex-col gap-1">
          <span className="text-xs text-neutral-400">{group.name}</span>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => (
              <button
                key={option}
                onClick={() => setSelected((s) => ({ ...s, [group.name]: option }))}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  selected[group.name] === option
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-neutral-700 hover:border-neutral-500"
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
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
      >
        {product.inventory === 0 ? "Out of stock" : added ? "Added!" : "Add to cart"}
      </button>
    </div>
  );
}
