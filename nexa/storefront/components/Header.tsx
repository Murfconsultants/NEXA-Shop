"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweButton } from "./SiweButton";
import { CartButton } from "./Cart";
import { ThemeToggle } from "./ThemeToggle";

// Nav chrome kept to plain text links (not bordered buttons) per
// "Do keep UI chrome to an absolute minimum — navigation should nearly
// disappear." — space-3 (16px) padding, border-b using Color Tertiary
// (subtle dividers, borders).
export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-3">
        <Link
          href="/"
          className="relative block h-9 w-[140px] shrink-0"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          <Image
            src="/nexa-logo.png"
            alt="NEXA"
            fill
            sizes="140px"
            priority
            className="object-contain object-left px-2"
          />
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/account" className="text-body-sm font-normal text-muted transition-colors hover:text-fg">
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
