// Real facts only, no fabricated performance numbers — this project's exact
// Arc block-time figure has genuinely never been confirmed against current
// docs, so it's left out rather than guessed at. Testnet status is explicit
// per "make it visually clear rather than pretending it is production data."
export function AnnouncementBar() {
  return (
    <div className="border-b border-border bg-surface py-2 text-center text-micro text-text-secondary">
      <span className="text-highlight">✦</span> Built on Arc Testnet · USDC settlement · Not real
      funds
    </div>
  );
}
