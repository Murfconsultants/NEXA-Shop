import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "small" | "medium" | "large";

const SIZE_CLASS: Record<Size, string> = {
  small: "h-[36px] px-4 text-small",
  medium: "h-[44px] px-6 text-body",
  large: "h-[52px] px-8 text-body",
};

// Primary = NEXA violet fill (the one place violet dominates a surface).
// Secondary/Ghost = neutral, so the UI stays mostly black/charcoal/white
// per "Do NOT use purple everywhere." Subtle hover elevation, no glow/blur.
const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-highlight active:scale-[0.98]",
  secondary: "bg-surface-elevated text-text border border-border-strong hover:border-primary/50",
  ghost: "bg-transparent text-text-secondary hover:text-text hover:bg-surface",
  destructive: "bg-error text-white hover:opacity-90",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "medium", className = "", disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  );
});
