import type { SupabaseClient } from "@supabase/supabase-js";

function startOfDay(offsetDays = 0) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetDays);
  return d.toISOString();
}

export async function getLendingMetrics(supabase: SupabaseClient, userId: string) {
  const [last30, prev30, repayments] = await Promise.all([
    supabase
      .from("transactions")
      .select("id,total,created_at")
      .eq("user_id", userId)
      .gte("created_at", startOfDay(30)),
    supabase
      .from("transactions")
      .select("total")
      .eq("user_id", userId)
      .gte("created_at", startOfDay(60))
      .lt("created_at", startOfDay(30)),
    supabase
      .from("loan_repayments")
      .select("status")
      .eq("user_id", userId),
  ]);

  const revenue30 = (last30.data ?? []).reduce((acc, t) => acc + Number(t.total), 0);
  const revenuePrev = (prev30.data ?? []).reduce((acc, t) => acc + Number(t.total), 0);
  const txCount = (last30.data ?? []).length;
  const avgDailyRevenue = revenue30 / 30;
  const growthRate = revenuePrev > 0 ? (revenue30 - revenuePrev) / revenuePrev : 0.1;

  const rows = repayments.data ?? [];
  const paid = rows.filter((row) => row.status === "paid").length;
  const onTimeRepaymentRate = rows.length ? paid / rows.length : 1;

  return {
    avgDailyRevenue,
    transactionCount: txCount,
    growthRate,
    onTimeRepaymentRate,
  };
}
