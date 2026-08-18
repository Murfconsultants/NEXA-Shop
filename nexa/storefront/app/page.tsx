import Link from "next/link";
import Image from "next/image";
import { api, formatUsdc } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await api.listProducts();
  // One dominant hero product, not five competing ones, per the brief.
  const hero = products.find((p) => p.name.toLowerCase().includes("hoodie")) ?? products[0];

  return (
    <main>
      {/* HERO — two-column editorial composition */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 sm:grid-cols-2 sm:py-24">
        <div className="flex flex-col items-start gap-6">
          <Badge tone="primary">Built on Arc</Badge>
          <h1 className="text-hero">
            Commerce
            <br />
            reimagined
            <br />
            on Arc.
          </h1>
          <p className="max-w-md text-body text-text-secondary">
            Premium products. Lightning-fast checkout. Simple ownership powered by Arc.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#shop">
              <Button variant="primary" size="large">Shop now →</Button>
            </Link>
            <Link href="/arc">
              <Button variant="secondary" size="large">Learn about Arc</Button>
            </Link>
          </div>
        </div>

        {hero && (
          <Link href={`/products/${hero.id}`} className="group relative block">
            <div className="relative aspect-square overflow-hidden rounded-feature border border-border-strong bg-surface-elevated">
              {hero.imageUrl && (
                <Image
                  src={hero.imageUrl}
                  alt={hero.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              )}
              <div className="absolute right-4 top-4">
                <Badge tone="primary">Arc verified ✓</Badge>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-body">{hero.name}</p>
                <p className="text-small text-text-secondary">{hero.description}</p>
              </div>
              <p className="font-mono text-body tabular text-text">
                {formatUsdc(hero.priceUsdc)} <span className="text-small text-text-secondary">USDC</span>
              </p>
            </div>
          </Link>
        )}
      </section>

      {/* ARC BENEFITS STRIP — only claims we can actually stand behind */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-8 sm:grid-cols-4">
          <Benefit title="Built on Arc" desc="Secure & scalable" />
          <Benefit title="Fast settlement" desc="Confirmed on-chain" />
          <Benefit title="Low fees" desc="Gas paid in USDC" />
          <Benefit title="USDC" desc="Simple, dollar-denominated" />
        </div>
      </section>

      {/* PRODUCT GRID — one well-presented section rather than several
          redundant ones repeating the same small catalog. */}
      <section id="shop" className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="mb-2 text-h2">Shop the collection</h2>
        <p className="mb-8 text-body text-text-secondary">Find your next favorite thing.</p>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}

function Benefit({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-small font-medium text-text">{title}</span>
      <span className="text-micro text-text-secondary">{desc}</span>
    </div>
  );
}
