"use client";

import { useState } from "react";
import { PAYMENT_RECEIVER_ADDRESS, USDC_ADDRESS } from "@/lib/contracts";

// Section 31: "Collapsed by default." Real, verifiable values only — the
// actual deployed contract addresses this app transacts with, not
// placeholder/example addresses.
export function OnChainInfo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-card border border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-small text-text-secondary"
        aria-expanded={open}
      >
        On-chain details
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open && (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-4 font-mono text-micro">
          <Row label="Network" value="Arc Testnet" />
          <Row label="Payment contract" value={PAYMENT_RECEIVER_ADDRESS || "Not configured"} />
          <Row label="Payment asset" value={USDC_ADDRESS} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-secondary">{label}</span>
      <span className="truncate text-text">{value}</span>
    </div>
  );
}
