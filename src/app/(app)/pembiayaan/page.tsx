import { LendingCenter } from "@/components/forms/lending-center";
import { calculateLendingScore } from "@/lib/lending";
import { getRequiredUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { getLendingMetrics } from "@/lib/warung-metrics";

export default async function PembiayaanPage() {
  const user = await getRequiredUser();
  const supabase = await getServerSupabase();

  const metrics = await getLendingMetrics(supabase, user.id);
  const result = calculateLendingScore(metrics);

  const { data: loans } = await supabase
    .from("loans")
    .select("id,amount,tenor_days,interest_rate,score,risk_level,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Pembiayaan Warung</h1>
      <p className="text-sm text-zinc-600">Lihat skor kreditmu dan ajukan pinjaman mikro.</p>
      <LendingCenter
        metrics={metrics}
        scoring={result}
        loans={(loans ?? []).map((loan) => ({
          ...loan,
          amount: Number(loan.amount),
          interest_rate: Number(loan.interest_rate),
          score: Number(loan.score),
          tenor_days: Number(loan.tenor_days),
        }))}
      />
    </div>
  );
}
