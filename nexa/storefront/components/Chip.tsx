// Shared base: "0px border radius. 12px Inter 400 uppercase tracking 0.05em.
// 28px tall." — 0.05em is Tailwind's `tracking-wider` exactly (tracking-wide
// is 0.025em, which does not match the doc).
const CHIP_BASE = "inline-flex items-center px-3 text-caption font-normal uppercase tracking-wider";
const CHIP_HEIGHT = { height: 28 };

type FilterChipState = "default" | "selected";

// "Default: transparent fill, #71717A text, 1px #D4D4D8 border."
// "Selected: #0A0A0A fill, #FAFAFA text, 1px #0A0A0A border."
// "Hover: #F4F4F5 fill, #0A0A0A text, 1px #A1A1AA border."
export function FilterChip({
  label,
  state,
  onClick,
}: {
  label: string;
  state: FilterChipState;
  onClick?: () => void;
}) {
  const stateClass =
    state === "selected"
      ? "bg-fg text-fg-inverse border-fg"
      : "bg-transparent text-muted border-border hover:bg-hover-bg hover:text-fg hover:border-border-hover";

  return (
    <button
      onClick={onClick}
      style={CHIP_HEIGHT}
      className={`${CHIP_BASE} border transition-colors ${stateClass}`}
    >
      {label}
    </button>
  );
}

type StatusTone = "published" | "draft" | "archived" | "featured" | "error" | "warning";

// "Published: #0A0A0A fill, #FAFAFA text, no border."
// "Draft: transparent fill, #71717A text, 1px #D4D4D8 border."
// "Archived: #F4F4F5 fill, #A1A1AA text, no border."
// "Featured: transparent fill, #0A0A0A text, 1px #0A0A0A border."
// error/warning aren't chip tones the doc defines — they extend Draft's own
// structural pattern (transparent fill, colored text, 1px colored border)
// using the doc's own Color Error/Warning tokens, the same way the doc
// itself reuses Color Error for Input's error-state border elsewhere.
const STATUS_CLASS: Record<StatusTone, string> = {
  published: "bg-fg text-fg-inverse border-transparent",
  draft: "bg-transparent text-muted border-border",
  archived: "bg-hover-bg text-archived-text border-transparent",
  featured: "bg-transparent text-fg border-fg",
  error: "bg-transparent text-error border-error",
  warning: "bg-transparent text-warning border-warning",
};

export function StatusChip({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span style={CHIP_HEIGHT} className={`${CHIP_BASE} border ${STATUS_CLASS[tone]}`}>
      {label}
    </span>
  );
}

export function toneForOrderStatus(status: string): StatusTone {
  if (status === "paid") return "published";
  if (status === "underpaid") return "error";
  if (status === "overpaid") return "warning";
  if (status === "cancelled") return "archived";
  return "draft";
}
