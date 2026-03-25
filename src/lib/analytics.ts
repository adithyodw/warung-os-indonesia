import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { InsightData, Product, Transaction, TransactionItem } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

function startOfTodayIso() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

export async function getInsightData(
  supabase: SupabaseClient,
  userId: string,
): Promise<InsightData> {
  const [transactionsResult, productsResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("id,total,profit,created_at,user_id")
      .eq("user_id", userId)
      .gte("created_at", startOfTodayIso()),
    supabase
      .from("products")
      .select("id,name,stock,cost_price,selling_price,user_id,created_at")
      .eq("user_id", userId)
      .order("name", { ascending: true }),
  ]);

  const transactions = (transactionsResult.data ?? []) as Transaction[];
  const products = (productsResult.data ?? []) as Product[];

  const transactionIds = transactions.map((trx) => trx.id);

  let itemRows: TransactionItem[] = [];
  if (transactionIds.length > 0) {
    const itemsResult = await supabase
      .from("transaction_items")
      .select("id,transaction_id,product_id,name_snapshot,quantity,price,cost,created_at")
      .in("transaction_id", transactionIds);
    itemRows = (itemsResult.data ?? []) as TransactionItem[];
  }

  const totalPenjualanHariIni = transactions.reduce((acc, trx) => acc + Number(trx.total), 0);
  const totalUntungHariIni = transactions.reduce((acc, trx) => acc + Number(trx.profit), 0);
  const stokMenipis = products
    .filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
    .map((product) => ({ name: product.name, stock: product.stock }));

  const qtyByName = itemRows.reduce<Record<string, number>>((acc, item) => {
    const key = item.name_snapshot;
    acc[key] = (acc[key] ?? 0) + item.quantity;
    return acc;
  }, {});

  const sorted = Object.entries(qtyByName).sort((a, b) => b[1] - a[1]);
  const produkTerlaris = sorted[0]?.[0] ?? "Belum ada";
  const jumlahProdukTerlaris = sorted[0]?.[1] ?? 0;

  const notifikasi: string[] = [];
  if (totalPenjualanHariIni === 0) {
    notifikasi.push("Belum ada transaksi hari ini.");
  } else {
    notifikasi.push(`Penjualan hari ini ${totalPenjualanHariIni > 0 ? "berjalan bagus" : "masih sepi"}.`);
  }
  if (stokMenipis.length > 0) {
    notifikasi.push(`Ada ${stokMenipis.length} produk stok hampir habis.`);
  }

  const yesterdayStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayResult = await supabase
    .from("transactions")
    .select("total")
    .eq("user_id", userId)
    .gte("created_at", new Date(yesterdayStart.getFullYear(), yesterdayStart.getMonth(), yesterdayStart.getDate()).toISOString())
    .lt("created_at", startOfTodayIso());
  const yesterdayRevenue = (yesterdayResult.data ?? []).reduce(
    (acc, row) => acc + Number(row.total),
    0,
  );
  if (yesterdayRevenue > 0 && totalPenjualanHariIni < yesterdayRevenue * 0.7) {
    notifikasi.push("Performa turun dibanding kemarin. Cek produk favorit dan promo kecil.");
  }

  return {
    totalPenjualanHariIni,
    totalUntungHariIni,
    produkTerlaris,
    jumlahProdukTerlaris,
    stokMenipis,
    notifikasi,
  };
}

export function getDailySummaryText(insight: InsightData) {
  if (insight.totalPenjualanHariIni === 0) {
    return "Hari ini belum ada transaksi. Coba input jualan pertama sekarang.";
  }

  return `Hari ini jualan ${insight.produkTerlaris} paling laku. Total penjualan ${insight.totalPenjualanHariIni.toLocaleString("id-ID")} dan untung ${insight.totalUntungHariIni.toLocaleString("id-ID")}.`;
}
