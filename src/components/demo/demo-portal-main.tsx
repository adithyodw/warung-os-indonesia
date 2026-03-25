"use client";

import Link from "next/link";
import { ExecutiveDashboard } from "@/components/demo/executive-dashboard";
import { WarungDetail } from "@/components/demo/warung-detail";
import { AiInsightsPanel } from "@/components/demo/ai-insights-panel";
import { PaymentsSimulation } from "@/components/demo/payments-simulation";
import { LendingSimulation } from "@/components/demo/lending-simulation";
import { SupplierMarketplaceDemo } from "@/components/demo/supplier-marketplace-demo";
import { WhatsAppSimulation } from "@/components/demo/whatsapp-simulation";
import { ActivityFeed } from "@/components/demo/activity-feed";
import { DemoBanner } from "@/components/demo/demo-banner";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function DemoPortalMain() {
  const { reset } = useDemoSim();

  return (
    <div className="space-y-4">
      <DemoBanner onReset={reset} />

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Warung OS Indonesia - Demo Portal</h1>
          <p className="mt-1 text-sm text-zinc-600">Simulasi operasional warung, pembiayaan, supplier, dan AI insights.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/demo/admin"
            className="rounded-2xl border bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm"
          >
            Admin overview
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <ExecutiveDashboard />
          <WarungDetail />
          <AiInsightsPanel />
        </div>
        <div className="space-y-4">
          <PaymentsSimulation />
          <LendingSimulation />
          <SupplierMarketplaceDemo />
          <WhatsAppSimulation />
        </div>
      </div>

      <ActivityFeed />
    </div>
  );
}

