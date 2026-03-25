import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const callbackToken = request.headers.get("x-callback-token");
    const expected = process.env.XENDIT_WEBHOOK_TOKEN;
    if (expected && callbackToken !== expected) {
      return NextResponse.json({ message: "Unauthorized webhook." }, { status: 401 });
    }

    const payload = await request.json();
    const externalId = String(payload.external_id ?? "");
    const status = String(payload.status ?? "PENDING").toLowerCase();
    const paidAmount = Number(payload.paid_amount ?? payload.amount ?? 0);

    if (!externalId) {
      return NextResponse.json({ message: "No external_id." }, { status: 400 });
    }

    const supabase = await getServerSupabase();
    const { data: payment } = await supabase
      .from("payments")
      .select("id,user_id")
      .eq("reference", externalId)
      .maybeSingle();
    if (!payment) return NextResponse.json({ ok: true, message: "Payment not found." });

    await supabase
      .from("payments")
      .update({ status, amount: paidAmount, raw_payload: payload, updated_at: new Date().toISOString() })
      .eq("id", payment.id);

    if (status === "paid") {
      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("payment_id", payment.id)
        .eq("user_id", payment.user_id);

      const { data: profile } = await supabase
        .from("users")
        .select("phone")
        .eq("id", payment.user_id)
        .maybeSingle();
      if (profile?.phone) {
        await sendWhatsAppMessage(profile.phone, `Pembayaran masuk ✅ sebesar Rp${paidAmount.toLocaleString("id-ID")}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Xendit webhook error:", error);
    return NextResponse.json({ message: "Webhook gagal diproses." }, { status: 500 });
  }
}
