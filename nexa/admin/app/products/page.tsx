import { api, formatUsdc } from "@/lib/api";
import { deleteProduct, updateInventory, createProduct } from "./actions";
import { ProductForm } from "@/components/ProductForm";
import { ProductImageEditor } from "@/components/ProductImageEditor";

export default async function ProductsPage() {
  const products = await api.listProducts();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Products</h1>
      <p className="-mt-4 text-xs text-neutral-500">Click a thumbnail to upload or change its image.</p>

      <div className="overflow-visible rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-4 py-2 font-medium"></th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Inventory</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-neutral-800">
                <td className="px-4 py-2">
                  <ProductImageEditor productId={product.id} imageUrl={product.imageUrl} />
                </td>
                <td className="px-4 py-2">
                  <div>{product.name}</div>
                  <div className="text-xs text-neutral-500">{product.description}</div>
                </td>
                <td className="px-4 py-2">{formatUsdc(product.priceUsdc)} USDC</td>
                <td className="px-4 py-2">
                  <form
                    action={updateInventory.bind(null, product.id)}
                    className="flex items-center gap-2"
                  >
                    <input
                      name="inventory"
                      type="number"
                      defaultValue={product.inventory}
                      className="w-20 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
                    />
                    <button className="rounded-md bg-neutral-800 px-2 py-1 text-xs hover:bg-neutral-700">
                      Update
                    </button>
                  </form>
                </td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteProduct.bind(null, product.id)}>
                    <button className="text-xs text-red-400 hover:underline">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="max-w-md rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="mb-3 text-sm font-medium text-neutral-300">Add product</h2>
        <ProductForm action={createProduct} />
      </div>
    </div>
  );
}
