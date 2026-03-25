import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { buildPaymentDescription, createXenditInvoice } from "@/lib/payments";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body?.amount ?? 0);
    const method = String(body?.method ?? "qris");
    const context = (body?.context as "loan" | "order") ?? "order";
    const payerEmail = String(body?.payerEmail ?? "owner@warung.id");
    const orderId = String(body?.orderId ?? "");

    if (!amount || amount < 1000) {
      return NextResponse.json({ message: "Nominal minimal Rp1.000." }, { status: 400 });
    }

    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const reference = `WRG-${Date.now()}`;
    const invoice = await createXenditInvoice({
      externalId: reference,
      amount,
      payerEmail,
      description: buildPaymentDescription(context, amount),
    });
    if (!invoice.ok) return NextResponse.json({ message: invoice.message }, { status: 400 });

    const { data: payment } = await supabase
      .from("payments")
      .insert({
      user_id: user.id,
      reference,
      type: method,
      provider: "xendit",
      amount,
      status: "pending",
      external_id: invoice.data.id,
      raw_payload: invoice.data,
    })
      .select("id")
      .single();

    if (orderId && payment?.id) {
      await supabase.from("orders").update({ payment_id: payment.id }).eq("id", orderId).eq("user_id", user.id);
    }

    return NextResponse.json({
      ok: true,
      reference,
      invoiceUrl: invoice.data.invoice_url,
      paymentId: invoice.data.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membuat invoice." }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({
    service: "payments-create-invoice",
    health: "ok",
    nonce: randomUUID(),
  });
}
