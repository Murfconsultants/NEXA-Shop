"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSiwe } from "@/hooks/useSiwe";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { USDC_DECIMALS } from "@/lib/contracts";
import { api, formatUsdc, type ApiOrder } from "@/lib/api";
import { StatusChip, toneForOrderStatus } from "@/components/Chip";
import { Button } from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";

export default function DashboardPage() {
  const { address } = useAccount();
  const { isConnected, sessionAddress, checkedSession, loading, error, signIn } = useSiwe();
  const { data: balance } = useUsdcBalance();
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [autoPrompted, setAutoPrompted] = useState(false);

  useEffect(() => {
    if (checkedSession && isConnected && !sessionAddress && !autoPrompted && !loading) {
      setAutoPrompted(true);
      signIn();
    }
  }, [checkedSession, isConnected, sessionAddress, autoPrompted, loading, signIn]);

  useEffect(() => {
    if (sessionAddress) {
      api.getMyOrders().then(setOrders).catch(() => setOrders([]));
    }
  }, [sessionAddress]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-h1">Your NEXA account</h1>
        <Link href="/" className="text-small text-text-secondary underline hover:text-text">
          Back to shop
        </Link>
      </div>

      {!isConnected && (
        <div className="flex flex-col items-start gap-4 rounded-feature border border-border-strong bg-surface-elevated p-8">
          <p className="text-body text-text-secondary">
            Connect your wallet to view your orders and account details.
          </p>
          <ConnectButton />
        </div>
      )}

      {isConnected && !sessionAddress && (
        <div className="flex flex-col items-start gap-4 rounded-feature border border-border-strong bg-surface-elevated p-8">
          <p className="text-body text-text-secondary">
            {loading ? "Check your wallet for a signature request…" : "Sign in with Ethereum to continue."}
          </p>
          {!loading && (
            <Button variant="primary" onClick={signIn}>Sign in with Ethereum</Button>
          )}
          {error && <span className="text-small text-error">{error}</span>}
        </div>
      )}

      {sessionAddress && (
        <div className="flex flex-col gap-8">
          <div className="rounded-feature border border-border-strong bg-surface-elevated p-6">
            <p className="mb-4 text-micro uppercase tracking-wide text-text-secondary">Wallet</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-small text-text-secondary">Address</span>
                <span className="font-mono text-small tabular text-text">
                  {(address ?? sessionAddress).slice(0, 6)}…{(address ?? sessionAddress).slice(-4)}
                </span>
              </div>
              {balance !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-small text-text-secondary">Balance</span>
                  <span className="font-mono text-h3 tabular text-text">
                    {formatUnits(balance, USDC_DECIMALS)} <span className="text-small text-text-secondary">USDC</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-h3">Orders</h2>
            {orders === null ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-[56px] w-full" />
                <Skeleton className="h-[56px] w-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-feature border border-border bg-surface p-8 text-center">
                <p className="text-body text-text-secondary">No orders yet.</p>
                <Link href="/#shop">
                  <Button variant="secondary" size="small" className="mt-4">Explore products →</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/checkout/${order.id}`}
                    className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                  >
                    <span className="font-mono text-micro tabular text-text-secondary">
                      {order.id.slice(0, 10)}…{order.id.slice(-6)}
                    </span>
                    <span className="font-mono text-small tabular text-text">
                      {formatUsdc(order.amount)} USDC
                    </span>
                    <StatusChip label={order.status} tone={toneForOrderStatus(order.status)} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
