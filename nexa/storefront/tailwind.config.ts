import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        panel: "var(--panel)",
        hairline: "var(--hairline)",
        paper: "var(--paper)",
        slate: "var(--slate)",
        settle: "var(--settle)",
      },
      fontFamily: {
        display: ["var(--font-mono)", "ui-monospace", "monospace"],
        body: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
