import { api } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";

export const revalidate = 30; // catalog doesn't need to be real-time

export default async function HomePage() {
  const products = await api.listProducts();
  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Shop</h1>
      <ProductGrid products={products} />
    </main>
  );
}
