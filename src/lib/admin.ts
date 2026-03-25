import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export async function getRequiredAdmin() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const masterEmail = (process.env.ADMIN_MASTER_EMAIL ?? "admin@warung-os.cm").toLowerCase();
  const email = (user.email ?? "").toLowerCase();
  const isMaster = email === masterEmail;

  // Jika email cocok master, langsung anggap admin (lebih aman untuk database yang belum migrasi lengkap).
  if (isMaster) {
    return { user, role: "admin" };
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "owner";

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return { user, role };
}

