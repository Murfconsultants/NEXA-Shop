"use client";

import { useTheme } from "@/lib/theme";
import { Button } from "./Button";

// Secondary variant: "transparent fill, #0A0A0A text, 1px #0A0A0A border."
export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Button variant="secondary" size="small" onClick={toggle} aria-label="Toggle color theme">
      {theme === "dark" ? "Light" : "Dark"}
    </Button>
  );
}
