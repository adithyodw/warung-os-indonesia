"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function LendingSimulation() {
  const { state, activeWarungId } = useDemoSim();
  const loan = state.loans.find((l) => l.warungId === activeWarungId) ?? state.loans[0];
  const riskBadgeVariant = loan.riskLevel === "low" ? "secondary" : loan.riskLevel === "medium" ? "outline" : "destructive";

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pembiayaan (Simulasi)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-2xl border bg-white p-3">
          <p className="text-xs font-semibold text-zinc-600">Skor kredit</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">{loan.score}/100</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={riskBadgeVariant} className="rounded-2xl bg-white">
              Risiko: {loan.riskLevel.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="rounded-2xl">
              Tenor: {loan.tenorDays} hari
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-3">
          <p className="text-xs font-semibold text-zinc-600">Rekomendasi</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">{formatRupiah(loan.suggestedAmount)}</p>
          <p className="mt-1 text-sm text-zinc-600">
            Bunga indikatif sekitar {Math.round(loan.interestRate * 100)}% per skema tenor.
          </p>
          <p className="mt-2 text-sm text-zinc-700">
            {loan.eligible ? "Eligible untuk pengajuan pinjaman sesuai skor." : "Saat ini belum eligible, tapi skor bisa naik dengan transaksi konsisten."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

