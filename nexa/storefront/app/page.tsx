import { api } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await api.listProducts();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="mb-13 text-h3">Shop</h1>
      <ProductGrid products={products} />
    </main>
  );
}
