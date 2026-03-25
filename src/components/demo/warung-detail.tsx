"use client";

import { AlertTriangle, Box, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";
import { useCountUp } from "@/components/demo/use-count-up";

export function WarungDetail() {
  const { state, activeWarungId, getWarungTodaySales, getWarungAlerts, setActiveWarungId } =
    useDemoSim();
  const warung = state.warungs.find((w) => w.id === activeWarungId) ?? state.warungs[0];
  const sales = getWarungTodaySales(warung.id);
  const alerts = getWarungAlerts(warung.id);

  const revenueAnimated = useCountUp(sales.revenue, { durationMs: 600 });
  const profitAnimated = useCountUp(sales.profit, { durationMs: 600 });

  return (
    <div className="space-y-4">
      {/* Warung Switcher */}
      <div className="grid grid-cols-3 gap-2">
        {state.warungs.map((w) => {
          const wSales = getWarungTodaySales(w.id);
          const isActive = w.id === activeWarungId;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setActiveWarungId(w.id)}
              className={`rounded-2xl border p-3 text-left transition-all ${
                isActive
                  ? "bg-zinc-900 text-white shadow-md ring-2 ring-zinc-900"
                  : "bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Box className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white/70" : "text-zinc-500"}`} />
                <p className="truncate text-xs font-bold leading-tight">
                  {w.name.replace("Warung ", "")}
                </p>
              </div>
              <p
                className={`mt-0.5 text-[10px] ${
                  isActive ? "text-white/60" : "text-zinc-500"
                }`}
              >
                {w.city}
              </p>
              <p
                className={`mt-1.5 text-xs font-semibold tabular-nums ${
                  isActive ? "text-white" : "text-zinc-700"
                }`}
              >
                {formatRupiah(wSales.revenue)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Stats card */}
      <Card className="rounded-3xl border bg-white/80 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                {warung.name}
              </p>
              <p className="text-xs text-zinc-400">{warung.city}</p>
            </div>
            <Badge variant="outline" className="rounded-full text-[10px]">
              Live
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-zinc-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Penjualan hari ini
              </p>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-zinc-900">
                {formatRupiah(revenueAnimated)}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400">{sales.txCount} transaksi</p>
            </div>
            <div className="rounded-2xl border bg-emerald-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                Estimasi untung
              </p>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-emerald-800">
                {formatRupiah(profitAnimated)}
              </p>
              <p className="mt-0.5 text-[10px] text-emerald-600">margin ~{sales.revenue > 0 ? Math.round((sales.profit / sales.revenue) * 100) : 0}%</p>
            </div>
          </div>

          {/* Top product */}
          <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Produk terlaris
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-900">
                {state.products.find((p) => p.id === sales.topProductId)?.name ?? "—"}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{sales.topQty} unit terjual</p>
            </div>
            <TrendingUp className="h-5 w-5 text-zinc-400" />
          </div>

          {/* Stock alerts */}
          <div className="rounded-2xl border bg-white p-3">
            <div className="mb-2 flex items-center gap-2">
              {alerts.length > 0 ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Status stok
              </p>
            </div>
            {alerts.length === 0 ? (
              <p className="text-xs text-zinc-600">Semua stok dalam kondisi aman.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {alerts.slice(0, 4).map((a) => (
                  <Badge
                    key={a.productId}
                    variant="secondary"
                    className="rounded-xl bg-amber-50 px-2 py-0.5 text-[10px] text-amber-900"
                  >
                    {a.name} ({a.stock})
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
