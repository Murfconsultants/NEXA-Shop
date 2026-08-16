import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "small" | "medium" | "large";

// Height / horizontal padding / font-size / min-width — copied verbatim
// from "Sizes: Small (32px, 16px, 12px, 64px), Medium (40px, 24px, 14px,
// 96px), Large (48px, 32px, 16px, 128px)."
const SIZE_STYLE: Record<Size, { height: number; paddingX: number; minWidth: number }> = {
  small: { height: 32, paddingX: 16, minWidth: 64 },
  medium: { height: 40, paddingX: 24, minWidth: 96 },
  large: { height: 48, paddingX: 32, minWidth: 128 },
};

const SIZE_TEXT_CLASS: Record<Size, string> = {
  small: "text-caption", // 12px
  medium: "text-body-sm", // 14px
  large: "text-body", // 16px
};

// "Primary: #0A0A0A fill, #FAFAFA text, no border."
// "Secondary: transparent fill, #0A0A0A text, 1px #0A0A0A border."
// "Ghost: transparent fill, #0A0A0A text, no border."
// "Destructive: #DC2626 fill, #FAFAFA text, no border."
// "Hover is communicated through background inversion."
const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-fg text-fg-inverse border border-transparent hover:bg-fg-inverse hover:text-fg hover:border-fg",
  secondary: "bg-transparent text-fg border border-fg hover:bg-fg hover:text-fg-inverse",
  ghost: "bg-transparent text-fg border border-transparent hover:bg-fg hover:text-fg-inverse",
  destructive: "bg-error text-[#FAFAFA] border border-transparent hover:opacity-90",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "medium", className = "", style, disabled, ...props },
  ref
) {
  const s = SIZE_STYLE[size];
  return (
    <button
      ref={ref}
      disabled={disabled}
      style={{ height: s.height, paddingLeft: s.paddingX, paddingRight: s.paddingX, minWidth: s.minWidth, ...style }}
      className={`${VARIANT_CLASS[variant]} ${SIZE_TEXT_CLASS[size]} font-normal transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none ${className}`}
      {...props}
    />
  );
});
