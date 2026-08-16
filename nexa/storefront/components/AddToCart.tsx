"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { ApiProduct } from "@/lib/api";
import { FilterChip } from "./Chip";
import { Button } from "./Button";

export function AddToCart({ product }: { product: ApiProduct }) {
  const add = useCart((s) => s.add);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const missingSelection = (product.variants ?? []).some((group) => !selected[group.name]);

  return (
    <div className="flex flex-col gap-4">
      {product.variants?.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <span className="text-caption font-normal uppercase tracking-wider text-muted">
            {group.name}
          </span>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => (
              <FilterChip
                key={option}
                label={option}
                state={selected[group.name] === option ? "selected" : "default"}
                onClick={() => setSelected((s) => ({ ...s, [group.name]: option }))}
              />
            ))}
          </div>
        </div>
      ))}

      <Button
        variant="primary"
        size="large"
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
        className="w-full"
      >
        {product.inventory === 0 ? "Out of stock" : added ? "Added" : "Add to cart"}
      </Button>
    </div>
  );
}
