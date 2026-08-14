"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatUsdc, type ApiOrder } from "@/lib/api";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .getMyOrders()
      .then((o) => {
        setOrders(o);
        setSignedIn(true);
      })
      .catch(() => setSignedIn(false));
  }, []);

  if (signedIn === null) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-sm text-slate">Loading…</p>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-2 font-display text-sm tracking-widest text-slate">ORDER HISTORY</h1>
        <p className="text-sm text-slate">
          Sign in with Ethereum (top right) to see your past orders.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 font-display text-sm tracking-widest text-slate">ORDER HISTORY</h1>
      {orders && orders.length === 0 ? (
        <p className="text-sm text-slate">No orders yet.</p>
      ) : (
        <div className="flex flex-col">
          {orders?.map((order) => (
            <Link
              key={order.id}
              href={`/checkout/${order.id}`}
              className="flex items-center justify-between border-b border-hairline py-4 text-sm transition-colors hover:bg-panel"
            >
              <span className="font-display text-xs tabular text-slate">
                {order.id.slice(0, 10)}…{order.id.slice(-6)}
              </span>
              <span className="font-display tabular">{formatUsdc(order.amount)} USDC</span>
              <StatusPill status={order.status} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function StatusPill({ status }: { status: ApiOrder["status"] }) {
  const styles: Record<ApiOrder["status"], string> = {
    pending: "text-slate",
    paid: "text-settle",
    underpaid: "text-red-400",
    overpaid: "text-amber-400",
    cancelled: "text-slate",
  };
  return (
    <span className={`font-display text-xs tracking-wide ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}
