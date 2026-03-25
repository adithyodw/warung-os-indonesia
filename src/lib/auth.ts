import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export async function getRequiredUser() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
