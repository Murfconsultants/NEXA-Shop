import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

// "Default: #D4D4D8 border, #FFFFFF fill." "Hover: #A1A1AA border."
// "Focus: #0A0A0A border" (2px, per "Focus: 2px #0A0A0A border").
// "Error: #DC2626 border." "Disabled: #E5E5E5 border, #F4F4F5 fill."
// "1px border, 0px border radius. 40px tall, 14px Inter 400 font size."
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error = false, className = "", disabled, style, ...props },
  ref
) {
  const stateClass = error
    ? "border-error"
    : "border-border hover:border-border-hover focus:border-fg";

  return (
    <input
      ref={ref}
      disabled={disabled}
      style={{ height: 40, ...style }}
      className={`bg-surface px-3 text-body-sm text-fg placeholder:text-muted border focus:border-2 focus:outline-none ${stateClass} disabled:border-disabled-border disabled:bg-disabled-bg disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
});
