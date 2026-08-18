import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <img src="/nexa-logo.png" alt="NEXA" width={84} height={24} />
          <p className="max-w-xs text-small text-text-secondary">
            Commerce, reimagined on Arc. Premium products, settled in USDC.
          </p>
        </div>
        <div className="flex gap-12 text-small">
          <div className="flex flex-col gap-2">
            <span className="text-micro uppercase tracking-wide text-text-secondary">Shop</span>
            <Link href="/" className="text-text-secondary hover:text-text">Shop</Link>
            <Link href="/arc" className="text-text-secondary hover:text-text">Arc</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-micro uppercase tracking-wide text-text-secondary">Network</span>
            <span className="font-mono text-micro text-text-secondary">Arc Testnet</span>
            <span className="font-mono text-micro text-text-secondary">USDC settlement</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
