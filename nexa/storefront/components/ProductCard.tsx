import Link from "next/link";
import Image from "next/image";
import { formatUsdc, type ApiProduct } from "@/lib/api";

export function ProductCard({ product }: { product: ApiProduct }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-800">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="text-sm font-medium">{product.name}</div>
      <div className="text-sm text-neutral-400">{formatUsdc(product.priceUsdc)} USDC</div>
      {product.inventory <= 5 && product.inventory > 0 && (
        <div className="text-xs text-amber-400">Only {product.inventory} left</div>
      )}
      {product.inventory === 0 && <div className="text-xs text-red-400">Out of stock</div>}
    </Link>
  );
}
