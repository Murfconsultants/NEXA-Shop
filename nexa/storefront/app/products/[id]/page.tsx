import Link from "next/link";
import Image from "next/image";
import { api, formatUsdc } from "@/lib/api";
import { AddToCart } from "@/components/AddToCart";
import { Badge } from "@/components/Badge";
import { OnChainInfo } from "@/components/OnChainInfo";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await api.getProduct(id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-6 text-small text-text-secondary">
        <Link href="/" className="hover:text-text">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* Gallery — a single real product image; no fabricated thumbnail
            rail, since the data model only carries one image per product. */}
        <div className="relative aspect-square overflow-hidden rounded-feature border border-border bg-surface-elevated">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="animate-fadeIn object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Badge tone="primary">Arc verified ✓</Badge>
          <div>
            <h1 className="text-h1">{product.name}</h1>
            <p className="mt-2 text-body text-text-secondary">{product.description}</p>
          </div>

          <div className="font-mono text-h2 tabular">
            {formatUsdc(product.priceUsdc)} <span className="text-body text-text-secondary">USDC</span>
          </div>

          <AddToCart product={product} />

          <OnChainInfo />
        </div>
      </div>
    </main>
  );
}
