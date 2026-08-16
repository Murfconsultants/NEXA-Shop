import { api } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await api.listProducts();

  return (
    // space-5 (48px) section inner padding.
    <main className="mx-auto max-w-5xl px-3 py-5">
      <h1 className="mb-6 text-h3">Shop</h1>
      <ProductGrid products={products} />
    </main>
  );
}
