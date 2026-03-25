import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoModeEnabled } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (isDemoModeEnabled()) {
    redirect("/admin");
  }

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
