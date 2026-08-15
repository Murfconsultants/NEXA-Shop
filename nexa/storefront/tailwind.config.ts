import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        border: "var(--border)",
        "border-hover": "var(--border-hover)",
        success: "#16A34A",
        warning: "#CA8A04",
        error: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
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
      spacing: {
        13: "48px",
        16: "64px",
        24: "96px",
        32: "128px",
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
