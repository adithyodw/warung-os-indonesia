"use client";

import Link from "next/link";
import { DemoBanner } from "@/components/demo/demo-banner";
import { DemoAdminOverview } from "@/components/demo/demo-admin-overview";
import { ActivityFeed } from "@/components/demo/activity-feed";
import { useDemoSim } from "@/components/demo/demo-sim-provider";
import { Card, CardContent } from "@/components/ui/card";

export function DemoAdminPage() {
  const { reset } = useDemoSim();

  return (
    <div className="space-y-4">
      <DemoBanner onReset={reset} />

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Warung OS Indonesia - Admin Demo</h1>
          <p className="mt-1 text-sm text-zinc-600">Overview semua warung dan feed aktivitas.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/demo"
            className="rounded-2xl border bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm"
          >
            Kembali ke dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <DemoAdminOverview />
        </div>
        <ActivityFeed />
      </div>

      <Card className="rounded-3xl border bg-white/80 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-zinc-900">Catatan demo</p>
          <p className="mt-2 text-sm text-zinc-600">
            Semua angka adalah simulasi real-time untuk kebutuhan demo. Tombol reset akan mengembalikan data
            ke kondisi awal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

