import { api, formatUsdc } from "@/lib/api";
import { cancelOrder } from "../actions";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orders = await api.listOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return <p className="text-sm text-neutral-500">Order not found.</p>;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-mono text-lg font-semibold">{order.id}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Created {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        {order.status === "pending" && (
          <form action={cancelOrder.bind(null, order.id)}>
            <button className="rounded-md border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950">
              Cancel & restock
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm">
        <Field label="Status" value={order.status} />
        <Field label="Amount" value={`${formatUsdc(order.amount)} USDC`} />
        <Field label="Buyer" value={order.buyerAddress ?? "—"} mono />
        <Field label="Paid at" value={order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"} />
      </div>

      {order.txHash && (
        <a
          href={`https://testnet.arcscan.app/tx/${order.txHash}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-400 underline"
        >
          View transaction on ArcScan
        </a>
      )}

      <div>
        <h2 className="mb-2 text-sm font-medium text-neutral-300">Items</h2>
        <ul className="flex flex-col gap-1 text-sm text-neutral-400">
          {order.items.map((item, i) => (
            <li key={i}>
              {item.quantity} × {item.productId}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={mono ? "font-mono text-xs" : ""}>{value}</div>
    </div>
  );
}
