"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweButton } from "./SiweButton";
import { CartButton } from "./Cart";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
      <Link href="/" className="text-lg font-semibold">
        NEXA
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/account" className="text-sm text-neutral-400 hover:text-neutral-100">
          Orders
        </Link>
        <CartButton />
        <SiweButton />
        <ConnectButton />
      </div>
    </header>
  );
}
