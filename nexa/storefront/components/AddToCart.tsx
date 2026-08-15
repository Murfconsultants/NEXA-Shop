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
    <div className="flex flex-col gap-6">
      {product.variants?.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <span className="text-caption uppercase tracking-wide text-muted">{group.name}</span>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = selected[group.name] === option;
              return (
                <button
                  key={option}
                  onClick={() => setSelected((s) => ({ ...s, [group.name]: option }))}
                  style={{ height: 28 }}
                  className={`border px-4 text-body-sm transition-colors ${
                    isSelected
                      ? "border-fg bg-fg text-bg"
                      : "border-border text-fg hover:border-border-hover"
                  }`}
                >
                  {option}
                </button>
              );
            })}
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
        style={{ height: 48 }}
        className="w-full bg-fg px-8 text-body font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {product.inventory === 0 ? "Out of stock" : added ? "Added" : "Add to cart"}
      </button>
    </div>
  );
}
