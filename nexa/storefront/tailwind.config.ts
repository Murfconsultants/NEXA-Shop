import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    // Section 7: "Use a consistent 4px spacing system: 4/8/12/16/24/32/48/64/96/128"
    spacing: {
      0: "0px",
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      6: "24px",
      8: "32px",
      12: "48px",
      16: "64px",
      24: "96px",
      32: "128px",
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        primary: "var(--primary)",
        highlight: "var(--highlight)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      // Section 6 type scale.
      fontSize: {
        hero: ["56px", { lineHeight: "1.05", fontWeight: "700", letterSpacing: "-0.02em" }],
        h1: ["48px", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }],
        h2: ["32px", { lineHeight: "1.15", fontWeight: "600" }],
        h3: ["22px", { lineHeight: "1.25", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        micro: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      // Section 8: restrained radius per component type.
      borderRadius: {
        btn: "11px",
        input: "11px",
        card: "16px",
        feature: "22px",
        modal: "24px",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.98)" }, to: { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        fadeIn: "fadeIn 220ms ease-out",
        scaleIn: "scaleIn 220ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
