"use client";

import { Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";
import { useCountUp } from "@/components/demo/use-count-up";

const RISK_CONFIG = {
  low: { label: "Rendah", bg: "bg-emerald-500", text: "text-emerald-700", track: "bg-emerald-100" },
  medium: { label: "Sedang", bg: "bg-amber-500", text: "text-amber-700", track: "bg-amber-100" },
  high: { label: "Tinggi", bg: "bg-red-500", text: "text-red-700", track: "bg-red-100" },
};

export function LendingSimulation() {
  const { state, activeWarungId } = useDemoSim();
  const loan = state.loans.find((l) => l.warungId === activeWarungId) ?? state.loans[0];
  const risk = RISK_CONFIG[loan.riskLevel] ?? RISK_CONFIG.medium;

  const scoreAnimated = useCountUp(loan.score, { durationMs: 800 });
  const amountAnimated = useCountUp(loan.suggestedAmount, { durationMs: 700 });

  const scorePercent = Math.min(100, Math.max(0, loan.score));

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-zinc-700" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Pembiayaan
          </p>
        </div>

        {/* Score */}
        <div className="rounded-2xl border bg-zinc-50 p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Skor Kredit
              </p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-zinc-900">
                {scoreAnimated}
                <span className="ml-1 text-base font-normal text-zinc-400">/100</span>
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${risk.text} ${risk.track}`}
            >
              Risiko {risk.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className={`mt-3 h-2 w-full overflow-hidden rounded-full ${risk.track}`}>
            <div
              className={`h-2 rounded-full transition-all duration-700 ${risk.bg}`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Rekomendasi pinjaman
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">
            {formatRupiah(amountAnimated)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold text-zinc-700">
              Tenor {loan.tenorDays} hari
            </span>
            <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold text-zinc-700">
              Bunga ~{Math.round(loan.interestRate * 100)}%
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                loan.eligible
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {loan.eligible ? "Eligible" : "Belum eligible"}
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            {loan.eligible
              ? "Warung ini memenuhi syarat untuk mengajukan pinjaman berdasarkan histori transaksi."
              : "Transaksi konsisten selama 14 hari ke depan dapat meningkatkan skor dan eligibilitas."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
