// Section 8: "Pills should be reserved for: badges, statuses, tags, small
// metadata" — this is the one fully-rounded component in the system.
type Tone = "neutral" | "primary" | "success" | "warning" | "error";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-surface-elevated text-text-secondary border border-border-strong",
  primary: "bg-primary/15 text-highlight border border-primary/30",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  error: "bg-error/15 text-error border border-error/30",
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-micro uppercase tracking-wide ${TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}
