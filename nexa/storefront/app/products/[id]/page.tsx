import Image from "next/image";
import { api, formatUsdc } from "@/lib/api";
import { AddToCart } from "@/components/AddToCart";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await api.getProduct(id);

  return (
    // gap-6 (64px) — "minimum 64px between major sections" applied to the
    // two major blocks of this page (image, details).
    <main className="mx-auto max-w-5xl px-3 py-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden border border-border-card bg-surface">
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
          <div>
            <h1 className="text-h2">{product.name}</h1>
            <p className="mt-3 text-body font-light text-muted">{product.description}</p>
          </div>
          <div className="font-mono text-mono tabular">{formatUsdc(product.priceUsdc)} USDC</div>
          <AddToCart product={product} />
        </div>
      </div>
    </main>
  );
}
