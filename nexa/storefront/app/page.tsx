import Image from "next/image";
import { api } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await api.listProducts();

  return (
    <main>
      <section className="flex flex-col items-center gap-13 px-4 pb-24 pt-24 text-center">
        <div className="relative h-[160px] w-full max-w-[560px] sm:h-[220px]">
          <Image
            src="/nexa-logo.jpg"
            alt="NEXA"
            fill
            sizes="560px"
            priority
            className="object-contain"
          />
        </div>
        <p className="max-w-md text-body font-light text-muted">
          Goods, settled in USDC — finalized on Arc.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-32">
        <h2 className="mb-13 text-h3">Shop</h2>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
