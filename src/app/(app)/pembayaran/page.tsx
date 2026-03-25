import { PaymentCenter } from "@/components/forms/payment-center";
import { getRequiredUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function PembayaranPage() {
  const user = await getRequiredUser();
  const supabase = await getServerSupabase();

  const { data: payments } = await supabase
    .from("payments")
    .select("id,reference,type,provider,status,amount,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Pembayaran</h1>
      <p className="text-sm text-zinc-600">Buat pembayaran QRIS atau Virtual Account dalam 1 tap.</p>
      <PaymentCenter payments={payments ?? []} />
    </div>
  );
}
