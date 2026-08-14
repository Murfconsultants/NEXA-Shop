"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweButton } from "./SiweButton";
import { CartButton } from "./Cart";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-medium tracking-tight">
          NEXA
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/account" className="text-slate transition-colors hover:text-paper">
            Orders
          </Link>
          <CartButton />
          <SiweButton />
          <ConnectButton label="Connect wallet" />
        </nav>
      </div>
    </header>
  );
}
