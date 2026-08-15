"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweButton } from "./SiweButton";
import { CartButton } from "./Cart";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <Link href="/" className="text-h3 font-bold tracking-tight">
          NEXA
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/account" className="text-body-sm text-muted transition-colors hover:text-fg">
            Orders
          </Link>
          <CartButton />
          <SiweButton />
          <ThemeToggle />
          <ConnectButton label="Connect wallet" />
        </nav>
      </div>
    </header>
  );
}
