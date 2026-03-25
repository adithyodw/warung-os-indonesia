"use client";

import { AlertTriangle, Box, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function WarungDetail() {
  const { state, activeWarungId, getWarungTodaySales, getWarungAlerts, setActiveWarungId } = useDemoSim();
  const warung = state.warungs.find((w) => w.id === activeWarungId) ?? state.warungs[0];
  const sales = getWarungTodaySales(warung.id);
  const alerts = getWarungAlerts(warung.id);

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border bg-white/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Warung: {warung.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs font-semibold text-zinc-600">Penjualan hari ini</p>
              <p className="mt-1 text-xl font-bold text-zinc-900">{formatRupiah(sales.revenue)}</p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs font-semibold text-zinc-600">Estimasi untung</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">{formatRupiah(sales.profit)}</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-600">Produk paling laku (hari ini)</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {state.products.find((p) => p.id === sales.topProductId)?.name ?? "-"}
                </p>
                <p className="mt-1 text-xs text-zinc-600">{sales.topQty} terjual</p>
              </div>
              <TrendingUp className="h-5 w-5 text-zinc-800" />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="text-xs font-semibold text-zinc-600">Alert stok</p>
            </div>
            {alerts.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-600">Stok aman saat ini.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {alerts.slice(0, 4).map((a) => (
                  <Badge key={a.productId} variant="secondary" className="rounded-2xl bg-amber-50 text-amber-900">
                    <span className="font-semibold">{a.name}</span>
                    <span className="ml-2">{a.stock}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border bg-white/80 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-zinc-700">Pilih warung</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {state.warungs.map((w) => (
              <button
                key={w.id}
                type="button"
                className={`rounded-2xl border px-2 py-2 text-left shadow-sm ${
                  w.id === activeWarungId ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
                }`}
                onClick={() => setActiveWarungId(w.id)}
              >
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  <p className="text-xs font-semibold">{w.name.replace("Warung ", "").slice(0, 16)}</p>
                </div>
                <p className={`mt-1 text-[11px] ${w.id === activeWarungId ? "text-white/70" : "text-zinc-600"}`}>
                  {w.city}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

