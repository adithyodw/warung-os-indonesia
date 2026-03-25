import { StockManager } from "@/components/forms/stock-manager";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { getRequiredUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export default async function StokPage() {
  const user = await getRequiredUser();
  const supabase = await getServerSupabase();

  const { data } = await supabase
    .from("products")
    .select("id,user_id,name,cost_price,selling_price,stock,created_at")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const products = ((data ?? []) as Product[]).map((item) => ({
    ...item,
    cost_price: Number(item.cost_price),
    selling_price: Number(item.selling_price),
    stock: Number(item.stock),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Manajemen Stok</h1>
      <p className="text-sm text-zinc-600">Alert stok hampir habis jika stok di bawah {LOW_STOCK_THRESHOLD}.</p>
      <StockManager products={products} />
    </div>
  );
}
