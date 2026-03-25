import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const email = (user.email ?? "").toLowerCase().trim();
    const envMasterEmail = (process.env.ADMIN_MASTER_EMAIL ?? "").toLowerCase().trim();
    const isMaster =
      (envMasterEmail && email === envMasterEmail) ||
      email === "admin@warung-os.com" ||
      email === "admin@warung-os.cm";
    const role = isMaster ? "admin" : "owner";

    await supabase.from("users").upsert({
      id: user.id,
      name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Pemilik Warung",
      phone: user.phone ?? null,
      role,
    });

    const { data: warung } = await supabase
      .from("warungs")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!warung) {
      await supabase.from("warungs").insert({
        user_id: user.id,
        name: `Warung ${user.user_metadata?.name ?? "Saya"}`,
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
