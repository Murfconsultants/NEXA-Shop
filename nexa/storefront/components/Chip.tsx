type Tone = "success" | "warning" | "error" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  error: "bg-error/15 text-error border-error/30",
  neutral: "bg-surface-elevated text-text-secondary border-border-strong",
};

export function StatusChip({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-micro uppercase tracking-wide ${TONE_CLASS[tone]}`}>
      {label}
    </span>
  );
}

export function toneForOrderStatus(status: string): Tone {
  if (status === "paid") return "success";
  if (status === "underpaid") return "error";
  if (status === "overpaid") return "warning";
  if (status === "cancelled") return "neutral";
  return "warning"; // pending
}
