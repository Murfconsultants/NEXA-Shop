"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { Input } from "./Input";
import type { ApiProduct } from "@/lib/api";

type Availability = "all" | "in-stock";

// Section 22 filtering — Category/Collections filters omitted (no category
// data exists on products); Availability and search are real, working
// filters against real inventory data.
export function ProductGrid({ products }: { products: ApiProduct[] }) {
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<Availability>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchesAvailability = availability === "all" || p.inventory > 0;
      return matchesQuery && matchesAvailability;
    });
  }, [products, query, availability]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <div className="flex gap-2">
          <FilterChip label="All" active={availability === "all"} onClick={() => setAvailability("all")} />
          <FilterChip
            label="In stock"
            active={availability === "in-stock"}
            onClick={() => setAvailability("in-stock")}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-body text-text">No products found.</p>
          <p className="mt-1 text-small text-text-secondary">
            Try another search or check back soon.
          </p>
        </div>
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

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-[36px] rounded-full border px-4 text-small transition-colors ${
        active
          ? "border-primary bg-primary/15 text-highlight"
          : "border-border-strong text-text-secondary hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}
