import Link from "next/link";
import { AlertCircle, BanknoteArrowDown, PiggyBank, ShoppingBag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { formatRupiah } from "@/lib/currency";
import { getDailySummaryText, getInsightData } from "@/lib/analytics";
import { getRequiredUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { getDemoInsights, isDemoModeEnabled } from "@/lib/demo";

export default async function DashboardPage() {
  const insight = isDemoModeEnabled()
    ? getDemoInsights()
    : await (async () => {
        const user = await getRequiredUser();
        const supabase = await getServerSupabase();
        return getInsightData(supabase, user.id);
      })();
  const cashFlow = insight.totalPenjualanHariIni - Math.max(0, insight.totalPenjualanHariIni - insight.totalUntungHariIni);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Ringkasan Hari Ini</h1>
      <div className="grid grid-cols-1 gap-3">
        <StatCard
          title="Total penjualan hari ini"
          value={formatRupiah(insight.totalPenjualanHariIni)}
          icon={<ShoppingBag className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Estimasi untung hari ini"
          value={formatRupiah(insight.totalUntungHariIni)}
          icon={<PiggyBank className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          title="Cash flow hari ini"
          value={formatRupiah(cashFlow)}
          icon={<BanknoteArrowDown className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Produk terlaris"
          value={insight.produkTerlaris}
          hint={
            insight.jumlahProdukTerlaris > 0
              ? `${insight.jumlahProdukTerlaris} terjual hari ini`
              : "Belum ada produk terjual"
          }
          icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
        />
      </div>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notifikasi sederhana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insight.notifikasi.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-2xl bg-zinc-50 p-3">
              <AlertCircle className="h-4 w-4 text-zinc-500" />
              <p className="text-sm">{item}</p>
            </div>
          ))}
          {insight.stokMenipis.length > 0 ? (
            <div className="rounded-2xl bg-red-50 p-3">
              <p className="mb-2 text-sm font-medium text-red-700">Stok hampir habis</p>
              <div className="flex flex-wrap gap-2">
                {insight.stokMenipis.map((product) => (
                  <Badge key={product.name} variant="secondary" className="rounded-xl bg-white">
                    {product.name} ({product.stock})
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-green-50 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-green-700">Ringkasan harian otomatis</p>
          <p className="mt-1 text-sm text-green-800">{getDailySummaryText(insight)}</p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-emerald-50 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-emerald-700">Saran pintar (placeholder AI)</p>
          <p className="mt-1 text-sm text-emerald-800">
            Coba bundling produk terlaris dengan minuman untuk naikkan margin.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="grid grid-cols-2 gap-2 p-3">
          <Link href="/pembayaran" className="rounded-2xl bg-zinc-900 p-3 text-center text-sm font-medium text-white">
            Pembayaran
          </Link>
          <Link href="/pembiayaan" className="rounded-2xl bg-green-600 p-3 text-center text-sm font-medium text-white">
            Pinjaman
          </Link>
          <Link href="/supplier" className="rounded-2xl bg-orange-500 p-3 text-center text-sm font-medium text-white">
            Supplier
          </Link>
          <Link href="/admin" className="rounded-2xl bg-indigo-600 p-3 text-center text-sm font-medium text-white">
            Admin
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
