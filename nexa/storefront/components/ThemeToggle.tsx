"use client";

import { useTheme } from "@/lib/theme";
import { Button } from "./Button";

// Hand-rolled sun/moon icons (stroke=currentColor) rather than pulling in an
// icon library for two glyphs — keeps this dependency-free.
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

// Secondary variant per the Button spec, but square (icon-only) rather than
// the default min-width text-button sizing.
export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Button
      variant="secondary"
      size="small"
      onClick={toggle}
      aria-label="Toggle color theme"
      style={{ minWidth: 32, paddingLeft: 0, paddingRight: 0 }}
      className="flex items-center justify-center"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
