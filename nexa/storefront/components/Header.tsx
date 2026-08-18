"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CartButton } from "./Cart";
import { SearchOverlay } from "./SearchOverlay";

// Only real, working destinations in the nav — no Collections/New Arrivals/
// About placeholders, since those pages don't exist with real content and
// the brief explicitly prohibits dead navigation links.
const NAV_LINKS = [
  { href: "/", label: "Shop" },
  { href: "/arc", label: "Arc" },
];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="inline-flex shrink-0 items-center">
              <img src="/nexa-logo.png" alt="NEXA" width={92} height={26} />
            </Link>
            <nav className="hidden items-center gap-6 sm:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-small transition-colors ${
                    pathname === link.href ? "text-text" : "text-text-secondary hover:text-text"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dashboard"
                className={`text-small transition-colors ${
                  pathname === "/dashboard" ? "text-text" : "text-text-secondary hover:text-text"
                }`}
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden h-[36px] w-[36px] items-center justify-center rounded-btn text-text-secondary transition-colors hover:bg-surface hover:text-text sm:flex"
            >
              <SearchIcon />
            </button>
            <div className="hidden sm:block">
              <CartButton />
            </div>
            {/* Compact wallet control — RainbowKit's own dropdown already shows the
                connected-state truncated address + a clean menu, matching the brief's
                "should NOT dominate the navbar" / "clean dropdown" requirements without
                needing a custom reimplementation of wallet state UI. */}
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus={{ smallScreen: "avatar", largeScreen: "address" }}
            />
          </div>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      <MobileBottomNav />
    </>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function ArcIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

// Section 34: dedicated mobile composition, not a shrunk desktop nav.
// Touch targets are 44px+ per section 34's accessibility requirement.
function MobileBottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/arc", label: "Arc", icon: ArcIcon },
    { href: "/dashboard", label: "Account", icon: AccountIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface sm:hidden">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-1 flex-col items-center gap-1 py-2 text-micro ${
            pathname === href ? "text-primary" : "text-text-secondary"
          }`}
          style={{ minHeight: 44 }}
        >
          <Icon />
          {label}
        </Link>
      ))}
      <div className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-micro text-text-secondary" style={{ minHeight: 44 }}>
        <CartButton compact />
      </div>
    </nav>
  );
}
