import Link from "next/link";
import Image from "next/image";
import { formatUsdc, type ApiProduct } from "@/lib/api";

// Card: "#FFFFFF fill, 1px #E5E5E5 border, square, 0px (image bleeds to
// edge) padding, no shadow, Hover: Border shifts to #0A0A0A." Caption
// metadata sits below the image with a space-3 (16px) gap.
export function ProductCard({ product }: { product: ApiProduct }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex flex-col gap-3 border border-border-card bg-surface transition-colors hover:border-fg"
    >
      <div className="relative aspect-square overflow-hidden bg-bg">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="animate-fadeIn object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-1 px-3 pb-3">
        <span className="text-body-sm font-normal">{product.name}</span>
        <span className="font-mono tabular text-muted">{formatUsdc(product.priceUsdc)} USDC</span>
        {product.inventory <= 5 && product.inventory > 0 && (
          <span className="text-caption font-normal uppercase tracking-wider text-warning">
            {product.inventory} left
          </span>
        )}
        {product.inventory === 0 && (
          <span className="text-caption font-normal uppercase tracking-wider text-muted">
            Sold out
          </span>
        )}
      </div>
    </Link>
  );
}
