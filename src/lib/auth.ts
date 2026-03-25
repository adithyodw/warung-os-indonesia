import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getDemoUser, isDemoModeEnabled } from "@/lib/demo";

export async function getRequiredUser() {
  if (isDemoModeEnabled()) {
    return getDemoUser();
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
