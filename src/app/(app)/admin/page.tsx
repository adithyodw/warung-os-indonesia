import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { getRequiredAdmin } from "@/lib/admin";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function AdminPage() {
  const { user } = await getRequiredAdmin();
  const supabase = await getServerSupabase();

  const [sales, payments, loans, orders] = await Promise.all([
    supabase.from("transactions").select("total,created_at").eq("user_id", user.id),
    supabase.from("payments").select("amount,status").eq("user_id", user.id),
    supabase.from("loans").select("amount,status").eq("user_id", user.id),
    supabase.from("orders").select("total_amount,status").eq("user_id", user.id),
  ]);

  const totalSales = (sales.data ?? []).reduce((acc, s) => acc + Number(s.total), 0);
  const paidPayments = (payments.data ?? [])
    .filter((p) => p.status === "paid")
    .reduce((acc, p) => acc + Number(p.amount), 0);
  const activeLoans = (loans.data ?? []).filter((l) =>
    ["approved", "disbursed"].includes(String(l.status)),
  ).length;
  const pendingOrders = (orders.data ?? []).filter((o) => o.status !== "completed").length;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <p className="text-sm text-zinc-600">Kontrol operasional, pembayaran, pinjaman, dan supplier.</p>
      <div className="grid grid-cols-1 gap-3">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Penjualan</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatRupiah(totalSales)}</CardContent>
        </Card>
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pembayaran Berhasil</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatRupiah(paidPayments)}</CardContent>
        </Card>
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pinjaman Aktif</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{activeLoans}</CardContent>
        </Card>
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order Supplier Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{pendingOrders}</CardContent>
        </Card>
      </div>
    </div>
  );
}
