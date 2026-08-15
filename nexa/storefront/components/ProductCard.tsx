import Link from "next/link";
import Image from "next/image";
import { formatUsdc, type ApiProduct } from "@/lib/api";

export function ProductCard({ product }: { product: ApiProduct }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col border border-border bg-surface transition-colors hover:border-fg"
    >
      <div className="relative aspect-square overflow-hidden bg-bg">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <span className="text-body-sm">{product.name}</span>
        <span className="font-mono tabular text-muted">{formatUsdc(product.priceUsdc)} USDC</span>
        {product.inventory <= 5 && product.inventory > 0 && (
          <span className="text-caption uppercase tracking-wide text-warning">
            {product.inventory} left
          </span>
        )}
        {product.inventory === 0 && (
          <span className="text-caption uppercase tracking-wide text-muted">Sold out</span>
        )}
      </div>
    </Link>
  );
}
