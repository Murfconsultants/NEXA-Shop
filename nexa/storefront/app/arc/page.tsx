import { Badge } from "@/components/Badge";

// Section 33 — real, verifiable facts only, no invented statistics. This
// page can be more technical than the storefront per the brief.
export default function ArcPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Badge tone="primary">Testnet</Badge>
      <h1 className="mt-4 text-h1">The infrastructure behind NEXA.</h1>
      <p className="mt-4 max-w-xl text-body text-text-secondary">
        NEXA settles payments on Arc, a blockchain built by Circle specifically for
        stablecoin finance. USDC is Arc&apos;s native gas token, so every payment and
        every transaction fee on this site is denominated in the same currency —
        no separate token to hold just to check out.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InfoCard title="Fast" desc="Transactions settle on-chain with deterministic finality." />
        <InfoCard title="Affordable" desc="Network fees are paid directly in USDC — no separate gas token." />
        <InfoCard title="Secure" desc="Built for commerce, with standard EVM-compatible tooling." />
        <InfoCard title="USDC native" desc="Simple, dollar-denominated pricing throughout the store." />
      </div>

      <div className="mt-12 rounded-card border border-warning/30 bg-warning/5 p-4 text-small text-warning">
        This store currently runs on Arc <strong>Testnet</strong>. Purchases use test
        USDC with no real monetary value.
      </div>
    </main>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="text-h3">{title}</p>
      <p className="mt-2 text-small text-text-secondary">{desc}</p>
    </div>
  );
}
