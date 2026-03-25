"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { DemoBanner } from "@/components/demo/demo-banner";
import { DemoAdminOverview } from "@/components/demo/demo-admin-overview";
import { ActivityFeed } from "@/components/demo/activity-feed";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function DemoAdminPage() {
  const { reset } = useDemoSim();

  return (
    <div className="min-h-screen space-y-6">
      {/* Top header */}
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Admin Demo Portal
          </p>
          <div className="mt-1 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-zinc-700" />
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Admin Overview</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Agregat seluruh warung dan activity log secara real-time.
          </p>
        </div>

        <Link
          href="/demo"
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>
      </div>

      <DemoBanner onReset={reset} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            Semua Warung
          </p>
          <DemoAdminOverview />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            Activity Feed
          </p>
          <ActivityFeed />
        </div>
      </div>

      <div className="rounded-3xl border bg-zinc-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Catatan</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Semua angka di halaman ini adalah simulasi real-time untuk keperluan demo. Data tidak
          tersimpan ke database. Tombol reset akan mengembalikan simulasi ke kondisi awal.
        </p>
      </div>
    </div>
  );
}
