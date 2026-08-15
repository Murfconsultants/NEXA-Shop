"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useState } from "react";
import { config } from "@/lib/wagmi";
import { ThemeProvider, useTheme } from "@/lib/theme";

function RainbowKitThemeBridge({ children }: { children: React.ReactNode }) {
  // Monochrome accent, matching the design system's "one accent color" rule —
  // RainbowKit's modal follows the same light/dark state as the rest of the site.
  const { theme } = useTheme();
  const rkTheme =
    theme === "dark"
      ? darkTheme({ accentColor: "#FAFAFA", accentColorForeground: "#0A0A0A" })
      : lightTheme({ accentColor: "#0A0A0A", accentColorForeground: "#FAFAFA" });

  return <RainbowKitProvider theme={rkTheme}>{children}</RainbowKitProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RainbowKitThemeBridge>{children}</RainbowKitThemeBridge>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
