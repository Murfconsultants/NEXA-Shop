"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatUsdc, type ApiOrder } from "@/lib/api";

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
      <main className="mx-auto max-w-2xl px-6 py-8">
        <p className="text-sm text-neutral-500">Loading…</p>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-2 text-xl font-semibold">Order history</h1>
        <p className="text-sm text-neutral-500">
          Sign in with Ethereum (top right) to see your past orders.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold">Order history</h1>
      {orders && orders.length === 0 ? (
        <p className="text-sm text-neutral-500">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders?.map((order) => (
            <Link
              key={order.id}
              href={`/checkout/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm hover:border-neutral-700"
            >
              <span className="font-mono text-xs">
                {order.id.slice(0, 10)}…{order.id.slice(-6)}
              </span>
              <span>{formatUsdc(order.amount)} USDC</span>
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
    pending: "bg-neutral-700/40 text-neutral-300",
    paid: "bg-emerald-500/15 text-emerald-400",
    underpaid: "bg-red-500/15 text-red-400",
    overpaid: "bg-amber-500/15 text-amber-400",
    cancelled: "bg-neutral-800 text-neutral-500",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status]}`}>{status}</span>;
}
