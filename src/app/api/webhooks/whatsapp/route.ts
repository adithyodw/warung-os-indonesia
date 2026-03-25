import { NextResponse } from "next/server";
import { generateAssistantAnswer } from "@/lib/ai-assistant";
import { getServerSupabase } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "ok", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const text = String(message?.text?.body ?? "").trim();
    const from = String(message?.from ?? "");
    if (!text || !from) return NextResponse.json({ ok: true });

    const supabase = await getServerSupabase();
    const { data: profile } = await supabase.from("users").select("id,phone").eq("phone", from).maybeSingle();
    if (!profile?.id) {
      await sendWhatsAppMessage(from, "Nomor belum terdaftar. Silakan login dulu di Warung OS.");
      return NextResponse.json({ ok: true });
    }

    const answer = await generateAssistantAnswer(supabase, profile.id, text);
    await sendWhatsAppMessage(from, answer);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
