const STEPS = ["Review", "Payment", "Confirmed"] as const;

export function CheckoutStepper({ current }: { current: 0 | 1 | 2 }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-[28px] w-[28px] items-center justify-center rounded-full text-micro ${
                i < current
                  ? "bg-success text-black"
                  : i === current
                    ? "bg-primary text-white"
                    : "bg-surface-elevated text-text-secondary"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`text-micro ${i <= current ? "text-text" : "text-text-secondary"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px flex-1 ${i < current ? "bg-success" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
