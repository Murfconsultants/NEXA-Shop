import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    // Full replacement, not extend — the doc's spacing scale (4/8/16/32/48/
    // 64/96/128) does not follow Tailwind's default numeric scale (which is
    // 4px-per-step: gap-3 = 12px by default). Replacing it means every
    // numeric spacing utility in this project is unambiguous: the key IS
    // the doc's space-N name, and it resolves to exactly the doc's px value.
    // Only keys 1,2,3,4,5,6,8,10 exist, matching the doc exactly — there is
    // no space-7 or space-9 in the source, so those keys are intentionally
    // absent rather than guessed at.
    spacing: {
      0: "0px",
      1: "4px", // space-1 — tight inline gaps
      2: "8px", // space-2 — icon-to-label spacing
      3: "16px", // space-3 — standard element gap
      4: "32px", // space-4 — between grouped elements
      5: "48px", // space-5 — section inner padding
      6: "64px", // space-6 — between sections
      8: "96px", // space-8 — major page-level divisions
      10: "128px", // space-10 — hero top/bottom margins
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        fg: "var(--fg)",
        "fg-inverse": "var(--fg-inverse)",
        border: "var(--border)",
        "border-card": "var(--border-card)",
        "border-hover": "var(--border-hover)",
        muted: "var(--muted)",
        "divider-list": "var(--divider-list)",
        "hover-bg": "var(--hover-bg)",
        "disabled-border": "var(--disabled-border)",
        "disabled-bg": "var(--disabled-bg)",
        "archived-text": "var(--archived-text)",
        success: "#16A34A",
        warning: "#CA8A04",
        error: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      // text-hero through text-mono, weights/line-heights copied verbatim
      // from the doc's Typography table.
      fontSize: {
        hero: ["64px", { lineHeight: "1.05", fontWeight: "700" }],
        h1: ["40px", { lineHeight: "1.1", fontWeight: "700" }],
        h2: ["28px", { lineHeight: "1.2", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.65", fontWeight: "300" }],
        "body-sm": ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.5", fontWeight: "400" }],
        mono: ["13px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        full: "0px",
      },
      boxShadow: {
        none: "none",
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
        xl: "none",
      },
      // "Do prioritize loading performance; lazy-load gallery images with
      // simple fade-in transitions." / "Don't use animations or transitions
      // longer than 200ms."
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        fadeIn: "fadeIn 200ms ease-in",
      },
    },
  },
  plugins: [],
};

export default config;
