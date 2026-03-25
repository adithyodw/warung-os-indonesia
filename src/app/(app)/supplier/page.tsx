import { SupplierMarketplace } from "@/components/forms/supplier-marketplace";
import { getRequiredUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import type { SupplierProduct } from "@/lib/types";

export default async function SupplierPage() {
  const user = await getRequiredUser();
  const supabase = await getServerSupabase();

  const { data: rows } = await supabase
    .from("supplier_products")
    .select(
      "id,supplier_id,name,category,price,min_order_qty,stock_available,suppliers(name,city)",
    )
    .order("name", { ascending: true })
    .limit(50);

  const products = ((rows ?? []) as Array<
    SupplierProduct & { suppliers?: { name?: string; city?: string } | null }
  >).map((row) => ({
    ...row,
    price: Number(row.price),
    min_order_qty: Number(row.min_order_qty),
    stock_available: Number(row.stock_available),
    supplier_name: row.suppliers?.name ?? "Supplier",
    supplier_city: row.suppliers?.city ?? "-",
  }));

  const { data: orders } = await supabase
    .from("orders")
    .select("id,total_amount,status,payment_method,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Supplier Marketplace</h1>
      <p className="text-sm text-zinc-600">Bandingkan harga supplier dan restock sekarang.</p>
      <SupplierMarketplace products={products} orders={orders ?? []} />
    </div>
  );
}
