"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatUsdc, type ApiProduct } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { Badge } from "./Badge";
import { Button } from "./Button";

// Section 15: image, name, short description, price, availability, badge,
// Arc verification, add-to-cart. Wishlist/rating/fiat-equivalent omitted —
// no real data backs them (no wishlist persistence, no review system, no
// price oracle), and inventing that data is explicitly prohibited.
export function ProductCard({ product }: { product: ApiProduct }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const lowStock = product.inventory > 0 && product.inventory <= 5;
  const soldOut = product.inventory === 0;
  const hasVariants = (product.variants?.length ?? 0) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    if (hasVariants) return; // needs variant selection — let the click fall through to the product page
    e.preventDefault();
    e.stopPropagation();
    add({ productId: product.id, name: product.name, priceUsdc: product.priceUsdc });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-border-strong"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-elevated">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="animate-fadeIn object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          {lowStock && <Badge tone="warning">Limited</Badge>}
          {soldOut && <Badge tone="neutral">Sold out</Badge>}
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="text-body">{product.name}</p>
          <p className="mt-1 text-small text-text-secondary line-clamp-1">{product.description}</p>
        </div>
        <p className="font-mono text-body tabular text-text">
          {formatUsdc(product.priceUsdc)} <span className="text-small text-text-secondary">USDC</span>
        </p>
        <Button variant="secondary" size="small" disabled={soldOut} onClick={handleAddToCart} className="w-full">
          {soldOut ? "Sold out" : added ? "Added ✓" : hasVariants ? "Select options" : "Add to cart"}
        </Button>
      </div>
    </Link>
  );
}
