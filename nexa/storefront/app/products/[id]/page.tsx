import Image from "next/image";
import { api, formatUsdc } from "@/lib/api";
import { AddToCart } from "@/components/AddToCart";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await api.getProduct(id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-800">
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
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-neutral-400">{product.description}</p>
          <div className="text-xl font-semibold">{formatUsdc(product.priceUsdc)} USDC</div>
          <AddToCart product={product} />
        </div>
      </div>
    </main>
  );
}
