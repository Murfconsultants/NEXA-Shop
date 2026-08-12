"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function cancelOrder(orderId: string) {
  await api.cancelOrder(orderId);
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}
