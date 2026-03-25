import { LogOut, Store } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { getRequiredUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getRequiredUser();
  const displayName = user.user_metadata?.name ?? user.email ?? "Pemilik Warung";

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-zinc-100 pb-24">
      <header className="sticky top-0 z-30 border-b bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="flex items-center gap-2 text-sm text-zinc-500">
              <Store className="h-4 w-4" />
              Warung OS
            </p>
            <p className="truncate text-base font-semibold">{displayName}</p>
          </div>
          <form action={signOutAction}>
            <Button variant="outline" size="sm" className="rounded-xl">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </form>
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
