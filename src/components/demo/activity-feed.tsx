"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

const KIND_CONFIG: Record<string, { label: string; dot: string }> = {
  sales: { label: "Sales", dot: "bg-zinc-700" },
  payment_pending: { label: "Pembayaran", dot: "bg-amber-400" },
  payment_paid: { label: "Lunas", dot: "bg-emerald-500" },
  stock_low: { label: "Stok rendah", dot: "bg-red-400" },
  supplier_order: { label: "Restock", dot: "bg-blue-400" },
  loan_update: { label: "Lending", dot: "bg-purple-400" },
  ai_insight: { label: "AI", dot: "bg-zinc-400" },
};

function kindConfig(kind: string) {
  return KIND_CONFIG[kind] ?? { label: kind, dot: "bg-zinc-300" };
}

export function ActivityFeed() {
  const { state } = useDemoSim();
  const items = state.activity.slice(0, 14);

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Activity Feed
          </p>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-600" />
            </span>
            <p className="text-[10px] font-semibold text-zinc-500">Live</p>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-zinc-400">Menunggu aktivitas pertama...</p>
        ) : (
          <div className="space-y-0">
            {items.map((it, idx) => {
              const cfg = kindConfig(it.kind);
              return (
                <div key={it.id} className="relative flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />
                    {idx < items.length - 1 && (
                      <div className="mt-0.5 w-px grow bg-zinc-100" />
                    )}
                  </div>

                  <div className="pb-3 pt-0.5">
                    <div className="flex items-baseline gap-2">
                      <p className="text-xs font-semibold text-zinc-900">{it.message}</p>
                      <span className="shrink-0 rounded-full border border-zinc-100 bg-zinc-50 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-500">
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-zinc-400">
                      {new Date(it.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
