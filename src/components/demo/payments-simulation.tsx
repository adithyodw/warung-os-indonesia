"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function PaymentsSimulation() {
  const { state, paymentsStats, activeWarungId } = useDemoSim();
  const warungName = state.warungs.find((w) => w.id === activeWarungId)?.name ?? "";

  const recent = state.payments.slice(0, 8);
  const pending = paymentsStats.pending.slice(0, 5);
  const paid = paymentsStats.paid.slice(0, 5);

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pembayaran (Simulasi)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-white p-3">
            <p className="text-xs font-semibold text-zinc-600">Pending</p>
            <p className="mt-1 text-xl font-bold text-zinc-900">{paymentsStats.pending.length}</p>
          </div>
          <div className="rounded-2xl border bg-white p-3">
            <p className="text-xs font-semibold text-zinc-600">Paid</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">{paymentsStats.paid.length}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-3">
          <p className="text-xs font-semibold text-zinc-600">Terakhir</p>
          <div className="mt-2 space-y-2">
            {recent.length === 0 ? (
              <p className="text-sm text-zinc-600">Belum ada pembayaran.</p>
            ) : (
              recent.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {p.method === "qris" ? "QRIS" : "VA"} • {p.reference}
                    </p>
                    <p className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleTimeString("id-ID")}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className="rounded-2xl"
                      variant={p.status === "paid" ? "secondary" : "outline"}
                    >
                      {p.status}
                    </Badge>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">{formatRupiah(p.amount)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-3">
          <p className="text-xs font-semibold text-zinc-600">Ringkasan {warungName}</p>
          <div className="mt-2 space-y-2">
            {paid.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <p className="text-xs text-zinc-600">{p.method === "qris" ? "QRIS" : "VA"}</p>
                <p className="text-xs font-semibold text-zinc-900">{formatRupiah(p.amount)}</p>
              </div>
            ))}
            {pending.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <p className="text-xs text-zinc-600">{p.method === "qris" ? "QRIS" : "VA"}</p>
                <p className="text-xs font-semibold text-zinc-900">{formatRupiah(p.amount)}</p>
              </div>
            ))}
            {paid.length === 0 && pending.length === 0 ? (
              <p className="text-sm text-zinc-600">Belum ada data untuk warung ini.</p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

