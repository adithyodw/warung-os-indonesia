import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-8">
      <Card className="rounded-3xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Supabase belum dikonfigurasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-600">
          <p>
            Aplikasi membutuhkan URL project dan anon key Supabase. Tanpa itu, server akan menolak
            koneksi.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Salin <code className="rounded bg-zinc-100 px-1">.env.example</code> menjadi{" "}
              <code className="rounded bg-zinc-100 px-1">.env.local</code> di folder project.
            </li>
            <li>
              Isi minimal: <code className="rounded bg-zinc-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              dan{" "}
              <code className="rounded bg-zinc-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
              (dari Supabase → Settings → API).
            </li>
            <li>
              Hentikan lalu jalankan lagi: <code className="rounded bg-zinc-100 px-1">npm run dev</code>
            </li>
          </ol>
          <p className="text-xs">
            Alternatif: set <code className="rounded bg-zinc-100 px-1">SUPABASE_URL</code> dan{" "}
            <code className="rounded bg-zinc-100 px-1">SUPABASE_ANON_KEY</code> (tanpa{" "}
            <code className="rounded bg-zinc-100 px-1">NEXT_PUBLIC_</code>) — tetap didukung.
          </p>
          <Link href="/login" className="inline-block text-sm font-medium text-green-700 underline">
            Coba lagi setelah .env.local siap
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
