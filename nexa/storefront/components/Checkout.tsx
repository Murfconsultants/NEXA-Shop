"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { useCheckout } from "@/hooks/useCheckout";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { arcTestnet } from "@/lib/chains";
import { USDC_DECIMALS } from "@/lib/contracts";

interface CheckoutProps {
  orderId: `0x${string}`;
  /** Raw USDC amount (6 decimals) — quoted by the backend, not computed here. */
  amount: bigint;
  /** Human-readable amount for display, e.g. "24.99". */
  displayAmount: string;
}

export function Checkout({ orderId, amount, displayAmount }: CheckoutProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useUsdcBalance();
  const { status, error, approve, pay, explorerTxUrl } = useCheckout({ orderId, amount });

  const wrongNetwork = isConnected && chainId !== arcTestnet.id;
  const insufficientBalance = balance !== undefined && balance < amount;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-neutral-100">
      <div className="flex items-center justify-between rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
        <span>Arc Testnet — this is test USDC, not real funds.</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">Total due</span>
        <span className="text-2xl font-semibold">{displayAmount} USDC</span>
      </div>

      {!isConnected && (
        <div className="flex flex-col gap-2">
          <ConnectButton />
        </div>
      )}

      {isConnected && wrongNetwork && (
        <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
          Wrong network — switch your wallet to Arc Testnet to continue.
        </div>
      )}

      {isConnected && !wrongNetwork && (
        <>
          {balance !== undefined && (
            <div className="flex items-center justify-between text-sm text-neutral-400">
              <span>Your balance</span>
              <span>{formatUnits(balance, USDC_DECIMALS)} USDC</span>
            </div>
          )}

          {insufficientBalance && status !== "paid" && (
            <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
              Insufficient USDC balance. Get test funds from{" "}
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                faucet.circle.com
              </a>
              .
            </div>
          )}

          {status === "checking-allowance" && (
            <StatusButton disabled>Checking allowance…</StatusButton>
          )}

          {status === "needs-approval" && (
            <StatusButton onClick={approve} disabled={insufficientBalance}>
              Approve {displayAmount} USDC
            </StatusButton>
          )}

          {status === "approving" && <StatusButton disabled>Confirming approval…</StatusButton>}

          {status === "ready-to-pay" && (
            <StatusButton onClick={pay} disabled={insufficientBalance}>
              Pay {displayAmount} USDC
            </StatusButton>
          )}

          {status === "paying" && <StatusButton disabled>Confirming payment…</StatusButton>}

          {status === "paid" && (
            <div className="rounded-md bg-emerald-500/10 px-3 py-3 text-center text-sm text-emerald-400">
              Payment confirmed — order is being processed.
            </div>
          )}

          {status === "error" && error && (
            <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
          )}

          {explorerTxUrl && (
            <a
              href={explorerTxUrl}
              target="_blank"
              rel="noreferrer"
              className="text-center text-xs text-neutral-500 underline"
            >
              View transaction on ArcScan
            </a>
          )}
        </>
      )}
    </div>
  );
}

function StatusButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
    >
      {children}
    </button>
  );
}
