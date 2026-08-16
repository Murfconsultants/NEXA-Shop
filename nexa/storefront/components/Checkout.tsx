"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { useCheckout } from "@/hooks/useCheckout";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { arcTestnet } from "@/lib/chains";
import { USDC_DECIMALS } from "@/lib/contracts";
import { StatusChip, toneForOrderStatus } from "./Chip";
import { Button } from "./Button";

interface CheckoutProps {
  orderId: `0x${string}`;
  amount: bigint;
  displayAmount: string;
}

const STATUS_LABEL: Record<string, string> = {
  idle: "Awaiting wallet",
  "checking-allowance": "Checking allowance",
  "needs-approval": "Approval required",
  approving: "Confirming approval",
  "ready-to-pay": "Ready",
  paying: "Confirming payment",
  paid: "Paid",
  error: "Error",
};

export function Checkout({ orderId, amount, displayAmount }: CheckoutProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useUsdcBalance();
  const { status, error, approve, pay, explorerTxUrl } = useCheckout({ orderId, amount });

  const wrongNetwork = isConnected && chainId !== arcTestnet.id;
  const insufficientBalance = balance !== undefined && balance < amount;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 border border-border-card bg-surface p-5">
      <div className="border border-warning px-3 py-2 text-caption font-normal text-warning">
        Arc Testnet — this is test USDC, not real funds.
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-caption font-normal uppercase tracking-wider text-muted">Total due</span>
        <span className="font-mono text-h2 tabular">{displayAmount} USDC</span>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="font-mono text-mono tabular text-muted">
          {orderId.slice(0, 8)}…{orderId.slice(-6)}
        </span>
        <StatusChip label={STATUS_LABEL[status] ?? status} tone={toneForOrderStatus(status)} />
      </div>

      {!isConnected && <ConnectButton />}

      {isConnected && wrongNetwork && (
        <div className="border border-error px-3 py-2 text-body-sm font-normal text-error">
          Wrong network — switch your wallet to Arc Testnet to continue.
        </div>
      )}

      {isConnected && !wrongNetwork && (
        <>
          {balance !== undefined && (
            <div className="flex items-center justify-between text-body-sm font-normal">
              <span className="text-muted">Your balance</span>
              <span className="font-mono text-mono tabular">
                {formatUnits(balance, USDC_DECIMALS)} USDC
              </span>
            </div>
          )}

          {insufficientBalance && status !== "paid" && (
            <div className="border border-error px-3 py-2 text-body-sm font-normal text-error">
              Insufficient USDC balance. Get test funds from{" "}
              <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="underline">
                faucet.circle.com
              </a>
              .
            </div>
          )}

          {status === "checking-allowance" && (
            <Button variant="primary" size="large" disabled className="w-full">
              Checking allowance…
            </Button>
          )}

          {status === "needs-approval" && (
            <Button variant="primary" size="large" onClick={approve} disabled={insufficientBalance} className="w-full">
              Approve {displayAmount} USDC
            </Button>
          )}

          {status === "approving" && (
            <Button variant="primary" size="large" disabled className="w-full">
              Confirming approval…
            </Button>
          )}

          {status === "ready-to-pay" && (
            <Button variant="primary" size="large" onClick={pay} disabled={insufficientBalance} className="w-full">
              Pay {displayAmount} USDC
            </Button>
          )}

          {status === "paying" && (
            <Button variant="primary" size="large" disabled className="w-full">
              Confirming payment…
            </Button>
          )}

          {status === "paid" && (
            <div className="border border-success px-4 py-4 text-center text-body-sm font-normal text-success">
              Payment confirmed — order is being processed.
            </div>
          )}

          {status === "error" && error && (
            <div className="border border-error px-3 py-2 text-body-sm font-normal text-error">{error}</div>
          )}

          {explorerTxUrl && (
            <a
              href={explorerTxUrl}
              target="_blank"
              rel="noreferrer"
              className="text-center text-caption font-normal text-muted underline hover:text-fg"
            >
              View transaction on ArcScan
            </a>
          )}
        </>
      )}
    </div>
  );
}
