"use client";

import { useState } from "react";
import { applyLoanAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/currency";
import { calculateLoanInterest } from "@/lib/lending";

type Props = {
  metrics: {
    avgDailyRevenue: number;
    transactionCount: number;
    growthRate: number;
    onTimeRepaymentRate: number;
  };
  scoring: {
    score: number;
    riskLevel: "low" | "medium" | "high";
    approved: boolean;
    suggestedAmount: number;
  };
  loans: Array<{
    id: string;
    amount: number;
    tenor_days: number;
    interest_rate: number;
    status: string;
    risk_level: string;
    created_at: string;
  }>;
};

export function LendingCenter({ metrics, scoring, loans }: Props) {
  const [amount, setAmount] = useState(scoring.suggestedAmount);
  const [tenor, setTenor] = useState(14);
  const [message, setMessage] = useState("");

  const loanCalc = calculateLoanInterest(amount, tenor);

  async function applyLoan() {
    const result = await applyLoanAction({ amount, tenorDays: tenor });
    setMessage(result.message);
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-2 p-4">
          <h2 className="font-semibold">Skor Kredit Warung</h2>
          <p className="text-sm">Skor: <span className="font-bold">{scoring.score}/100</span></p>
          <p className="text-sm">Risk: <span className="font-bold uppercase">{scoring.riskLevel}</span></p>
          <p className="text-xs text-zinc-500">
            Avg omzet harian {formatRupiah(metrics.avgDailyRevenue)} • transaksi 30 hari: {metrics.transactionCount}
          </p>
          <p className="rounded-xl bg-green-50 p-2 text-sm text-green-700">
            Rekomendasi pinjaman: {formatRupiah(scoring.suggestedAmount)}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">Ajukan pinjaman</h2>
          <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="h-11 rounded-2xl" />
          <div className="grid grid-cols-3 gap-2">
            {[7, 14, 30].map((days) => (
              <Button
                key={days}
                type="button"
                variant={tenor === days ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setTenor(days)}
              >
                {days} hari
              </Button>
            ))}
          </div>
          <p className="text-sm text-zinc-600">
            Estimasi bunga: {Math.round(loanCalc.interestRate * 100)}% • total bayar: {formatRupiah(loanCalc.totalRepayment)}
          </p>
          <Button className="h-12 w-full rounded-2xl text-base" onClick={applyLoan}>
            Ajukan sekarang
          </Button>
          {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-2 p-4">
          <h2 className="font-semibold">Riwayat pinjaman</h2>
          {loans.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada riwayat.</p>
          ) : (
            loans.map((loan) => (
              <div key={loan.id} className="rounded-2xl border p-3">
                <p className="text-sm font-semibold">{formatRupiah(loan.amount)} • {loan.tenor_days} hari</p>
                <p className="text-xs text-zinc-500">
                  status {loan.status} • risk {loan.risk_level} • {new Date(loan.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
