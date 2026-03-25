import { NextResponse } from "next/server";
import { getInsightData } from "@/lib/analytics";
import { formatRupiah } from "@/lib/currency";
import { getServerSupabase } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST() {
  try {
    const supabase = await getServerSupabase();
    const { data: users } = await supabase.from("users").select("id,phone").not("phone", "is", null);
    if (!users?.length) return NextResponse.json({ ok: true, sent: 0 });

    let sent = 0;
    for (const user of users) {
      const insight = await getInsightData(supabase, user.id);
      const { data: dueRepayment } = await supabase
        .from("loan_repayments")
        .select("amount,due_date")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .lte("due_date", new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
        .order("due_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      const message =
        `Laporan warung hari ini:\n` +
        `• Penjualan: ${formatRupiah(insight.totalPenjualanHariIni)}\n` +
        `• Untung: ${formatRupiah(insight.totalUntungHariIni)}\n` +
        `• Produk terlaris: ${insight.produkTerlaris}` +
        (dueRepayment
          ? `\n• Reminder pinjaman: bayar ${formatRupiah(Number(dueRepayment.amount))} sebelum ${dueRepayment.due_date}`
          : "");
      const result = await sendWhatsAppMessage(String(user.phone), message);
      if (result.ok) sent++;
    }

    return NextResponse.json({ ok: true, sent });
  } catch (error) {
    console.error("Daily report error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
