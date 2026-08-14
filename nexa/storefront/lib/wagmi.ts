import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { arcTestnet } from "./chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!projectId && typeof window !== "undefined") {
  // Client-side-only warning — avoids noisy build/server logs, still tells
  // a developer in the browser console that WalletConnect (the QR-code
  // mobile-wallet flow) won't actually work until a real project ID from
  // cloud.walletconnect.com is set. MetaMask/injected-wallet connections
  // aren't affected by this.
  console.warn(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — WalletConnect will not work. Get a free project ID at https://cloud.walletconnect.com"
  );
}

export const config = getDefaultConfig({
  appName: "NEXA",
  // RainbowKit's getDefaultConfig throws immediately if projectId is falsy,
  // which previously crashed the entire Next.js build (including built-in
  // pages like /_not-found that always statically prerender through the
  // root layout) whenever this env var was unset in a given environment.
  // The placeholder keeps builds/local dev working either way; only real
  // WalletConnect (not injected wallets) needs the real value at runtime.
  projectId: projectId || "00000000000000000000000000000000",
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(
      process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network"
    ),
  },
  ssr: true,
});
