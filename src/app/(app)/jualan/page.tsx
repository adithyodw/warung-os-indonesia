import { SaleForm } from "@/components/forms/sale-form";
import { getRequiredUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export default async function JualanPage() {
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
      <h1 className="text-xl font-bold">Tambah Jualan</h1>
      <p className="text-sm text-zinc-600">Tap produk untuk tambah jumlah, atau input manual.</p>
      <SaleForm products={products} />
    </div>
  );
}
