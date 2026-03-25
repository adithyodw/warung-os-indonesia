"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function DemoAdminOverview() {
  const { state, derived, getWarungAlerts, getWarungTodaySales, setActiveWarungId, activeWarungId } = useDemoSim();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-3xl border bg-white/80 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-zinc-600">Total GMV</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{formatRupiah(derived.totalGmv)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border bg-white/80 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-zinc-600">Warungs</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{derived.activeWarungs}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border bg-white/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Semua warung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {state.warungs.map((w) => {
              const sales = getWarungTodaySales(w.id);
              const alerts = getWarungAlerts(w.id);
              const lowCount = alerts.length;
              const isActive = w.id === activeWarungId;
              return (
                <button
                  key={w.id}
                  type="button"
                  className={`w-full rounded-2xl border p-3 text-left shadow-sm ${
                    isActive ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
                  }`}
                  onClick={() => setActiveWarungId(w.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{w.name}</p>
                      <p className={`mt-1 text-xs ${isActive ? "text-white/70" : "text-zinc-600"}`}>{w.city}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-zinc-900"}`}>
                        {formatRupiah(sales.revenue)}
                      </p>
                      <p className={`mt-1 text-xs ${isActive ? "text-white/70" : "text-zinc-600"}`}>
                        untung {formatRupiah(sales.profit)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      variant={lowCount ? "secondary" : "outline"}
                      className={`rounded-2xl ${isActive ? "bg-white/10 text-white" : ""}`}
                    >
                      {lowCount ? `${lowCount} stok low` : "stok aman"}
                    </Badge>
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

