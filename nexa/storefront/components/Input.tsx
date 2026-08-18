import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error = false, className = "", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`h-[44px] rounded-input border bg-surface px-4 text-body text-text placeholder:text-text-secondary transition-colors focus:outline-none focus:border-primary ${
        error ? "border-error" : "border-border-strong hover:border-text-secondary"
      } ${className}`}
      {...props}
    />
  );
});
