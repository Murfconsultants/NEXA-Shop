import Image from "next/image";

// "Surface Inverse (#0A0A0A): Dark sections, footer" — the doc names the
// footer as an explicit Surface Inverse context, independent of the site's
// light/dark toggle (which is this project's own addition, not in the doc).
// So this uses the literal hexes directly rather than the --bg/--fg tokens,
// which flip with the toggle — the footer stays dark even when the rest of
// the site is in light mode.
export function Footer() {
  return (
    <footer style={{ backgroundColor: "#0A0A0A", color: "#FAFAFA" }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-3 py-5 text-caption sm:flex-row sm:items-center sm:justify-between">
        <div className="relative h-5 w-[80px]">
          <Image src="/nexa-logo.png" alt="NEXA" fill sizes="80px" className="object-contain object-left" />
        </div>
        <span className="font-mono" style={{ color: "#71717A" }}>
          Arc Testnet · USDC · settled on-chain
        </span>
      </div>
    </footer>
  );
}
