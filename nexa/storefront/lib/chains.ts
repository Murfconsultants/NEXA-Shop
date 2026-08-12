import { defineChain } from "viem";

/**
 * Defined manually rather than imported from `viem/chains` — support for Arc
 * landed there recently and versions vary. If your installed viem does export
 * `arcTestnet`, feel free to swap to that; keep these values in sync either way.
 * Confirm current values against https://docs.arc.io/arc/references/rpc-endpoints
 * before deploying, since testnet RPC URLs and IDs can change.
 */
export const arcTestnet = defineChain({
  id: 5_042_002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18, // native gas balance is 18 decimals; the ERC-20 view is 6 — see lib/contracts.ts
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network"],
      webSocket: [process.env.NEXT_PUBLIC_ARC_WS_URL ?? "wss://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});
