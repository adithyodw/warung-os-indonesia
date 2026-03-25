import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <div className="w-full">
        <h1 className="mb-2 text-center text-3xl font-bold">Warung OS Indonesia</h1>
        <p className="mb-6 text-center text-zinc-600">Catat jualan, cek untung, pantau stok.</p>
        <LoginForm />
      </div>
    </main>
  );
}
