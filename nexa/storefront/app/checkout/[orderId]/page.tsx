import { Checkout } from "@/components/Checkout";
import { api } from "@/lib/api";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await api.getOrder(orderId);

  return (
    <main className="flex min-h-[calc(100vh-140px)] items-center justify-center p-6">
      <Checkout
        orderId={order.id}
        amount={BigInt(order.amount)}
        displayAmount={order.displayAmount}
      />
    </main>
  );
}
