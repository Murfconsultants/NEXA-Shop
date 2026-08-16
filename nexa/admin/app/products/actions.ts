"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const price = String(formData.get("price") ?? "0"); // display units, e.g. "24.99"
  const inventory = Number(formData.get("inventory") ?? 0);
  const imageUrl = String(formData.get("imageUrl") ?? "") || undefined;

  await api.createProduct({
    name,
    description,
    priceUsdc: toRawUsdc(price),
    inventory,
    imageUrl,
  });
  revalidatePath("/products");
}

export async function updateInventory(productId: string, formData: FormData) {
  const inventory = Number(formData.get("inventory") ?? 0);
  await api.updateProduct(productId, { inventory });
  revalidatePath("/products");
}

/**
 * Called directly (not via a <form>) from ProductImageEditor's onChange —
 * Next.js server actions can be invoked as plain async functions from
 * client components, not just as a form's `action` prop.
 */
export async function updateProductImage(productId: string, imageUrl: string) {
  await api.updateProduct(productId, { imageUrl });
  revalidatePath("/products");
}

export async function deleteProduct(productId: string) {
  await api.deleteProduct(productId);
  revalidatePath("/products");
}

/** "24.99" -> "24990000" (raw 6-decimal USDC) */
function toRawUsdc(display: string): string {
  const [whole, frac = ""] = display.split(".");
  const paddedFrac = (frac + "000000").slice(0, 6);
  return (BigInt(whole || "0") * 1_000_000n + BigInt(paddedFrac || "0")).toString();
}
