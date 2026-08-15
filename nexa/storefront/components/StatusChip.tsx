type ChipTone = "published" | "draft" | "archived" | "error" | "warning";

const TONE_CLASSES: Record<ChipTone, string> = {
  published: "bg-fg text-bg border-transparent",
  draft: "bg-transparent text-muted border-border",
  archived: "bg-surface text-muted border-transparent",
  error: "bg-transparent text-error border-error",
  warning: "bg-transparent text-warning border-warning",
};

export function StatusChip({ label, tone }: { label: string; tone: ChipTone }) {
  return (
    <span
      className={`inline-flex items-center border px-3 text-caption uppercase tracking-wide ${TONE_CLASSES[tone]}`}
      style={{ height: 28 }}
    >
      {label}
    </span>
  );
}

/** Maps our order/checkout status strings to a chip tone consistently everywhere they appear. */
export function toneForStatus(status: string): ChipTone {
  if (status === "paid") return "published";
  if (status === "underpaid") return "error";
  if (status === "overpaid") return "warning";
  if (status === "cancelled") return "archived";
  return "draft";
}
