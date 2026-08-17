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

export default function DashboardPage() {
  const { address } = useAccount();
  const { isConnected, sessionAddress, checkedSession, loading, error, signIn } = useSiwe();
  const { data: balance } = useUsdcBalance();
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [autoPrompted, setAutoPrompted] = useState(false);

  // Auto-trigger the SIWE signature prompt as soon as a wallet is connected
  // with no existing session — connecting is the whole point of coming to
  // this page, so asking again with a second click is friction, not safety.
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
    <main className="mx-auto max-w-2xl px-3 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h3">Dashboard</h1>
        <Link href="/" className="text-body-sm font-normal text-muted underline hover:text-fg">
          Back to shop
        </Link>
      </div>

      {!isConnected && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-body-sm font-normal text-muted">
            Connect your wallet to view your orders and account details.
          </p>
          <ConnectButton />
        </div>
      )}

      {isConnected && !sessionAddress && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-body-sm font-normal text-muted">
            {loading ? "Check your wallet for a signature request…" : "Sign in with Ethereum to continue."}
          </p>
          {!loading && (
            <Button variant="primary" size="medium" onClick={signIn}>
              Sign in with Ethereum
            </Button>
          )}
          {error && <span className="text-caption font-normal text-error">{error}</span>}
        </div>
      )}

      {sessionAddress && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 border border-border-card bg-surface p-4">
            <div className="flex items-center justify-between text-body-sm font-normal">
              <span className="text-muted">Wallet</span>
              <span className="font-mono text-mono tabular">
                {(address ?? sessionAddress).slice(0, 6)}…{(address ?? sessionAddress).slice(-4)}
              </span>
            </div>
            {balance !== undefined && (
              <div className="flex items-center justify-between text-body-sm font-normal">
                <span className="text-muted">Balance</span>
                <span className="font-mono text-mono tabular">
                  {formatUnits(balance, USDC_DECIMALS)} USDC
                </span>
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-caption font-normal uppercase tracking-wider text-muted">
              Order history
            </h2>
            {orders === null ? (
              <p className="text-body-sm font-normal text-muted">Loading…</p>
            ) : orders.length === 0 ? (
              <p className="text-body-sm font-normal text-muted">No orders yet.</p>
            ) : (
              <div className="flex flex-col">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/checkout/${order.id}`}
                    style={{ minHeight: 48 }}
                    className="flex items-center justify-between gap-3 border-b border-divider-list px-3 text-body-sm font-normal transition-colors hover:bg-hover-bg"
                  >
                    <span className="font-mono text-mono tabular text-muted">
                      {order.id.slice(0, 10)}…{order.id.slice(-6)}
                    </span>
                    <span className="font-mono text-mono tabular">
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
