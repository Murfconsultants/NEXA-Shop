"use client";

import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className="border border-border px-4 text-body-sm text-fg transition-colors hover:border-border-hover"
      style={{ height: 32 }}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
