interface ReceiptStripItem {
  label: string;
  value: string;
  /** Renders the value in the settle-green accent — reserve for confirmed/live facts. */
  emphasize?: boolean;
}

/**
 * The site's one signature device: a bordered, monospace data strip. Used
 * wherever there's a real payment/network fact to show (the hero's network
 * stats, checkout's order summary) — never as pure decoration.
 */
export function ReceiptStrip({ items }: { items: ReceiptStripItem[] }) {
  return (
    <div className="flex flex-wrap items-stretch border border-hairline bg-panel font-display text-xs">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex flex-1 flex-col gap-1 px-4 py-3 ${
            i > 0 ? "border-l border-hairline" : ""
          }`}
        >
          <span className="tracking-widest text-slate">{item.label}</span>
          <span className={`tabular ${item.emphasize ? "text-settle" : "text-paper"}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
