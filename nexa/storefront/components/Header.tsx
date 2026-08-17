"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweButton } from "./SiweButton";
import { CartButton } from "./Cart";
import { ThemeToggle } from "./ThemeToggle";

// Nav chrome kept to plain text links (not bordered buttons) per
// "Do keep UI chrome to an absolute minimum — navigation should nearly
// disappear." — space-3 (16px) padding, border-b using Color Tertiary
// (subtle dividers, borders).
//
// Logo: plain <img> with fixed pixel dimensions rather than next/image's
// `fill` mode — fill depends on the parent resolving a non-zero box before
// paint, which is one more thing that can silently go wrong. A fixed-size
// img has nothing to resolve; it just renders. Wrapped in a permanent dark
// badge since the logo's metallic gray has almost no contrast against the
// light theme's background otherwise (measured ~1.6:1).
export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-3">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center"
          style={{ backgroundColor: "#0A0A0A", padding: "6px 10px" }}
        >
          <img src="/nexa-logo.png" alt="NEXA" width={100} height={28} />
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/dashboard" className="text-body-sm font-normal text-muted transition-colors hover:text-fg">
            Dashboard
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
