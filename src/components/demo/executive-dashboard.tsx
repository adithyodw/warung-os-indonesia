"use client";

import { Building2, TrendingUp, ArrowUpRight } from "lucide-react";
import { RevenueLineChart } from "@/components/demo/revenue-line-chart";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";
import { useCountUp } from "@/components/demo/use-count-up";

function pct(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function ExecutiveDashboard() {
  const { derived, state, setActiveWarungId } = useDemoSim();

  const series = derived.dailyRevenueSeries.map((d) => ({ date: d.date, revenue: d.revenue }));
  const dayRevenue = state.daily[state.daily.length - 1]?.revenue ?? 0;
  const gmvAnimated = useCountUp(derived.totalGmv, { durationMs: 700 });
  const dayAnimated = useCountUp(dayRevenue, { durationMs: 700 });
  const growthPositive = derived.growthPct >= 0;

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-zinc-50 p-4">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-zinc-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Total GMV
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">
              {formatRupiah(gmvAnimated)}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-400">Akumulasi semua warung</p>
          </div>

          <div className="rounded-2xl border bg-zinc-50 p-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Revenue hari ini
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">
              {formatRupiah(dayAnimated)}
            </p>
            <p
              className={`mt-0.5 text-[10px] font-semibold ${
                growthPositive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {pct(derived.growthPct)} vs 7 hari lalu
            </p>
          </div>
        </div>

        {/* Sub metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Warung aktif
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-zinc-900">
              {derived.activeWarungs}
            </p>
          </div>
          <div className="rounded-2xl border bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Transaksi hari ini
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-zinc-900">
              {state.transactions.filter((t) => t.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}
            </p>
          </div>
        </div>

        {/* Revenue chart */}
        <RevenueLineChart points={series} />

        {/* Warung quick-select */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Pilih warung
          </p>
          <div className="grid grid-cols-1 gap-2">
            {state.warungs.map((w) => (
              <button
                key={w.id}
                type="button"
                className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md"
                onClick={() => setActiveWarungId(w.id)}
              >
                <div>
                  <p className="text-sm font-bold text-zinc-900">{w.name}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{w.city}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
