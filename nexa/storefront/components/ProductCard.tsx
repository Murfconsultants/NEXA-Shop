import Link from "next/link";
import Image from "next/image";
import { formatUsdc, type ApiProduct } from "@/lib/api";

export function ProductCard({ product }: { product: ApiProduct }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col gap-4 bg-ink p-6 transition-colors motion-safe:duration-150 hover:bg-panel"
    >
      <div className="relative aspect-square overflow-hidden bg-panel">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover transition-transform motion-safe:duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm">{product.name}</span>
        <span className="font-display text-sm tabular text-slate">
          {formatUsdc(product.priceUsdc)} <span className="text-xs">USDC</span>
        </span>
        {product.inventory <= 5 && product.inventory > 0 && (
          <span className="font-display text-xs tracking-wide text-settle">
            {product.inventory} LEFT
          </span>
        )}
        {product.inventory === 0 && (
          <span className="font-display text-xs tracking-wide text-slate">SOLD OUT</span>
        )}
      </div>
    </Link>
  );
}
