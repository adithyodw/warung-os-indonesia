"use client";

import { Building2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";
import { useCountUp } from "@/components/demo/use-count-up";

export function DemoAdminOverview() {
  const { state, derived, getWarungAlerts, getWarungTodaySales, setActiveWarungId, activeWarungId } =
    useDemoSim();

  const gmvAnimated = useCountUp(derived.totalGmv, { durationMs: 800 });
  const warungsAnimated = useCountUp(derived.activeWarungs, { durationMs: 500 });

  return (
    <div className="space-y-4">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-3xl border bg-white/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-zinc-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Total GMV
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">
              {formatRupiah(gmvAnimated)}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-400">Akumulasi semua warung</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border bg-white/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-zinc-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Warung Aktif
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">{warungsAnimated}</p>
            <p className="mt-0.5 text-[10px] text-zinc-400">Beroperasi hari ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Warung list */}
      <Card className="rounded-3xl border bg-white/80 shadow-sm">
        <CardContent className="p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Semua Warung
          </p>
          <div className="space-y-2">
            {state.warungs.map((w) => {
              const sales = getWarungTodaySales(w.id);
              const alerts = getWarungAlerts(w.id);
              const lowCount = alerts.length;
              const isActive = w.id === activeWarungId;
              const margin =
                sales.revenue > 0 ? Math.round((sales.profit / sales.revenue) * 100) : 0;

              return (
                <button
                  key={w.id}
                  type="button"
                  className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-md ring-2 ring-zinc-900"
                      : "bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 hover:shadow-md"
                  }`}
                  onClick={() => setActiveWarungId(w.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{w.name}</p>
                      <p
                        className={`mt-0.5 text-[10px] ${
                          isActive ? "text-white/60" : "text-zinc-500"
                        }`}
                      >
                        {w.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums">{formatRupiah(sales.revenue)}</p>
                      <p
                        className={`mt-0.5 text-[10px] tabular-nums ${
                          isActive ? "text-white/60" : "text-zinc-500"
                        }`}
                      >
                        margin {margin}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                        lowCount
                          ? isActive
                            ? "bg-amber-400/20 text-amber-200"
                            : "bg-amber-100 text-amber-800"
                          : isActive
                          ? "bg-emerald-400/20 text-emerald-200"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {lowCount ? `${lowCount} stok rendah` : "Stok aman"}
                    </span>
                    <span
                      className={`text-[9px] ${
                        isActive ? "text-white/40" : "text-zinc-400"
                      }`}
                    >
                      {sales.txCount} transaksi hari ini
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
