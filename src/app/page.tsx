import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
