import { api } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";
import { ReceiptStrip } from "@/components/ReceiptStrip";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await api.listProducts();

  return (
    <main>
      <section className="mx-auto max-w-5xl px-6 pb-12 pt-16 sm:pt-24">
        <h1 className="max-w-2xl font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Goods, settled in USDC.
        </h1>
        <p className="mt-4 max-w-lg text-slate">
          Every order here clears on-chain — real USDC, a receipt anyone can
          verify, no card networks in between.
        </p>
        <div className="mt-8 max-w-xl">
          <ReceiptStrip
            items={[
              { label: "NETWORK", value: "Arc Testnet" },
              { label: "ASSET", value: "USDC" },
              { label: "FINALITY", value: "<1s", emphasize: true },
            ]}
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-6 font-display text-sm tracking-widest text-slate">SHOP</h2>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
