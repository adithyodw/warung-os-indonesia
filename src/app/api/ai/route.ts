import { NextResponse } from "next/server";
import { generateAssistantAnswer } from "@/lib/ai-assistant";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ answer: "Sesi habis. Silakan login lagi." }, { status: 401 });
    }

    const answer = await generateAssistantAnswer(supabase, user.id, String(prompt ?? ""));
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({ answer: "Maaf, AI sedang error. Coba lagi ya." }, { status: 500 });
  }
}
