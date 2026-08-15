export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-13 text-caption text-muted sm:flex-row sm:items-center sm:justify-between">
        <span className="font-bold tracking-tight text-fg">NEXA</span>
        <span className="font-mono">Arc Testnet · USDC · settled on-chain</span>
      </div>
    </footer>
  );
}
