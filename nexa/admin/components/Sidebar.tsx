import Link from "next/link";

const links = [
  { href: "/", label: "Overview" },
  { href: "/orders", label: "Orders" },
  { href: "/products", label: "Products" },
];

export function Sidebar() {
  return (
    <nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-neutral-800 p-4">
      <div className="mb-4 px-2 text-sm font-semibold text-neutral-100">NEXA admin</div>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md px-2 py-1.5 text-sm text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
