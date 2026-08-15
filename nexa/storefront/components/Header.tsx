"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweButton } from "./SiweButton";
import { CartButton } from "./Cart";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="relative block h-9 w-[130px]">
          <Image
            src="/nexa-logo.png"
            alt="NEXA"
            fill
            sizes="130px"
            priority
            className="object-contain object-left"
          />
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
