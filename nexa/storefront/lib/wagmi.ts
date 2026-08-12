import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { arcTestnet } from "./chains";

export const config = getDefaultConfig({
  appName: "NEXA",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(
      process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network"
    ),
  },
  ssr: true,
});
