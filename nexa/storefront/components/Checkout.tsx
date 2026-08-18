"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { useCheckout } from "@/hooks/useCheckout";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { arcTestnet } from "@/lib/chains";
import { USDC_DECIMALS } from "@/lib/contracts";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { CheckoutStepper } from "./CheckoutStepper";

interface CheckoutProps {
  orderId: `0x${string}`;
  amount: bigint;
  displayAmount: string;
}

export function Checkout({ orderId, amount, displayAmount }: CheckoutProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useUsdcBalance();
  const { status, error, approve, pay, explorerTxUrl } = useCheckout({ orderId, amount });

  const wrongNetwork = isConnected && chainId !== arcTestnet.id;
  const insufficientBalance = balance !== undefined && balance < amount;

  const step: 0 | 1 | 2 = status === "paid" ? 2 : status === "idle" ? 0 : 1;

  if (step === 2) return <ConfirmedPanel displayAmount={displayAmount} orderId={orderId} explorerTxUrl={explorerTxUrl} />;

  return (
    <div className="mx-auto w-full max-w-md">
      <CheckoutStepper current={step} />

      <div className="flex flex-col gap-6 rounded-feature border border-border-strong bg-surface-elevated p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Badge tone="warning">Testnet</Badge>
          <span className="text-micro text-text-secondary">This is test USDC, not real funds.</span>
        </div>

        <div>
          <p className="text-micro uppercase tracking-wide text-text-secondary">Order</p>
          <p className="mt-1 font-mono text-micro text-text-secondary">
            {orderId.slice(0, 10)}…{orderId.slice(-6)}
          </p>
        </div>

        {!isConnected ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-center text-body text-text-secondary">
              Connect your wallet to pay for this order.
            </p>
            <ConnectButton />
          </div>
        ) : wrongNetwork ? (
          <div className="rounded-card border border-error bg-error/10 px-4 py-3 text-small text-error">
            Wrong network — switch your wallet to Arc Testnet to continue.
          </div>
        ) : (
          <>
            {/* Payment breakdown — section 26 */}
            <div className="flex flex-col gap-3 rounded-card border border-border bg-bg p-4">
              {balance !== undefined && (
                <Row label="Available balance" value={`${formatUnits(balance, USDC_DECIMALS)} USDC`} />
              )}
              <Row label="You pay" value={`${displayAmount} USDC`} emphasize />
              <p className="text-micro text-text-secondary">
                Network fee paid separately in USDC — the exact amount is set by your wallet at
                the time of the transaction.
              </p>
              <div className="border-t border-border pt-3">
                <Row label="Total" value={`${displayAmount} USDC`} emphasize />
              </div>
            </div>

            {insufficientBalance && (
              <div className="rounded-card border border-error bg-error/10 px-4 py-3 text-small text-error">
                Insufficient USDC balance. Get test funds from{" "}
                <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="underline">
                  faucet.circle.com
                </a>
                .
              </div>
            )}

            <PaymentAction
              status={status}
              displayAmount={displayAmount}
              insufficientBalance={insufficientBalance}
              approve={approve}
              pay={pay}
            />

            {error && (
              <div className="rounded-card border border-error bg-error/10 px-4 py-3 text-small text-error">
                Payment couldn&apos;t be completed. Your wallet was not charged.
                <div className="mt-1 text-micro text-text-secondary">{error}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PaymentAction({
  status,
  displayAmount,
  insufficientBalance,
  approve,
  pay,
}: {
  status: string;
  displayAmount: string;
  insufficientBalance: boolean;
  approve: () => void;
  pay: () => void;
}) {
  // Section 29: step-by-step transaction UX, mapped to our real on-chain states.
  if (status === "checking-allowance") {
    return <Button variant="primary" size="large" disabled className="w-full">Checking allowance…</Button>;
  }
  if (status === "needs-approval") {
    return (
      <Button variant="primary" size="large" onClick={approve} disabled={insufficientBalance} className="w-full">
        Approve {displayAmount} USDC
      </Button>
    );
  }
  if (status === "approving") {
    return (
      <div className="flex flex-col items-center gap-1 py-2">
        <Button variant="primary" size="large" disabled className="w-full">Confirm in your wallet…</Button>
      </div>
    );
  }
  if (status === "ready-to-pay") {
    return (
      <Button variant="primary" size="large" onClick={pay} disabled={insufficientBalance} className="w-full">
        Pay {displayAmount} USDC →
      </Button>
    );
  }
  if (status === "paying") {
    return (
      <div className="flex flex-col gap-1">
        <Button variant="primary" size="large" disabled className="w-full">Processing transaction…</Button>
        <p className="text-center text-micro text-text-secondary">
          Your payment is being confirmed on Arc.
        </p>
      </div>
    );
  }
  return <Button variant="primary" size="large" disabled className="w-full">Preparing…</Button>;
}

function ConfirmedPanel({
  displayAmount,
  orderId,
  explorerTxUrl,
}: {
  displayAmount: string;
  orderId: string;
  explorerTxUrl: string | null;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <CheckoutStepper current={2} />
      <div className="flex flex-col items-center gap-4 rounded-feature border border-success/30 bg-success/5 p-8 text-center animate-scaleIn">
        <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-success text-2xl text-black">
          ✓
        </div>
        <div>
          <h2 className="text-h2">Payment confirmed</h2>
          <p className="mt-1 text-body text-text-secondary">Your order is officially yours.</p>
        </div>
        <p className="font-mono text-body tabular text-text">{displayAmount} USDC</p>
        <p className="text-micro text-text-secondary">
          Order #{orderId.slice(2, 8).toUpperCase()}
        </p>
        {explorerTxUrl && (
          <a href={explorerTxUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary">View on Arc Explorer →</Button>
          </a>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between text-small">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-mono tabular ${emphasize ? "text-body text-text" : "text-text-secondary"}`}>
        {value}
      </span>
    </div>
  );
}
