"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatUsdc, type ApiOrder } from "@/lib/api";
import { StatusChip, toneForStatus } from "@/components/StatusChip";

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
      <main className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-body-sm text-muted">Loading…</p>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="mb-2 text-h3">Order history</h1>
        <p className="text-body-sm text-muted">
          Sign in with Ethereum (top right) to see your past orders.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-13 text-h3">Order history</h1>
      {orders && orders.length === 0 ? (
        <p className="text-body-sm text-muted">No orders yet.</p>
      ) : (
        <div className="flex flex-col">
          {orders?.map((order) => (
            <Link
              key={order.id}
              href={`/checkout/${order.id}`}
              className="flex min-h-[48px] items-center justify-between gap-4 border-b border-border py-3 text-body-sm transition-colors hover:bg-surface"
            >
              <span className="font-mono text-caption tabular text-muted">
                {order.id.slice(0, 10)}…{order.id.slice(-6)}
              </span>
              <span className="font-mono tabular">{formatUsdc(order.amount)} USDC</span>
              <StatusChip label={order.status} tone={toneForStatus(order.status)} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
