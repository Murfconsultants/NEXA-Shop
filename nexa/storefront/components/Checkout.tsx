"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { useCheckout } from "@/hooks/useCheckout";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { arcTestnet } from "@/lib/chains";
import { USDC_DECIMALS } from "@/lib/contracts";
import { ReceiptStrip } from "./ReceiptStrip";

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
  paid: "Settled",
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
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 border border-hairline bg-panel p-8">
      <div className="border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-400">
        Arc Testnet — this is test USDC, not real funds.
      </div>

      <div>
        <span className="font-display text-xs tracking-widest text-slate">TOTAL DUE</span>
        <div className="mt-1 font-display text-3xl tabular">
          {displayAmount} <span className="text-base text-slate">USDC</span>
        </div>
      </div>

      <ReceiptStrip
        items={[
          { label: "ORDER", value: `${orderId.slice(0, 8)}…${orderId.slice(-6)}` },
          { label: "NETWORK", value: "Arc Testnet" },
          { label: "STATUS", value: STATUS_LABEL[status] ?? status, emphasize: status === "paid" },
        ]}
      />

      {!isConnected && <ConnectButton />}
      {isConnected && wrongNetwork && (
        <div className="border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-400">
          Wrong network — switch your wallet to Arc Testnet to continue.
        </div>
      )}

      {isConnected && !wrongNetwork && (
        <>
          {balance !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate">Your balance</span>
              <span className="font-display tabular">
                {formatUnits(balance, USDC_DECIMALS)} USDC
              </span>
            </div>
          )}

          {insufficientBalance && status !== "paid" && (
            <div className="border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-400">
              Insufficient USDC balance. Get test funds from{" "}
              <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="underline">
                faucet.circle.com
              </a>
              .
            </div>
          )}

          {status === "checking-allowance" && <StatusButton disabled>Checking allowance…</StatusButton>}

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
            <div className="border border-settle/40 bg-settle/10 px-4 py-4 text-center text-sm text-settle">
              Payment confirmed — order is being processed.
            </div>
          )}

          {status === "error" && error && (
            <div className="border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {explorerTxUrl && (
            <a
              href={explorerTxUrl}
              target="_blank"
              rel="noreferrer"
              className="text-center text-xs text-slate underline hover:text-paper"
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
      className="w-full bg-settle px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-settle/90 disabled:cursor-not-allowed disabled:bg-ink disabled:text-slate"
    >
      {children}
    </button>
  );
}
