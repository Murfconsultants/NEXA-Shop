import type { Metadata } from "next";
import { JetBrains_Mono, Work_Sans } from "next/font/google";
import { Providers } from "./providers/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

const sans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NEXA — goods, settled in USDC",
  description: "A store that settles in real USDC, finalized on Arc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body className="font-body bg-ink text-paper">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
