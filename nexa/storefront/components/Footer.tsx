export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-xs text-slate sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display tracking-widest">NEXA</span>
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-display tabular">
          <span>
            NETWORK <span className="text-paper">Arc Testnet</span>
          </span>
          <span>
            ASSET <span className="text-paper">USDC</span>
          </span>
          <span>
            SETTLEMENT <span className="text-settle">On-chain</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
