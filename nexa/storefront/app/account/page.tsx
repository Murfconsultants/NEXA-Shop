"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatUsdc, type ApiOrder } from "@/lib/api";
import { StatusChip, toneForOrderStatus } from "@/components/Chip";

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
      <main className="mx-auto max-w-2xl px-3 py-6">
        <p className="text-body-sm font-normal text-muted">Loading…</p>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-2xl px-3 py-6">
        <h1 className="mb-2 text-h3">Order history</h1>
        <p className="text-body-sm font-normal text-muted">
          Sign in with Ethereum (top right) to see your past orders.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-3 py-6">
      <h1 className="mb-6 text-h3">Order history</h1>
      {orders && orders.length === 0 ? (
        <p className="text-body-sm font-normal text-muted">No orders yet.</p>
      ) : (
        // List: 48px row height, 16px horizontal padding, #F4F4F5 divider,
        // #F4F4F5 hover background, 14px Inter 400 font.
        <div className="flex flex-col">
          {orders?.map((order) => (
            <Link
              key={order.id}
              href={`/checkout/${order.id}`}
              style={{ minHeight: 48 }}
              className="flex items-center justify-between gap-3 border-b border-divider-list px-3 text-body-sm font-normal transition-colors hover:bg-hover-bg"
            >
              <span className="font-mono text-mono tabular text-muted">
                {order.id.slice(0, 10)}…{order.id.slice(-6)}
              </span>
              <span className="font-mono text-mono tabular">{formatUsdc(order.amount)} USDC</span>
              <StatusChip label={order.status} tone={toneForOrderStatus(order.status)} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
