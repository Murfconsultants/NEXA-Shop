"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatUsdc, type ApiProduct } from "@/lib/api";

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ApiProduct[] | null>(null);

  useEffect(() => {
    api.listProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const results = products?.filter(
    (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
    >
      <div
        className="w-full max-w-xl animate-scaleIn rounded-modal border border-border-strong bg-surface-elevated p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-small text-text-secondary">What are you looking for?</p>
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="h-[52px] w-full rounded-input border border-border-strong bg-bg px-4 text-body text-text placeholder:text-text-secondary focus:outline-none focus:border-primary"
        />

        <div className="mt-6">
          {products === null ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-12 rounded-card" />
              ))}
            </div>
          ) : q === "" ? (
            <>
              <p className="mb-2 text-micro uppercase tracking-wide text-text-secondary">Trending</p>
              <ul className="flex flex-col gap-1">
                {products.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.id}`}
                      onClick={onClose}
                      className="block rounded-card px-3 py-2 text-body hover:bg-surface"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : results && results.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-card px-3 py-2 hover:bg-surface"
                  >
                    <span className="text-body">{p.name}</span>
                    <span className="text-small tabular text-text-secondary">
                      {formatUsdc(p.priceUsdc)} USDC
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <p className="text-body text-text">No products found.</p>
              <p className="mt-1 text-small text-text-secondary">
                Try another search or browse the full catalog.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
