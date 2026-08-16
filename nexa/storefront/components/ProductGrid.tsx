"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { Input } from "./Input";
import type { ApiProduct } from "@/lib/api";

export function ProductGrid({ products }: { products: ApiProduct[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="flex flex-col gap-6">
      <Input
        type="search"
        placeholder="Search products…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-body-sm font-normal text-muted">No products match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
