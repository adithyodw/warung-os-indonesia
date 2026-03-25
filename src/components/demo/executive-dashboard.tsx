"use client";

import Link from "next/link";
import { Building2, TrendingUp } from "lucide-react";
import { RevenueLineChart } from "@/components/demo/revenue-line-chart";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

function pct(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function ExecutiveDashboard() {
  const { derived, state, setActiveWarungId } = useDemoSim();

  const series = derived.dailyRevenueSeries.map((d) => ({ date: d.date, revenue: d.revenue }));
  const dayRevenue = state.daily[state.daily.length - 1]?.revenue ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="rounded-3xl border bg-white/80 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-zinc-700">Total GMV</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{formatRupiah(derived.totalGmv)}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
              <Building2 className="h-4 w-4" />
              Real-time simulasi penjualan
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border bg-white/80 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-zinc-700">Active warungs</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{derived.activeWarungs}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
              <TrendingUp className="h-4 w-4" />
              {pct(derived.growthPct)} vs 7 hari sebelumnya
            </div>
          </CardContent>
        </Card>
      </div>

      <RevenueLineChart points={series} />

      <Card className="rounded-3xl border bg-white/80 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-700">Ringkas hari ini</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">{formatRupiah(dayRevenue)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link href="/demo/admin" className="text-sm font-semibold text-zinc-900 underline">
                Lihat admin overview
              </Link>
              <div className="text-xs text-zinc-600">Klik warung untuk detail</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {state.warungs.map((w) => (
              <button
                key={w.id}
                type="button"
                className="rounded-2xl border bg-white px-3 py-3 text-left shadow-sm"
                onClick={() => setActiveWarungId(w.id)}
              >
                <p className="text-sm font-semibold text-zinc-900">{w.name}</p>
                <p className="text-xs text-zinc-600">{w.city}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

