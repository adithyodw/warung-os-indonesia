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

  const email = (user.email ?? "").toLowerCase();
  const envMasterEmail = (process.env.ADMIN_MASTER_EMAIL ?? "").toLowerCase().trim();
  const isMaster =
    email === (envMasterEmail || "").toLowerCase() ||
    email === "admin@warung-os.com" ||
    email === "admin@warung-os.cm";

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

