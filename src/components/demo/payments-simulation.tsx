"use client";

import { CreditCard, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";
import { useCountUp } from "@/components/demo/use-count-up";

export function PaymentsSimulation() {
  const { state, paymentsStats } = useDemoSim();

  const recent = state.payments.slice(0, 8);
  const paidTotal = paymentsStats.paid.reduce((s, p) => s + p.amount, 0);
  const paidTotalAnimated = useCountUp(paidTotal, { durationMs: 700 });
  const paidCount = useCountUp(paymentsStats.paid.length, { durationMs: 500 });
  const pendingCount = useCountUp(paymentsStats.pending.length, { durationMs: 500 });

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-zinc-700" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Pembayaran
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border bg-zinc-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Volume
            </p>
            <p className="mt-1.5 text-lg font-bold tabular-nums text-zinc-900">
              {formatRupiah(paidTotalAnimated)}
            </p>
          </div>
          <div className="rounded-2xl border bg-emerald-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
              Lunas
            </p>
            <p className="mt-1.5 text-lg font-bold tabular-nums text-emerald-800">{paidCount}</p>
          </div>
          <div className="rounded-2xl border bg-amber-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
              Pending
            </p>
            <p className="mt-1.5 text-lg font-bold tabular-nums text-amber-800">{pendingCount}</p>
          </div>
        </div>

        {/* Transaction list */}
        <div className="rounded-2xl border bg-white p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Transaksi terbaru
          </p>
          {recent.length === 0 ? (
            <p className="text-sm text-zinc-400">Belum ada pembayaran.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">
                        {p.method === "qris" ? "QRIS" : "Transfer VA"}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {new Date(p.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" · "}
                        {p.reference}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        p.status === "paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.status === "paid" ? "Lunas" : "Pending"}
                    </span>
                    <p className="text-xs font-bold tabular-nums text-zinc-900">
                      {formatRupiah(p.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
