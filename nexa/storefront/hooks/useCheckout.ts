import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  PAYMENT_RECEIVER_ADDRESS,
  USDC_ADDRESS,
  paymentReceiverAbi,
  usdcAbi,
} from "@/lib/contracts";

export type CheckoutStatus =
  | "idle" // wallet not connected, or amount not known yet
  | "checking-allowance"
  | "needs-approval"
  | "approving" // approve tx submitted, awaiting confirmation
  | "ready-to-pay" // allowance sufficient, pay() not yet called
  | "paying" // pay tx submitted, awaiting confirmation
  | "paid"
  | "error";

interface UseCheckoutArgs {
  /** bytes32 order id, as returned by the backend when the order was created. */
  orderId: `0x${string}`;
  /** Exact amount due, in USDC's raw 6-decimal units — from the backend, never computed client-side. */
  amount: bigint;
}

export function useCheckout({ orderId, amount }: UseCheckoutArgs) {
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: isLoadingAllowance,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: usdcAbi,
    functionName: "allowance",
    args: address ? [address, PAYMENT_RECEIVER_ADDRESS] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { data: existingPayment, refetch: refetchPayment } = useReadContract({
    address: PAYMENT_RECEIVER_ADDRESS,
    abi: paymentReceiverAbi,
    functionName: "getPayment",
    args: [orderId],
    query: { enabled: Boolean(orderId) },
  });

  const approve = useWriteContract();
  const pay = useWriteContract();

  const approveReceipt = useWaitForTransactionReceipt({ hash: approve.data });
  const payReceipt = useWaitForTransactionReceipt({ hash: pay.data });

  // Derive status from on-chain reads + in-flight tx state.
  useEffect(() => {
    if (existingPayment?.paid) {
      setStatus("paid");
      return;
    }
    if (!isConnected) {
      setStatus("idle");
      return;
    }
    if (pay.data && !payReceipt.isSuccess && !payReceipt.isError) {
      setStatus("paying");
      return;
    }
    if (payReceipt.isSuccess) {
      setStatus("paid");
      return;
    }
    if (approve.data && !approveReceipt.isSuccess && !approveReceipt.isError) {
      setStatus("approving");
      return;
    }
    if (isLoadingAllowance || allowance === undefined) {
      setStatus("checking-allowance");
      return;
    }
    setStatus(allowance >= amount ? "ready-to-pay" : "needs-approval");
  }, [
    isConnected,
    existingPayment,
    allowance,
    isLoadingAllowance,
    amount,
    approve.data,
    approveReceipt.isSuccess,
    approveReceipt.isError,
    pay.data,
    payReceipt.isSuccess,
    payReceipt.isError,
  ]);

  // Once an approval confirms, re-check allowance so status moves to ready-to-pay.
  useEffect(() => {
    if (approveReceipt.isSuccess) refetchAllowance();
  }, [approveReceipt.isSuccess, refetchAllowance]);

  // Once a payment confirms, re-check the on-chain receipt.
  useEffect(() => {
    if (payReceipt.isSuccess) refetchPayment();
  }, [payReceipt.isSuccess, refetchPayment]);

  const handleApprove = useCallback(async () => {
    setError(null);
    try {
      await approve.writeContractAsync({
        address: USDC_ADDRESS,
        abi: usdcAbi,
        functionName: "approve",
        args: [PAYMENT_RECEIVER_ADDRESS, amount],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approval failed");
      setStatus("error");
    }
  }, [approve, amount]);

  const handlePay = useCallback(async () => {
    setError(null);
    try {
      await pay.writeContractAsync({
        address: PAYMENT_RECEIVER_ADDRESS,
        abi: paymentReceiverAbi,
        functionName: "pay",
        args: [orderId, amount],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setStatus("error");
    }
  }, [pay, orderId, amount]);

  const explorerTxUrl = useMemo(() => {
    const hash = pay.data ?? approve.data;
    return hash ? `https://testnet.arcscan.app/tx/${hash}` : null;
  }, [pay.data, approve.data]);

  return {
    status,
    error,
    isConnected,
    allowance,
    approveTxHash: approve.data,
    payTxHash: pay.data,
    explorerTxUrl,
    approve: handleApprove,
    pay: handlePay,
  };
}
