import { useAccount, useReadContract } from "wagmi";
import { USDC_ADDRESS, usdcAbi } from "@/lib/contracts";

/** Returns the connected wallet's USDC balance (raw bigint, 6 decimals). */
export function useUsdcBalance() {
  const { address } = useAccount();

  return useReadContract({
    address: USDC_ADDRESS,
    abi: usdcAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 10_000,
    },
  });
}
