import { api, formatUsdc } from "@/lib/api";

export default async function OverviewPage() {
  const stats = await api.getStats();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Overview</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total orders" value={stats.totalOrders.toString()} />
        <StatCard label="Pending" value={stats.pendingOrders.toString()} />
        <StatCard label="Paid" value={stats.paidOrders.toString()} />
        <StatCard
          label="Flagged"
          value={stats.flaggedOrders.toString()}
          tone={stats.flaggedOrders > 0 ? "warn" : "default"}
        />
      </div>

      <StatCard
        label="Total revenue"
        value={`${formatUsdc(stats.totalRevenueRaw)} USDC`}
        wide
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Top products">
          {stats.topProducts.length === 0 ? (
            <EmptyState text="No paid orders yet." />
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.topProducts.map((p) => (
                <li key={p.productId} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-neutral-400">{p.unitsSold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Low stock">
          {stats.lowStockProducts.length === 0 ? (
            <EmptyState text="Nothing below the low-stock threshold." />
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.lowStockProducts.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-amber-400">{p.inventory} left</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
  wide = false,
}: {
  label: string;
  value: string;
  tone?: "default" | "warn";
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-neutral-800 bg-neutral-900 p-4 ${wide ? "col-span-full sm:col-span-2" : ""}`}
    >
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tone === "warn" ? "text-amber-400" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-3 text-sm font-medium text-neutral-300">{title}</div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-sm text-neutral-500">{text}</div>;
}
