import Image from "next/image";
import { api, formatUsdc } from "@/lib/api";
import { AddToCart } from "@/components/AddToCart";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await api.getProduct(id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden border border-border bg-surface">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-h2">{product.name}</h1>
            <p className="mt-3 text-body font-light text-muted">{product.description}</p>
          </div>
          <div className="font-mono text-lg tabular">{formatUsdc(product.priceUsdc)} USDC</div>
          <AddToCart product={product} />
        </div>
      </div>
    </main>
  );
}
