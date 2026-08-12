import Link from "next/link";
import { api, formatUsdc, type AdminOrder } from "@/lib/api";

export default async function OrdersPage() {
  const orders = await api.listOrders();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500">No orders yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Buyer</th>
                <th className="px-4 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-neutral-800 hover:bg-neutral-900/50">
                  <td className="px-4 py-2 font-mono text-xs">
                    <Link href={`/orders/${order.id}`} className="underline">
                      {shorten(order.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-2">{formatUsdc(order.amount)} USDC</td>
                  <td className="px-4 py-2 font-mono text-xs text-neutral-400">
                    {order.buyerAddress ? shorten(order.buyerAddress) : "—"}
                  </td>
                  <td className="px-4 py-2 text-neutral-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: AdminOrder["status"] }) {
  const styles: Record<AdminOrder["status"], string> = {
    pending: "bg-neutral-700/40 text-neutral-300",
    paid: "bg-emerald-500/15 text-emerald-400",
    underpaid: "bg-red-500/15 text-red-400",
    overpaid: "bg-amber-500/15 text-amber-400",
    cancelled: "bg-neutral-800 text-neutral-500",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>{status}</span>
  );
}

function shorten(hex: string) {
  return `${hex.slice(0, 6)}…${hex.slice(-4)}`;
}
