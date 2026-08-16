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
    <main className="flex min-h-[calc(100vh-160px)] items-center justify-center p-3">
      <Checkout
        orderId={order.id}
        amount={BigInt(order.amount)}
        displayAmount={order.displayAmount}
      />
    </main>
  );
}
